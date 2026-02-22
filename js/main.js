/* eslint-disable no-unused-vars */
import { createRouter, createRouterEffects, registerRoutes } from './app/ui/router.js';
import { registerAllPages } from './app/pages/index.js';
import { APP_CONFIG, SELECTORS } from './app/config/app.config.js';
import { isDev } from './app/config/env.js';
import { createDebugPanel } from './app/ui/debugPanel.js';

/**
 * Точка входу додатку
 * @returns {Promise<void>}
 */
const initApp = async () => {
  try {
    // 1. Реєстрація сторінок (pure)
    const { routes } = await registerAllPages();
    const routerRoutes = registerRoutes(routes);

    // 2. Створення effects (side-effect, але ізольований)
    const effects = createRouterEffects(SELECTORS);

    // 3. Створення роутера (pure factory)
    const router = createRouter({
      routes: routerRoutes,
      defaultRoute: APP_CONFIG.DEFAULT_PAGE,
      effects,
    });

    // 4. Підключення навігації (side-effect)
    // ✅ ВИПРАВЛЕНО: використовуємо SELECTORS.linkSelector замість hardcoded ".nav-link"
    const navContainer = document.querySelector(SELECTORS.navContainer);
    if (navContainer) {
      router.attachNavigation({
        container: navContainer,
        linkSelector: SELECTORS.linkSelector, // ✅ "[data-view]"
      });
    }

    const initialHash = window.location.hash.replace('#view-', '');
    if (initialHash && router.hasRoute(initialHash)) {
      await router.navigate(initialHash);
    } else {
      await router.navigate(APP_CONFIG.DEFAULT_PAGE);
    }
    const dev = isDev();
    // ===== DEBUG PANEL SETUP (dev only) =====
    if (dev) {
      const debugPanel = createDebugPanel({
        stateRefs: {
          // Приклад: інспекція глобальних станів
          // 'rackState': () => rackState.get(),
          // 'batteryState': () => batteryState.get(),
        },
        onLog: (log) => {
          // Опціонально: відправка логів у сервіс (напр. Sentry у dev)
          // if (log.type === 'error') reportToSentry(log);
        },
      });

      debugPanel.mount();

      // Приклад реєстрації стану для інспекції:
      // debugPanel.registerState('rackState', () => rackState?.get?.() || null);

      // Інтеграція з роутером:
      // const originalNavigate = router.navigate;
      // router.navigate = async (id) => {
      //   const result = await originalNavigate.call(router, id);
      //   debugPanel.updateRoute(id);
      //   return result;
      // };

      // Інтеграція з HTTP middleware:
      // const httpWithDebug = withMiddleware(fetchJson, {
      //   onRequest: ({ url, options }) => {
      //     debugPanel.log(`→ ${options.method || 'GET'} ${url}`, 'http');
      //   },
      //   onResponse: ({ result }) => {
      //     debugPanel.log(`← ${result.status} ${result.ok ? '✓' : '✗'}`, result.ok ? 'http' : 'error');
      //   },
      // });

      // 5. Cleanup при unload (опціонально)
      window.addEventListener('beforeunload', () => {
        router.destroy();
        dev && debugPanel.destroy();
      });
    }
  } catch (error) {
    console.error('[App] Initialization failed:', error);
  }
};

// ✅ Безпечний запуск
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // Якщо DOM вже завантажений (наприклад, після HMR)
  initApp();
}
