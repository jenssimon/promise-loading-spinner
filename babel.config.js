module.exports = {
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            loose: true,
          },
        ],
      ],
      plugins: [
        '@babel/transform-modules-commonjs',
        [
          '@babel/plugin-transform-runtime',
          {
            helpers: false,
            regenerator: true,
          },
        ],
        '@babel/plugin-proposal-class-properties',
      ],
    },
  },
};
