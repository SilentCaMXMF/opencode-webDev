import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-runner.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'coverage/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.config.ts',
        'dist/',
        'build/',
        'fixtures/',
        'docs/',
        'reports/'
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
        perFile: true
      },
      all: true
    },
    include: ['src/**/*.test.ts'],
    exclude: [
      'node_modules/',
      'dist/',
      'coverage/',
      '**/*.spec.ts'
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: ['verbose'],
    outputFile: {
      json: './reports/vitest/test-results.json',
      html: './reports/vitest/test-results.html'
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 2,
        maxThreads: 4
      }
    },
    teardownTimeout: 10000,
    alias: {
      '@': fileURLToPath(new URL('../', import.meta.url)),
      '@tests': fileURLToPath(new URL('./src', import.meta.url)),
      '@fixtures': fileURLToPath(new URL('./fixtures', import.meta.url)),
      '@reports': fileURLToPath(new URL('./reports', import.meta.url))
    }
  }
});
