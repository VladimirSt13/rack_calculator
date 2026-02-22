// vitest.config.js
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // ===== Basic =====
    globals: true,
    environment: 'jsdom',

    // ===== Files =====
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist', 'coverage'],

    // ===== Setup =====
    setupFiles: ['./tests/setup.js'],

    // ===== Coverage =====
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['js/app/**/*.js'],
      exclude: ['js/app/config/*.js', '**/*.test.js', '**/node_modules/**', '**/dist/**'],
      threshold: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      watermarks: {
        lines: [70, 90],
        functions: [70, 90],
        branches: [70, 90],
        statements: [70, 90],
      },
    },

    // ===== Reporting =====
    reporters: ['default'],
    outputFile: {
      junit: './tests/results/junit.xml',
      json: './tests/results/json.json',
    },

    // ===== Performance =====
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4,
      },
    },

    // ===== Watch =====
    watchExclude: ['dist/**', 'node_modules/**', 'coverage/**'],

    // ===== Mocking =====
    fakeTimers: {
      toFake: ['setTimeout', 'setInterval', 'Date'],
    },
  },

  // ===== Aliases (ті ж що й у vite.config.js) =====
  resolve: {
    alias: {
      '@': resolve(__dirname, 'js/app'),
      '@utils': resolve(__dirname, 'js/utils'),
      '@effects': resolve(__dirname, 'js/app/effects'),
      '@state': resolve(__dirname, 'js/app/state'),
      '@config': resolve(__dirname, 'js/app/config'),
      '@pages': resolve(__dirname, 'js/app/pages'),
      '@ui': resolve(__dirname, 'js/app/ui'),
      '@core': resolve(__dirname, 'js/app/core'),
    },
  },
});
