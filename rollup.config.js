import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import Typescript from 'typescript';
import pkg from './package.json';

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
        typescript: Typescript,
      }),
      commonjs(),
    ],
  },

  {
    input: 'src/loader.ts',
    external: [],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    plugins: [
      typescript({
        typescript: Typescript,
      }),
    ],
  },
];
