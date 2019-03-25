import Loader from './loader';

jest.useFakeTimers();

describe('Vanilla Promise Loader', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="js-page-loader"></div><div id="alternativeElement"></div>';
  });

  describe('default configuration', () => {
    it('handles a single promise (success)', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader(); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promiseResolver;
      const promise = new Promise((resolve) => {
        promiseResolver = resolve;
      });

      const passedThroughPromise = loader.loader(promise); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      promiseResolver('success'); // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('handles a single promise (error)', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader(); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promiseRejecter;
      const promise = new Promise((resolve, reject) => {
        promiseRejecter = reject;
      });

      const passedThroughPromise = loader.loader(promise); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      promiseRejecter('error'); // promise resolves
      await expect(passedThroughPromise).rejects.toBe('error');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('handles a promise that resolves in the delay phase)', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader(); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promiseResolver;
      const promise = new Promise((resolve) => {
        promiseResolver = resolve;
      });

      const passedThroughPromise = loader.loader(promise); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      promiseResolver('success'); // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success');

      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('does\'t show a loader directly at page load (init delay)', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader(); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      // Prepare the promise to pass into
      let promiseResolver;
      const promise = new Promise((resolve) => {
        promiseResolver = resolve;
      });

      const passedThroughPromise = loader.loader(promise); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      // for the case init delay and delay timeouts are set
      jest.runAllTimers();
      expect(loaderElement.classList.contains('is-active')).toBe(false);
      jest.runAllTimers();
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      promiseResolver('success'); // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success');

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('processes two promises (added second in delay phase)', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader(); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promise1Resolver;
      const promise1 = new Promise((resolve) => {
        promise1Resolver = resolve;
      });
      let promise2Resolver;
      const promise2 = new Promise((resolve) => {
        promise2Resolver = resolve;
      });

      const passedThroughPromise1 = loader.loader(promise1); // call the loader

      expect(passedThroughPromise1).toEqual(promise1); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      const passedThroughPromise2 = loader.loader(promise2);

      expect(passedThroughPromise2).toEqual(promise1); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      promise1Resolver('success1'); // promise resolves
      await expect(passedThroughPromise1).resolves.toBe('success1');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // no timer should run, just to be sure

      promise2Resolver('success2'); // resolve promise
      await expect(passedThroughPromise2).resolves.toBe('success2');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('processes two promises (added second after delay phase)', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader(); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promise1Resolver;
      const promise1 = new Promise((resolve) => {
        promise1Resolver = resolve;
      });
      let promise2Resolver;
      const promise2 = new Promise((resolve) => {
        promise2Resolver = resolve;
      });

      const passedThroughPromise1 = loader.loader(promise1); // call the loader

      expect(passedThroughPromise1).toEqual(promise1); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      const passedThroughPromise2 = loader.loader(promise2);

      expect(passedThroughPromise2).toEqual(promise2); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(true);

      promise1Resolver('success1'); // promise resolves
      await expect(passedThroughPromise1).resolves.toBe('success1');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // no timer should run, just to be sure

      promise2Resolver('success2'); // resolve promise
      await expect(passedThroughPromise2).resolves.toBe('success2');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('processes two promises (added second directly after resolving first)', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader(); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promise1Resolver;
      const promise1 = new Promise((resolve) => {
        promise1Resolver = resolve;
      });
      let promise2Resolver;
      const promise2 = new Promise((resolve) => {
        promise2Resolver = resolve;
      });

      const passedThroughPromise1 = loader.loader(promise1); // call the loader

      expect(passedThroughPromise1).toEqual(promise1); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      promise1Resolver('success1'); // promise resolves
      await expect(passedThroughPromise1).resolves.toBe('success1');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      const passedThroughPromise2 = loader.loader(promise2);

      expect(passedThroughPromise2).toEqual(promise2); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // no timer should run, just to be sure

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      promise2Resolver('success2'); // resolve promise
      await expect(passedThroughPromise2).resolves.toBe('success2');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('processes two promises (added second after close delay)', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader(); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promise1Resolver;
      const promise1 = new Promise((resolve) => {
        promise1Resolver = resolve;
      });
      let promise2Resolver;
      const promise2 = new Promise((resolve) => {
        promise2Resolver = resolve;
      });

      const passedThroughPromise1 = loader.loader(promise1); // call the loader

      expect(passedThroughPromise1).toEqual(promise1); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // no timer should run, just to be sure

      promise1Resolver('success1'); // promise resolves
      await expect(passedThroughPromise1).resolves.toBe('success1');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);

      const passedThroughPromise2 = loader.loader(promise2);

      expect(passedThroughPromise2).toEqual(promise2); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // no timer should run, just to be sure

      promise2Resolver('success2'); // promise resolves
      await expect(passedThroughPromise2).resolves.toBe('success2');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });
  });

  describe('Configuration object', () => {
    it('uses a selector for looking up the loader element', async () => {
      const loaderElement = document.getElementById('js-page-loader');
      const alternativeElement = document.getElementById('alternativeElement');

      const loader = new Loader({
        loaderElement: '#alternativeElement',
      }); // Initialize the loader

      // Loader is initialized
      expect(alternativeElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promiseResolver;
      const promise = new Promise((resolve) => {
        promiseResolver = resolve;
      });

      const passedThroughPromise = loader.loader(promise); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?
      expect(alternativeElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(alternativeElement.classList.contains('is-active')).toBe(true);
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      promiseResolver('success'); // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success');

      expect(alternativeElement.classList.contains('is-active')).toBe(true);
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // close delay expired

      expect(alternativeElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('uses an element instance for the loader element', async () => {
      const loaderElement = document.getElementById('js-page-loader');
      const alternativeElement = document.getElementById('alternativeElement');

      const loader = new Loader({
        loaderElement: alternativeElement,
      }); // Initialize the loader

      // Loader is initialized
      expect(alternativeElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promiseResolver;
      const promise = new Promise((resolve) => {
        promiseResolver = resolve;
      });

      const passedThroughPromise = loader.loader(promise); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?
      expect(alternativeElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(alternativeElement.classList.contains('is-active')).toBe(true);
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      promiseResolver('success'); // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success');

      expect(alternativeElement.classList.contains('is-active')).toBe(true);
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // close delay expired

      expect(alternativeElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('uses another class name for the active class', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader({
        classActive: 'loading',
      }); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('loading')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promiseResolver;
      const promise = new Promise((resolve) => {
        promiseResolver = resolve;
      });

      const passedThroughPromise = loader.loader(promise); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('loading')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('loading')).toBe(true);

      promiseResolver('success'); // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success');

      expect(loaderElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('loading')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
      expect(loaderElement.classList.contains('loading')).toBe(false);
    });

    it('can disable loader delay', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader({
        delay: 0,
      }); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promiseResolver;
      const promise = new Promise((resolve) => {
        promiseResolver = resolve;
      });

      const passedThroughPromise = loader.loader(promise); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(true);

      promiseResolver('success'); // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('can disable the init delay', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader({ // Initialize the loader
        initDelay: 0,
      });

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      // Prepare the promise to pass into
      let promiseResolver;
      const promise = new Promise((resolve) => {
        promiseResolver = resolve;
      });

      const passedThroughPromise = loader.loader(promise); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      promiseResolver('success'); // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });

    it('can disable the close delay', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader({ // Initialize the loader
        closeDelay: 0,
      });

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promiseResolver;
      const promise = new Promise((resolve) => {
        promiseResolver = resolve;
      });

      const passedThroughPromise = loader.loader(promise); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      promiseResolver('success'); // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success');

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });
  });

  describe('loaderFnc', () => {
    it('can export a function wrapper', async () => {
      const loaderElement = document.getElementById('js-page-loader');

      const loader = new Loader(); // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // init delay expired

      // Prepare the promise to pass into
      let promiseResolver;
      const promise = new Promise((resolve) => {
        promiseResolver = resolve;
      });

      const fn = jest.fn(function () {
        expect(this).toBe('Hello');
        return promise;
      });

      const loaderFunction = loader.loaderFnc(fn.bind('Hello'));

      expect(fn.mock.calls).toHaveLength(0);

      const passedThroughPromise = loaderFunction('foo', ['foo', 'bar'], { foo: 'bar' }); // call the loader

      expect(passedThroughPromise).toEqual(promise); // is the returned promise the same as the passed in?

      expect(fn.mock.calls).toHaveLength(1);
      expect(fn.mock.calls[0]).toHaveLength(3);
      expect(fn.mock.calls[0][0]).toBe('foo');
      expect(fn.mock.calls[0][1]).toStrictEqual(['foo', 'bar']);
      expect(fn.mock.calls[0][2]).toStrictEqual({ foo: 'bar' });

      expect(loaderElement.classList.contains('is-active')).toBe(false);

      jest.runAllTimers(); // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      promiseResolver('success'); // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success');

      expect(loaderElement.classList.contains('is-active')).toBe(true);

      jest.runAllTimers(); // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false);
    });
  });
});
