[![NPM version][npm-image]][npm-url] [![Downloads][npm-downloads-image]][npm-url] [![Dependencies][deps-image]][deps-url] [![star this repo][gh-stars-image]][gh-url] [![fork this repo][gh-forks-image]][gh-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] ![Code Style][codestyle-image]

# promise-loading-spinner

> Advanced handling of loaders/spinners based on one or multiple Promises.

## Why?

- **Show a spinner using a promise** Spinner will disappear when promise is resolved
- **No Spinner for short operations** Spinner won't show up for short operations so operation doesn't feel lazy
- **Support of multiple promises** Spinner will disappear when the last unresolved promise is resolved
- **Operations in a sequence** If there are multiple operations in a sequence the spinner will disappear when the last operation is finished

See this [Codepen](https://codepen.io/jenssimon/pen/NJmmJe).

## Install

```sh
$ yarn add promise-loading-spinner
```

## Usage

This shows loading spinners based on promises.

```javascript
import PromiseLoadingSpinner from 'promise-loading-spinner';

const loader = new PromiseLoadingSpinner({
  // options
});

// ...

const myPromise = new Promise((resolve) => {
  setTimeout(() => {
    resolve('done');
  }, 5000);
});

loader.loader(myPromise);
```

You can also use a wrapper function for a function that returns a promise or uses `await`:

```javascript
const myFunction = loader.wrapFunction(async (url) => {
  const response = await fetch(url);
  const result = await response.json();
  return result;
});

myFunction(someUrl);
```

It also exports a method decorator:

```javascript
const loaderDecorator = loader.decorator();

class MyClass {
  @loaderDecorator
  async foo() {
    // ...
  }
}
```

## Options

Option  | Description | Type | Default
--------|-------------|------|--------
`delay` | Time (ms) until spinner will show up to handle short operations without a spinner | `Number` | `300`
`closeDelay` | Time (ms) to wait until last promise is resolved to enable multiple operations in a sequence without a "flickering" spinner | `Number` | `10`
`initDelay` | Delay (ms) after loader initialization to suppress spinners on page load | `Number` | `1000`
`loaderElement` | the element which represents the spinner | `string` (selector) or `HTMLElement`| `js-page-loader`
`classActive` | class name used to show the spinner | `string` | `is-active`

## License

MIT © 2020 [Jens Simon](https://github.com/jenssimon)

[npm-url]: https://www.npmjs.com/package/promise-loading-spinner
[npm-image]: https://badgen.net/npm/v/promise-loading-spinner
[npm-downloads-image]: https://badgen.net/npm/dw/promise-loading-spinner

[deps-url]: https://david-dm.org/jenssimon/promise-loading-spinner
[deps-image]: https://badgen.net/david/dep/jenssimon/promise-loading-spinner

[gh-url]: https://github.com/jenssimon/promise-loading-spinner
[gh-stars-image]: https://badgen.net/github/stars/jenssimon/promise-loading-spinner
[gh-forks-image]: https://badgen.net/github/forks/jenssimon/promise-loading-spinner

[travis-url]: https://travis-ci.com/jenssimon/promise-loading-spinner
[travis-image]: https://travis-ci.com/jenssimon/promise-loading-spinner.svg?branch=master

[coveralls-url]: https://coveralls.io/github/jenssimon/promise-loading-spinner?branch=master
[coveralls-image]: https://coveralls.io/repos/github/jenssimon/promise-loading-spinner/badge.svg?branch=master

[codestyle-image]: https://badgen.net/badge/code%20style/airbnb/f2a
