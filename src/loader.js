const defaults = {
  delay: 300, // delay before the loader is shown
  closeDelay: 10, // delay before the loader closes
  initDelay: 1000, // ignore loaders after a limited time after initialization
  loaderElement: '#js-page-loader',
  classActive: 'is-active',
};

export default class Loader {
  loaderPromises = []

  constructor(cfg = {}) {
    const config = { ...defaults, ...cfg };
    const { loaderElement, initDelay } = config;
    this.config = config;

    this.el = loaderElement instanceof HTMLElement ? loaderElement : document.querySelector(loaderElement);
    if (initDelay) {
      this.suppressOnInit = true;
      setTimeout(() => {
        this.suppressOnInit = false;
      }, initDelay);
    }
  }

  loader(promise) {
    const {
      el, suppressOnInit, loaderPromises, config,
    } = this;
    const { classActive, delay, closeDelay } = config;
    if (!suppressOnInit && el) {
      const isFirstLoader = !loaderPromises.length;
      loaderPromises.push(promise);

      const showLoader = () => {
        el.classList.add(classActive);
      };

      if (isFirstLoader) { // Only the first loader needs to initialize the show functionality
        if (!this.closingTimeout) {
          if (delay) {
            // Show loader after a delay. For operation that are finished fast enough no loader is shown.
            this.timeout = setTimeout(() => {
              showLoader();
              this.timeout = null;
            }, delay);
          } else {
            showLoader();
          }
        } else {
          // Another operation finished shortly before. To avoid flickering the loader closes later.
          // But here we don't need to close it because another operation starts.
          clearTimeout(this.closingTimeout);
          this.closingTimeout = null;
        }
      }
      const finished = () => {
        if (this.timeout && loaderPromises.length === 1) {
          // We close the last operation before the loader was shown. There is no need anymore to show it.
          clearTimeout(this.timeout);
          this.timeout = null;
        }
        loaderPromises.splice(loaderPromises.indexOf(promise), 1);
        if (!loaderPromises.length) {
          if (closeDelay) {
            // The last operation has finished. Show loader a bit longer so there is no flickering when an operation
            // starts shortly after.
            this.closingTimeout = setTimeout(() => {
              el.classList.remove(classActive);
              this.closingTimeout = null;
            }, closeDelay);
          } else {
            el.classList.remove(classActive);
          }
        }
      };
      promise.then(finished, finished);
    }
    return promise;
  }

  loaderFnc(fnc) {
    const loaderCtx = this;
    return async function (...args) {
      return loaderCtx.loader(fnc.apply(this, args));
    };
  }
}
