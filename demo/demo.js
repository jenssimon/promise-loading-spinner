import PromiseLoadingSpinner from '../dist/loader.js';

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  const getWorkingSectionPromise = (sectionNumber, workingTime) => new Promise((resolve) => {
    const section = document.querySelector(`.section-${sectionNumber}`);
    section.classList.add('is-working');
    setTimeout(() => {
      section.classList.remove('is-working');
      resolve('finished working');
    }, workingTime);
  });

  const waitFor = (time) => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });

  const demo = async () => {
    await waitFor(2000);

    const loader = new PromiseLoadingSpinner();

    // in init delay
    await loader.loader(getWorkingSectionPromise(1, 5000));
    await waitFor(2000);

    // a single promise
    await loader.loader(getWorkingSectionPromise(2, 5000));
    await waitFor(2000);

    // a single promise which resolves before delay
    await loader.loader(getWorkingSectionPromise(3, 250));
    await waitFor(2000);

    // another promise also needs a loader
    const promises = [loader.loader(getWorkingSectionPromise(1, 5000))];
    await waitFor(1000);
    promises.push(loader.loader(getWorkingSectionPromise(2, 5000)));
    await Promise.all(promises);
    await waitFor(2000);

    // two promises in a sequence
    await loader.loader(getWorkingSectionPromise(3, 5000));
    await loader.loader(getWorkingSectionPromise(2, 5000));
    await waitFor(2000);
  };

  while (true) { // eslint-disable-line no-constant-condition
    await demo(); // eslint-disable-line no-await-in-loop
  }
})();
