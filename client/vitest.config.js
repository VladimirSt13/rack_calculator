import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.js', 'src/**/*.jsx'],
      exclude: ['src/main.jsx', 'src/app/providers.jsx', '**/*.test.js', '**/node_modules/**'],
      threshold: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/shared/components'),
      '@features': resolve(__dirname, 'src/features'),
      '@core': resolve(__dirname, 'src/core'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
});
