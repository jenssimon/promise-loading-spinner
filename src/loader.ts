export interface LoaderConfig {
  delay: number;
  closeDelay: number;
  initDelay: number;
  loaderElement: HTMLElement | string;
  classActive: string;
}

type LoaderPromise = Promise<unknown>;

type LoaderShownPromise = Promise<LoaderPromise[]>;

const defaults: LoaderConfig = {
  delay: 300, // delay before the loader is shown
  closeDelay: 10, // delay before the loader closes
  initDelay: 1000, // ignore loaders after a limited time after initialization
  loaderElement: '#js-page-loader',
  classActive: 'is-active',
};

export default class Loader {
  private loaderPromises: LoaderPromise[]

  private config: LoaderConfig

  private el: HTMLElement

  private suppressOnInit: boolean

  private timeout: NodeJS.Timeout | null

  private closingTimeout: NodeJS.Timeout | null

  protected loaderShows: boolean

  private loaderShownResolver: (value?: LoaderPromise[] | PromiseLike<LoaderPromise[]> | undefined) => void

  private promisesForShownLoader: LoaderPromise[]

  public currentLoadingPromise: Promise<LoaderPromise[]>

  constructor(cfg: Partial<LoaderConfig> = {}) {
    this.loaderPromises = [];
    this.suppressOnInit = false;
    this.timeout = null;
    this.closingTimeout = null;
    this.loaderShows = false;
    this.promisesForShownLoader = [];
    this.loaderShownResolver = ((null as unknown) as
      (value?: LoaderPromise[] | PromiseLike<LoaderPromise[]> | undefined) => void);
    this.currentLoadingPromise = Promise.resolve([]);
    this.setCurrentLoadingPromise();

    const config = { ...defaults, ...cfg };
    const { loaderElement, initDelay } = config;
    this.config = config;

    this.el = loaderElement instanceof HTMLElement
      ? loaderElement : document.querySelector(loaderElement) as HTMLElement;
    this.suppressOnInit = true;
    setTimeout(() => {
      this.suppressOnInit = false;
    }, initDelay);
  }

  private setCurrentLoadingPromise() {
    this.currentLoadingPromise = new Promise((resolve) => {
      this.loaderShownResolver = resolve;
    });
  }

  loader<T>(promise: Promise<T>): Promise<T> {
    const {
      el, suppressOnInit, loaderPromises, config,
    } = this;
    const { classActive, delay, closeDelay } = config;
    if (!suppressOnInit && el) {
      const isFirstLoader = !loaderPromises.length;
      loaderPromises.push(promise);
      if (this.loaderShows) {
        this.promisesForShownLoader.push(promise);
      }

      const showLoader = (): void => {
        el.classList.add(classActive);
        this.loaderShows = true;
        this.promisesForShownLoader.push(...loaderPromises);
      };

      const hideLoader = (): void => {
        el.classList.remove(classActive);
        this.loaderShows = false;
        this.loaderShownResolver(this.promisesForShownLoader.splice(0, this.promisesForShownLoader.length));
        this.setCurrentLoadingPromise();
      };

      if (isFirstLoader) { // Only the first loader needs to initialize the show functionality
        if (!this.closingTimeout) {
          // Show loader after a delay. For operation that are finished fast enough no loader is shown.
          this.timeout = setTimeout(() => {
            showLoader();
            this.timeout = null;
          }, delay);
        } else {
          // Another operation finished shortly before. To avoid flickering the loader closes later.
          // But here we don't need to close it because another operation starts.
          clearTimeout(this.closingTimeout);
          this.closingTimeout = null;
        }
      }
      const finished = (): void => {
        if (this.timeout && loaderPromises.length === 1) {
          // We close the last operation before the loader was shown. There is no need anymore to show it.
          clearTimeout(this.timeout);
          this.timeout = null;
        }
        loaderPromises.splice(loaderPromises.indexOf(promise), 1);
        if (!loaderPromises.length) {
          // The last operation has finished. Show loader a bit longer so there is no flickering when an operation
          // starts shortly after.
          this.closingTimeout = setTimeout(() => {
            hideLoader();
            this.closingTimeout = null;
          }, closeDelay);
        }
      };
      promise.then(finished, finished);
    }
    return promise;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapFunction<C, A extends any[], R>(fnc: (this: C, ...args: A) => Promise<R>): (this: C,
    ...args: A) => Promise<R> {
    const loaderCtx = this; // eslint-disable-line @typescript-eslint/no-this-alias

    return function (this: C, ...args: A): Promise<R> {
      return loaderCtx.loader(fnc.apply(this, args));
    };
  }

  decorator(): MethodDecorator {
    const loaderCtx = this; // eslint-disable-line @typescript-eslint/no-this-alias
    const decorator: MethodDecorator = function (target, propertyKey, descriptor) {
      const oldValue = descriptor.value as unknown;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (descriptor as any).value = function (...params: any[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return loaderCtx.loader((oldValue as any).apply(this, params));
      };
    };
    return decorator;
  }
}
