import path from 'node:path'

import { defineConfig } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import { configs, plugins } from 'eslint-config-airbnb-extended'
import { configs as eslintConfigs } from '@jenssimon/eslint-config-base'
import vitest from '@vitest/eslint-plugin'

import globals from 'globals'


const gitignorePath = path.resolve('.', '.gitignore')


const jsConfig = [
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  plugins.stylistic,
  plugins.importX,
  // Airbnb Base Recommended Config
  ...configs.base.recommended,
]

const typescriptConfig = [
  plugins.typescriptEslint,
  ...configs.base.typescript,
]


export default defineConfig(
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      '.yarn/',
    ],
  },

  jsConfig,
  typescriptConfig,

  eslintConfigs.base,

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
    rules: {
      'import-x/no-unresolved': 'off',
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
