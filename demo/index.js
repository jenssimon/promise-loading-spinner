import { effect, signal } from '@preact/signals-core'

import PromiseLoadingSpinner from '../dist/src/loader.js'


const green = document.querySelector('.section-green')
const blue = document.querySelector('.section-blue')
const red = document.querySelector('.section-red')

const CLASS_WORKING = 'is-working'

let loader
const sig = signal(true)

const wait = (time) => new Promise((resolve) => { setTimeout(() => { resolve() }, time) })

const work = (section, time) => {
  const workPromise = loader.loader(wait(time))
  section.classList.add(CLASS_WORKING)
  workPromise.then(() => {
    section.classList.remove(CLASS_WORKING)
  })
  return workPromise
}


const showCases = [
  {
    description: 'in init delay',
    steps: () => work(green, 5000),
  },
  {
    description: 'a single promise',
    steps: () => work(blue, 5000),
  },
  {
    description: 'a single promise which resolves before delay',
    steps: () => work(red, 250),
  },
  {
    description: 'another promise also needs a loader',
    steps: async () => {
      const promiseGreen = work(green, 5000)
      await wait(1000)
      const promiseBlue = work(blue, 5000)
      return Promise.all([promiseGreen, promiseBlue])
    },
  },
  {
    description: 'two promises in a sequence',
    steps: async () => {
      await work(red, 5000)
      return work(blue, 5000)
    },
  },
]


const main = async () => {
  while (true) {
    await wait(2000)

    loader = new PromiseLoadingSpinner({
      loaderVisibilityCallback: (active) => { sig.value = active },
      loaderElement: '#js-page-loader',
    })

    for (const { description, steps } of showCases) {
      console.info('showCase: %s', description)
      await steps()
      await wait(2000)
    }
  }
}

main()

effect(() => {
  console.debug('show loader: %o', sig.value)
})
