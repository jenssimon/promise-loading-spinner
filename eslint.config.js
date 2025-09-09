import { defineConfig } from 'eslint/config'
import { configs } from '@jenssimon/eslint-config-base'
import tseslint from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'

import globals from 'globals'


export default defineConfig(
  {
    ignores: [
      '.yarn/',
      '.yalc/',
      'dist/',
      'demo/dist/',
      'coverage/',
    ],
  },

  configs.base,

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
      'no-console': 'off',
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
