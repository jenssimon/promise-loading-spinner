export interface LoaderConfig {
  /**
   * Time (ms) until spinner will show up to handle short operations without a spinner.
   */
  delay: number;

  /**
   * Time (ms) to wait until last promise is resolved to enable multiple operations in a sequence
   * without a "flickering" spinner.
   */
  closeDelay: number;

  /**
   * Delay (ms) after loader initialization to suppress spinners on page load.
   */
  initDelay: number;

  /**
   * The element which represents the spinner.
   * Can be used with an element or a selector string.
   */
  loaderElement: HTMLElement | string;

  /**
   * Class name used to show the spinner.
   */
  classActive: string;
}

/**
 * Call options for the public API functions that add a promise.
 */
export interface LoaderCallOptions {
  /**
   * Skip all delays (initDelay, delay).
   */
  skipDelays: boolean;
}

/**
 * Default config.
 */
const defaults: LoaderConfig = {
  delay: 300,
  closeDelay: 10,
  initDelay: 1000,
  loaderElement: '#js-page-loader',
  classActive: 'is-active',
};

/**
 * Advanced handling of loaders/spinners based on one or multiple Promises.
 */
export default class Loader {
  /**
   * Contains all promises that aren't settled.
   */
  private loaderPromises: Promise<unknown>[] = [];

  /**
   * The configuration of the loader.
   */
  private config: LoaderConfig;

  /**
   * The attached DOM element which represents the loader.
   */
  private el: HTMLElement;

  /**
   * The timeout handle for the initial suppression of the loader.
   */
  private initSuppressTimeout: NodeJS.Timeout | undefined;

  /**
   * The timeout handle for the delay before showing the loader.
   */
  private timeout: NodeJS.Timeout | undefined;

  /**
   * The timeout handle for the closing delay.
   */
  private closingTimeout: NodeJS.Timeout | undefined;

  /**
   * Is the loader currently shown?
   */
  protected loaderShows = false;

  /**
   * Resolver function used to resolve the currentLoadingPromise promise after the loader get hidden.
   */
  private loaderShownResolver?: (
    value?: Promise<unknown>[] | PromiseLike<Promise<unknown>[]> | undefined
  ) => void | undefined;

  /**
   * The promises for which the loader currently shows up.
   */
  private promisesForShownLoader: Promise<unknown>[] = [];

  /**
   * A promise that resolves after the loader get hidden.
   */
  public currentLoadingPromise: Promise<Promise<unknown>[]> = Promise.resolve([]);

  /**
   * Constructor.
   *
   * @param cfg configuration of the loader (optional)
   */
  public constructor(cfg: Partial<LoaderConfig> = {}) {
    this.setCurrentLoadingPromise();
    const config = { ...defaults, ...cfg };
    const { loaderElement, initDelay } = config;
    this.config = config;

    this.el = loaderElement instanceof HTMLElement
      ? loaderElement : document.querySelector(loaderElement) as HTMLElement;

    if (!this.el) throw new Error('Element not found');

    // suppress loader in a short timeframe after initializing (page load)
    this.initSuppressTimeout = setTimeout(() => this.stopSuppressLoading(), initDelay);
  }

  /**
   * Add a promise to the loader.
   *
   * @param promise a promise
   * @param options options for this promise (optional)
   * @returns the used promise
   */
  public loader<T>(promise: Promise<T>, options?: Partial<LoaderCallOptions>): Promise<T> {
    const skipDelays = options?.skipDelays ?? false;
    if ((!this.initSuppressTimeout || skipDelays)) {
      if (this.initSuppressTimeout && skipDelays) this.stopSuppressLoading();

      const isFirstLoader = this.loaderPromises.length === 0;

      this.loaderPromises.push(promise);
      if (this.loaderShows) this.promisesForShownLoader.push(promise);

      if (isFirstLoader) { // Only the first loader needs to initialize the show functionality
        this.showLoader(skipDelays);
      }

      this.handlePromise(promise);
    }
    return promise;
  }

  /**
   * Returns a function that wraps the loader functionality around a function call.
   *
   * @param fnc A function performing some async operation
   * @param options options for the operation (optional)
   * @returns a function that wraps the loader functionality around a function call
   */
  public wrapFunction<C, A extends never[], R>(
    fnc: (this: C, ...args: A) => Promise<R>,
    options?: Partial<LoaderCallOptions>,
  ): (this: C, ...args: A) => Promise<R> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const loaderCtx = this;

    return function (this: C, ...args: A): Promise<R> {
      return loaderCtx.loader(fnc.apply(this, args), options);
    };
  }

  /**
   * A decorator for methods that wraps loader functionality around a function call.
   * @param options options for the operation (optional)
   * @returns a decorator for methods that wraps loader functionality around a function call.
   */
  public decorator(options?: Partial<LoaderCallOptions>): MethodDecorator {
    const loaderCtx = this; // eslint-disable-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment

    return function (target, propertyKey, descriptor) {
      const oldValue = descriptor.value;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      (descriptor as any).value = function (...params: never[]) {
        return loaderCtx.loader((oldValue as any).apply(this, params), options);
      };
      /* eslint-enable @typescript-eslint/no-explicit-any */
    };
  }

  /**
   * Stops initial loader suppresion
   */
  private stopSuppressLoading() {
    clearTimeout(this.initSuppressTimeout as NodeJS.Timeout);
    this.initSuppressTimeout = undefined;
  }

  /**
   * Create the promise for the currently shown loader.
   */
  private setCurrentLoadingPromise() {
    this.currentLoadingPromise = new Promise((resolve) => {
      this.loaderShownResolver = resolve as (
        value?: Promise<unknown>[] | PromiseLike<Promise<unknown>[]> | undefined) => void;
    });
  }

  /**
   * Show or hide the loader.
   *
   * @param visible is the loader visible?
   */
  private setLoaderVisibility(visible: boolean) {
    this.el.classList[visible ? 'add' : 'remove'](this.config.classActive);
    this.loaderShows = visible;

    if (visible) {
      this.promisesForShownLoader.push(...this.loaderPromises);
    } else {
      /* istanbul ignore else */
      if (this.loaderShownResolver) {
        this.loaderShownResolver(this.promisesForShownLoader.splice(0, this.promisesForShownLoader.length));
      }
      this.setCurrentLoadingPromise();
    }
  }

  /**
   * Wait for promise to fulfill or reject and check if the loader can hide.
   *
   * @param promise the promise to process
   */
  private async handlePromise<T>(promise: Promise<T>) {
    try {
      await promise;
    } catch {
      // nothing to do
    }

    const { timeout, loaderPromises, config } = this;
    if (timeout && loaderPromises.length === 1) {
      // We close the last operation before the loader was shown. There is no need anymore to show it.
      clearTimeout(timeout);
      this.timeout = undefined;
    }
    loaderPromises.splice(loaderPromises.indexOf(promise), 1);
    if (loaderPromises.length === 0) {
      // The last operation has finished. Show loader a bit longer so there is no flickering when an operation
      // starts shortly after.
      this.closingTimeout = setTimeout(() => {
        this.setLoaderVisibility(false);
        this.closingTimeout = undefined;
      }, config.closeDelay);
    }
  }

  /**
   * Show the loader. Also adds the loader delay.
   *
   * @param skipDelays skip delays?
   */
  private showLoader(skipDelays: boolean) {
    if (this.closingTimeout) {
      // Another operation finished shortly before. To avoid flickering the loader closes later.
      // But here we don't need to close it because another operation starts.
      clearTimeout(this.closingTimeout);
      this.closingTimeout = undefined;
    } else if (skipDelays) {
      this.setLoaderVisibility(true);
    } else {
      // Show loader after a delay. For operation that are finished fast enough no loader is shown.
      this.timeout = setTimeout(() => {
        this.setLoaderVisibility(true);
        this.timeout = undefined;
      }, this.config.delay);
    }
  }
}
