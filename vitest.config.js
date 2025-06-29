import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
    reporters: process.env.GITHUB_ACTIONS ? ['verbose', 'github-actions', 'json', 'html', 'lcov'] : ['default', 'html'],
    outputFile: {
      json: 'coverage/coverage.json',
      html: 'coverage/coverage.html',
      lcov: 'coverage/lcov.info'
    },
    coverage: {
      exclude: [
        // Config files
        'postcss.config.cjs',
        'tailwind.config.js',
        'vite.config.js',
        'vitest.config.js',
        // Test files
        'src/__tests__/**',
        'src/test-setup.js',
        // Build output
        'dist/**',
        'coverage/**',
        // Package files
        'node_modules/**'
      ]
    }
  }
})
