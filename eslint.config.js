import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tseslint from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'

import globals from 'globals'

import { FlatCompat } from '@eslint/eslintrc'
import { fixupConfigRules } from '@eslint/compat'


// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url) // eslint-disable-line no-underscore-dangle
const __dirname = path.dirname(__filename) // eslint-disable-line no-underscore-dangle

const compat = new FlatCompat({
  baseDirectory: __dirname,
})


export default tseslint.config(
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
    extends: [
      '@jenssimon/base',
    ],
  })),

  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            '*.js',
            'demo/*.js',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: [
      'src/loader.ts',
      'src/__tests__/loader.test.ts',
      'demo/index.js',
    ],
    rules: {
      'no-void': 'off',
      'sonarjs/void-use': 'off',
    },
  },

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
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },

  {
    files: [
      '**/*.test.*',
      '**/*.spec.*',
      '**/__tests__/**',
      '**/__mocks__/**',
    ],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
)
