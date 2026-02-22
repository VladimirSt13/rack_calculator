// js/main.js

import { createRouter, createRouterEffects, registerRoutes } from './app/ui/router.js';
import { registerAllPages } from './app/pages/index.js';
import { APP_CONFIG, SELECTORS } from './app/config/app.config.js';

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

    // 5. Cleanup при unload (опціонально)
    window.addEventListener('beforeunload', () => {
      router.destroy();
    });
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
