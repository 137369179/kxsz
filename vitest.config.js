import { defineConfig } from 'vitest/config'
export default defineConfig({
  css: {
    postcss: false
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
