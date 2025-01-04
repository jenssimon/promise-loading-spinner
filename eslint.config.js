import path from 'node:path'
import { fileURLToPath } from 'node:url'

import globals from 'globals'

import { FlatCompat } from '@eslint/eslintrc'
import { fixupConfigRules } from '@eslint/compat'


// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url) // eslint-disable-line no-underscore-dangle
const __dirname = path.dirname(__filename) // eslint-disable-line no-underscore-dangle

const compat = new FlatCompat({
  baseDirectory: __dirname,
})


export default [
  {
    ignores: [
      '.yarn/',
      '.yalc/',
      'dist/',
      'demo/dist/',
      'coverage/',
    ],
  },

  ...fixupConfigRules(compat.config({
    parserOptions: {
      project: 'tsconfig.json',
    },
    extends: [
      '@jenssimon/base',
    ],
    overrides: [
      {
        files: [
          '*.ts',
        ],
        extends: [
          '@jenssimon/typescript',
        ],
        rules: {
          '@typescript-eslint/naming-convention': 'off',
        },
      },
      {
        files: [
          '**/*.test.*',
          '**/*.spec.*',
          '**/__tests__/**',
          '**/__mocks__/**',
        ],
        plugins: [
          '@vitest',
        ],
        extends: [
          'plugin:@vitest/legacy-recommended',
        ],
      },
    ],
  })).map((rule) => ({
    files: [
      '**/*.js',
      '**/*.ts',
    ],
    ...rule,
  })),

  {
    files: [
      'demo/**',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-await-in-loop': 'off',
      'no-constant-condition': 'off',
      'no-restricted-syntax': 'off',
      'promise/prefer-await-to-then': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
]
