import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'coverage/',
        '**/*.test.js',
        '**/*.spec.js',
        '**/*.config.js',
        '**/*.config.ts',
        'dist/',
        'build/',
        '.opencode/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        perFile: true,
      },
    },
    include: ['**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'build', '.git'],
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: ['verbose'],
    outputFile: {
      json: './reports/vitest/test-results.json',
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 2,
        maxThreads: 4,
      },
    },
    teardownTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../', import.meta.url)),
      '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
      '@fixtures': fileURLToPath(new URL('./tests/fixtures', import.meta.url)),
    },
  },
});
