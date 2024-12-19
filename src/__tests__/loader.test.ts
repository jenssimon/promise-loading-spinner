import {
  beforeEach, describe, expect, it, vi,
} from 'vitest'

import { signal } from '@preact/signals-core'

import Loader from '../loader.js'


type PromiseResolver = (value?: unknown) => void;
type PromiseRejecter = (reason?: unknown) => unknown;

const promiseResolverStub: PromiseResolver = () => {}
const promiseRejecterStub: PromiseRejecter = () => {}

vi.useFakeTimers()

describe('promise-loading-spinner', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="js-page-loader"></div><div id="alternativeElement"></div>'
  })

  describe('default configuration', () => {
    it('handles a single promise (success)', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('handles a single promise (error)', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseRejecter = promiseRejecterStub
      const promise = new Promise<string>((resolve, reject) => {
        promiseRejecter = reject
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      promiseRejecter('error') // promise resolves
      await expect(passedThroughPromise).rejects.toBe('error')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('handles a promise that resolves in the delay phase)', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('does\'t show a loader directly at page load (init delay)', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      // for the case init delay and delay timeouts are set
      vi.runAllTimers()
      expect(loaderElement.classList.contains('is-active')).toBe(false)
      vi.runAllTimers()
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('forces a loader directly at page load (init delay)', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise, { skipDelays: true }) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(true)

      // for the case init delay and delay timeouts are set
      // vi.runAllTimers();
      /* expect(loaderElement.classList.contains('is-active')).toBe(false);
      vi.runAllTimers();
      expect(loaderElement.classList.contains('is-active')).toBe(false); */

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      vi.runAllTimers()

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('processes two promises (added second in delay phase)', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promise1Resolver = promiseResolverStub
      const promise1 = new Promise<string>((resolve) => {
        promise1Resolver = resolve as PromiseResolver
      })
      let promise2Resolver = promiseResolverStub
      const promise2 = new Promise<string>((resolve) => {
        promise2Resolver = resolve as PromiseResolver
      })

      const passedThroughPromise1 = loader.loader(promise1) // call the loader

      expect(passedThroughPromise1).toStrictEqual(promise1) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      const passedThroughPromise2 = loader.loader(promise2)

      expect(passedThroughPromise2).toStrictEqual(promise1) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      promise1Resolver('success1') // promise resolves
      await expect(passedThroughPromise1).resolves.toBe('success1')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // no timer should run, just to be sure

      promise2Resolver('success2') // resolve promise
      await expect(passedThroughPromise2).resolves.toBe('success2')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('processes two promises (added second after delay phase)', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promise1Resolver = promiseResolverStub
      const promise1 = new Promise<string>((resolve) => {
        promise1Resolver = resolve as PromiseResolver
      })
      let promise2Resolver = promiseResolverStub
      const promise2 = new Promise<string>((resolve) => {
        promise2Resolver = resolve as PromiseResolver
      })

      const passedThroughPromise1 = loader.loader(promise1) // call the loader

      expect(passedThroughPromise1).toStrictEqual(promise1) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      const passedThroughPromise2 = loader.loader(promise2)

      expect(passedThroughPromise2).toStrictEqual(promise2) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(true)

      promise1Resolver('success1') // promise resolves
      await expect(passedThroughPromise1).resolves.toBe('success1')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // no timer should run, just to be sure

      promise2Resolver('success2') // resolve promise
      await expect(passedThroughPromise2).resolves.toBe('success2')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('processes two promises (added second directly after resolving first)', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promise1Resolver = promiseResolverStub
      const promise1 = new Promise<string>((resolve) => {
        promise1Resolver = resolve as PromiseResolver
      })
      let promise2Resolver = promiseResolverStub
      const promise2 = new Promise<string>((resolve) => {
        promise2Resolver = resolve as PromiseResolver
      })

      const passedThroughPromise1 = loader.loader(promise1) // call the loader

      expect(passedThroughPromise1).toStrictEqual(promise1) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      promise1Resolver('success1') // promise resolves
      await expect(passedThroughPromise1).resolves.toBe('success1')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      const passedThroughPromise2 = loader.loader(promise2)

      expect(passedThroughPromise2).toStrictEqual(promise2) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // no timer should run, just to be sure

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      promise2Resolver('success2') // resolve promise
      await expect(passedThroughPromise2).resolves.toBe('success2')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('processes two promises (added second after close delay)', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promise1Resolver = promiseResolverStub
      const promise1 = new Promise<string>((resolve) => {
        promise1Resolver = resolve as PromiseResolver
      })
      let promise2Resolver = promiseResolverStub
      const promise2 = new Promise<string>((resolve) => {
        promise2Resolver = resolve as PromiseResolver
      })

      const passedThroughPromise1 = loader.loader(promise1) // call the loader

      expect(passedThroughPromise1).toStrictEqual(promise1) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // no timer should run, just to be sure

      promise1Resolver('success1') // promise resolves
      await expect(passedThroughPromise1).resolves.toBe('success1')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)

      const passedThroughPromise2 = loader.loader(promise2)

      expect(passedThroughPromise2).toStrictEqual(promise2) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // no timer should run, just to be sure

      promise2Resolver('success2') // promise resolves
      await expect(passedThroughPromise2).resolves.toBe('success2')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })
  })

  describe('Configuration object', () => {
    it('uses a selector for looking up the loader element', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement
      const alternativeElement = document.querySelector('#alternativeElement') as HTMLElement

      const loader = new Loader({
        loaderElement: '#alternativeElement',
      }) // Initialize the loader

      // Loader is initialized
      expect(alternativeElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(alternativeElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(alternativeElement.classList.contains('is-active')).toBe(true)
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      expect(alternativeElement.classList.contains('is-active')).toBe(true)
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // close delay expired

      expect(alternativeElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('uses an element instance for the loader element', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement
      const alternativeElement = document.querySelector('#alternativeElement') as HTMLElement

      const loader = new Loader({
        loaderElement: alternativeElement,
      }) // Initialize the loader

      // Loader is initialized
      expect(alternativeElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(alternativeElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(alternativeElement.classList.contains('is-active')).toBe(true)
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      expect(alternativeElement.classList.contains('is-active')).toBe(true)
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // close delay expired

      expect(alternativeElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('throws an error if the selector returns no result', () => {
      expect(() => new Loader({
        loaderElement: '.foo',
      })).toThrow('Element not found')
    })

    it('uses another class name for the active class', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader({
        classActive: 'loading',
      }) // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('loading')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('loading')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('loading')).toBe(true)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      expect(loaderElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('loading')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
      expect(loaderElement.classList.contains('loading')).toBe(false)
    })

    it('can disable loader delay', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader({
        delay: 0,
      }) // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      vi.runAllTimers()

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(true)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('can disable the init delay', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader({ // Initialize the loader
        initDelay: 0,
      })

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it('can disable the close delay', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader({ // Initialize the loader
        closeDelay: 0,
      })

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      vi.runAllTimers()

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })

    it.skip('needs an element or signal', () => {
      expect(() => {
        // eslint-disable-next-line no-new, sonarjs/constructor-for-side-effects
        new Loader({
          closeDelay: 0,
        })
      }).toThrow('No loader element or signal provided')
    })

    it('handles a signal', async () => {
      const active = signal(false)

      const loader = new Loader({
        loaderVisibilityCallback: (showLoader) => {
          active.value = showLoader
        },
        closeDelay: 0,
      })

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      const passedThroughPromise = loader.loader(promise) // call the loader

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?
      expect(active.value).toBe(false)

      vi.runAllTimers() // delay expired

      expect(active.value).toBe(true)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      expect(active.value).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(active.value).toBe(false)
    })
  })

  describe('loaderFnc', () => {
    it('can export a function wrapper', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      // eslint-disable-next-line no-underscore-dangle
      const function_ = vi.fn(function (this: string) {
        expect(this).toBe('Hello')
        return promise
      })

      const loaderFunction = loader.wrapFunction(function_) as (this: string, first: string, second: string[], third: {
        foo: string
      }) => Promise<string>

      expect(function_.mock.calls).toHaveLength(0)

      // call the loader
      const passedThroughPromise = loaderFunction.call(
        'Hello',
        'foo',
        ['foo', 'bar'],
        { foo: 'bar' },
      )

      expect(passedThroughPromise).toStrictEqual(promise) // is the returned promise the same as the passed in?

      expect(function_.mock.calls).toHaveLength(1)
      expect(function_.mock.calls[0]).toHaveLength(3)
      expect(function_).toHaveBeenCalledWith('foo', ['foo', 'bar'], { foo: 'bar' })

      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })
  })

  describe('decorator', () => {
    it('can export a decorator', async () => {
      const loaderElement = document.querySelector('#js-page-loader') as HTMLElement

      const loader = new Loader() // Initialize the loader

      // Loader is initialized
      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // init delay expired

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      // eslint-disable-next-line no-underscore-dangle
      const function_ = vi.fn(function (this: string, p1: string, p2: number) {
        expect(p1).toBe('bar')
        expect(p2).toBe(815)
        return this
      })

      const decorator = loader.decorator.bind(loader)

      class TestClass {
        private foo: string

        public constructor() {
          this.foo = 'bar'
        }

        @decorator()
        public test() {
          function_.call(this, this.foo, 815)
          return promise
        }
      }

      const myTest = new TestClass()

      expect(function_.mock.calls).toHaveLength(0)

      const passedThroughPromise = myTest.test()

      expect(passedThroughPromise).toBe(promise)

      expect(function_.mock.calls).toHaveLength(1)
      expect(function_.mock.calls[0]).toHaveLength(2)
      expect(function_.mock.calls[0][0]).toBe('bar')
      expect(function_.mock.calls[0][1]).toBe(815)
      expect(function_.mock.results[0].value).toBe(myTest)

      expect(loaderElement.classList.contains('is-active')).toBe(false)

      vi.runAllTimers() // delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      promiseResolver('success') // promise resolves
      await expect(passedThroughPromise).resolves.toBe('success')

      expect(loaderElement.classList.contains('is-active')).toBe(true)

      vi.runAllTimers() // close delay expired

      expect(loaderElement.classList.contains('is-active')).toBe(false)
    })
  })

  describe('currentLoadingPromise', () => {
    it('returns a promise for the currently shown loader', async () => {
      const loader = new Loader({ // Initialize the loader
        delay: 666,
      })

      const loadingPromise = loader.currentLoadingPromise

      // Prepare the promise to pass into
      let promiseResolver = promiseResolverStub
      const promise = new Promise<string>((resolve) => {
        promiseResolver = resolve as PromiseResolver
      })

      loader.loader(promise)

      promiseResolver('success')
      await expect(promise).resolves.toBe('success')

      vi.runAllTimers() // init delay expired

      let promiseResolver2 = promiseResolverStub
      const promise2 = new Promise<string>((resolve) => {
        promiseResolver2 = resolve as PromiseResolver
      })

      loader.loader(promise2)

      vi.runAllTimers()

      promiseResolver2('foo')
      await expect(promise2).resolves.toBe('foo')

      vi.runAllTimers()

      const loadingPromiseResult = await loadingPromise
      expect(loadingPromiseResult).toHaveLength(1)
      expect(loadingPromiseResult[0]).toBe(promise2)

      const loadingPromise2 = loader.currentLoadingPromise

      let promiseResolver3 = promiseResolverStub
      const promise3 = new Promise<string>((resolve) => {
        promiseResolver3 = resolve as PromiseResolver
      })

      loader.loader(promise3)

      vi.runAllTimers()

      let promiseResolver4 = promiseResolverStub
      const promise4 = new Promise<string>((resolve) => {
        promiseResolver4 = resolve as PromiseResolver
      })

      loader.loader(promise4)

      vi.runAllTimers()

      promiseResolver3('08')
      await expect(promise3).resolves.toBe('08')

      vi.runAllTimers()

      promiseResolver4('15')
      await expect(promise4).resolves.toBe('15')

      vi.runAllTimers()

      const loadingPromiseResult2 = await loadingPromise2
      expect(loadingPromiseResult2).toHaveLength(2)
      expect(loadingPromiseResult2[0]).toBe(promise3)
      expect(loadingPromiseResult2[1]).toBe(promise4)
    })
  })
})
