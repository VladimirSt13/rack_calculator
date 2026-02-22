// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Корінь проєкту
  root: '.',

  // Публічні файли (копіюються в dist без змін)
  publicDir: 'public',

  // Налаштування сервера розробки
  server: {
    port: 3000,
    open: true, // Автоматично відкривати браузер
    host: true, // Доступ з мережі
    cors: true,

    // Proxy для API запитів (уникаємо CORS у dev)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },

    // HMR налаштування
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },
  },

  // Налаштування збірки
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Source maps для дебагу
    minify: 'esbuild',
    target: 'es2022',

    // Code splitting
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Іменування чанків
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // Manual chunks для великих модулів
        manualChunks: {
          // vendor: ['lodash', 'axios'], // якщо використовуєте
        },
      },
    },

    // Оптимізація dependencies
    optimizeDeps: {
      include: [],
      exclude: [],
    },
  },

  // CSS налаштування
  css: {
    devSourcemap: true,
  },

  // Resolver налаштування
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

  // Vitest інтеграція
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['js/app/**/*.js'],
      exclude: ['js/app/config/*.js', '**/*.test.js', '**/node_modules/**'],
      threshold: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },

  // Змінні оточення
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
