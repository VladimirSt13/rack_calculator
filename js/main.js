// js/main.js

import { createRouter, createRouterEffects, registerRoutes } from './app/ui/router.js';
import { registerAllPages } from './app/pages/index.js';
import { APP_CONFIG, PAGES } from './app/config/app.config.js';
import { GLOBAL_SELECTORS } from './app/config/selectors.js';
import { initAllIcons } from './app/ui/initIcons.js';

/**
 * Точка входу додатку
 * @returns {Promise<void>}
 */
const initApp = async () => {
  try {
    // ===== 0. INIT ICONS =====
    initAllIcons();

    // ===== 1. REGISTER PAGES =====
    const { routes: pageModules } = await registerAllPages();

    const navItems = [
      { id: PAGES.RACK, label: 'Стелаж' },
      { id: PAGES.BATTERY, label: 'Акумулятор' },
    ].filter((item) => item.id in pageModules); // тільки зареєстровані сторінки

    const { routes } = registerRoutes(pageModules, {}, navItems);

    // ===== 2. CREATE ROUTER =====
    const effects = createRouterEffects(GLOBAL_SELECTORS);
    const router = createRouter({
      routes,
      defaultRoute: APP_CONFIG.DEFAULT_PAGE,
      effects,
      navItems, // ✅ FIX: передаємо навігацію в роутер
    });

    // ===== 3. ATTACH NAVIGATION + RENDER LINKS =====
    const navContainer = document.querySelector(GLOBAL_SELECTORS.siteNav);
    if (navContainer) {
      navContainer.innerHTML = router.renderNavLinks(navItems, APP_CONFIG.DEFAULT_PAGE);
      router.attachNavigation({
        container: navContainer,
        linkSelector: GLOBAL_SELECTORS.navLink,
      });
    }

    // ===== 4. INITIAL NAVIGATION =====
    const initialHash = window.location.hash.replace('#view-', '');
    if (initialHash && router.hasRoute(initialHash)) {
      await router.navigate(initialHash);
    } else {
      await router.navigate(APP_CONFIG.DEFAULT_PAGE);
    }

    // ===== 5. CLEANUP ON UNLOAD =====
    window.addEventListener('beforeunload', () => {
      router.destroy();
    });

    console.log('[App] Initialization complete');
  } catch (error) {
    console.error('[App] Initialization failed:', error);
  }
};

// ===== SAFE STARTUP =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

export default initApp;
