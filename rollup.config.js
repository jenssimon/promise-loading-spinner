import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const commonTypescriptConfig = {
  outDir: 'dist/',
};

export default [
  // browser-friendly UMD build
  {
    input: 'src/loader.ts',
    output: {
      name: 'PromiseLoadingSpinner',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      typescript({
        ...commonTypescriptConfig,
        module: 'CommonJS',
      }),
      commonjs(),
    ],
  },

  {
    input: 'src/loader.ts',
    external: [],
    output: [
      { file: pkg.main, format: 'cjs', exports: 'auto' },
      { file: pkg.module, format: 'es' },
    ],
    plugins: [
      typescript({
        ...commonTypescriptConfig,
      }),
    ],
  },
];
