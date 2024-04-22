import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      exclude: [
        '.yarn/**',
        'demo/**',
        'commitlint.config.js',
      ],
    },
  },
})
