// js/app/ui/router.js

import { pipe } from '../core/compose.js';
// import { curry } from "../core/curry.js"; // Розкоментуйте, якщо використовуєте

/**
 * @typedef {Object} Route
 * @property {string} id
 * @property {() => Promise<void>} [init]
 * @property {(ctx: RouterContext) => void} [activate]
 * @property {(ctx: RouterContext) => void} [deactivate]
 * @property {(state: any) => void} [onStateChange]
 */

/**
 * @typedef {Object} RouterConfig
 * @property {Record<string, Route>} routes
 * @property {string} defaultRoute
 * @property {Object} effects
 * @property {(id: string) => HTMLElement|null} effects.getPageElement
 * @property {(id: string) => void} effects.showPage
 * @property {(id: string) => void} effects.hidePage
 * @property {(id: string) => void} effects.updateNav
 * @property {Function} effects.log
 */

/**
 * @typedef {Object} RouterContext
 * @property {string|null} currentRoute
 * @property {Record<string, Route>} routes
 * @property {RouterConfig['effects']} effects
 */

/**
 * @typedef {Object} Router
 * @property {(id: string) => Promise<boolean>} navigate
 * @property {() => string|null} getCurrentRoute
 * @property {(id: string) => boolean} hasRoute
 * @property {() => string[]} getRoutes
 * @property {(navConfig: NavConfig) => void} attachNavigation
 * @property {() => void} destroy
 */

/**
 * @typedef {Object} NavConfig
 * @property {HTMLElement} container
 * @property {string} [linkSelector]
 * @property {string} [activeClass]
 */

// ===== PURE HELPERS =====

const createInitialContext = (config) => ({
  currentRoute: null,
  routes: config.routes,
  effects: config.effects,
});

const hasRoute = (ctx, id) => id in ctx.routes;
const getRoute = (ctx, id) => ctx.routes[id];

// Internal helper
const hasContext = (ctx, id) => hasRoute(ctx, id);

// ===== SIDE EFFECTS (ізольовані) =====

const switchView = (ctx, targetId) => {
  const { effects, routes } = ctx;

  Object.keys(routes).forEach((routeId) => {
    const pageEl = effects.getPageElement(routeId);
    if (pageEl) {
      if (routeId === targetId) {
        effects.showPage(routeId);
        pageEl.hidden = false;
        pageEl.setAttribute('aria-hidden', 'false');
      } else {
        effects.hidePage(routeId);
        pageEl.hidden = true;
        pageEl.setAttribute('aria-hidden', 'true');
      }
    }
  });
};

const updateNavigation = (ctx, activeId) => {
  ctx.effects.updateNav?.(activeId);
};

const composeDeactivate = (ctx, routeId) => {
  const route = getRoute(ctx, routeId);
  if (route?.deactivate) {
    route.deactivate(ctx);
  }
};

const composeInit = async (ctx, routeId) => {
  const route = getRoute(ctx, routeId);
  if (route?.init && !route._initialized) {
    await route.init();
    route._initialized = true;
  }
};

const composeActivate = (ctx, routeId) => {
  const route = getRoute(ctx, routeId);
  if (route?.activate) {
    route.activate(ctx);
  }
};

// ===== FACTORY =====

/**
 * Pure factory: створює екземпляр роутера
 * @param {RouterConfig} config
 * @returns {Router}
 */
export const createRouter = (config) => {
  let context = createInitialContext(config);
  let navigationCleanup = null;

  const withContext = (updates) => {
    context = { ...context, ...updates };
    return context;
  };

  const navigate = async (id) => {
    if (!hasContext(context, id)) {
      context.effects.log?.(`[Router] Route not found: ${id}`, 'warn');
      return false;
    }

    if (context.currentRoute && context.currentRoute !== id) {
      composeDeactivate(context, context.currentRoute);
    }

    await composeInit(context, id);
    composeActivate(context, id);
    switchView(context, id);
    updateNavigation(context, id);

    const newHash = `#view-${id}`;
    if (window.location.hash !== newHash) {
      // pushState(стан, заголовок, URL)
      history.pushState({ pageId: id }, '', newHash);
    }

    withContext({ currentRoute: id });
    context.effects.log?.(`[Router] Navigated to: ${id}`);
    return true;
  };

  // Обробка кнопок Back/Forward браузера
  const handlePopState = () => {
    const hash = window.location.hash.replace('#view-', '');
    if (hash && hasRoute(context, hash)) {
      // Рекурсивний виклик navigate (але без pushState, щоб не створювати новий запис в історії)
      // Або просто викликаємо логіку перемикання
      navigate(hash);
    }
  };
  // Реєструємо слухач
  window.addEventListener('popstate', handlePopState);
  const attachNavigation = ({ container, linkSelector = '.nav-link' }) => {
    if (!container) {
      context.effects.log?.('[Router] No navigation container', 'warn');
      return;
    }

    const links = Array.from(container.querySelectorAll(linkSelector));

    const handleClick = async (e, link) => {
      e.preventDefault();
      const targetId = link.dataset.view;
      if (targetId) {
        await navigate(targetId); // ✅ Await для async navigate
      }
    };

    // Реєстрація слухачів
    const listeners = new Map();
    links.forEach((link) => {
      const handler = async (e) => handleClick(e, link);
      link.addEventListener('click', handler);
      link.dataset.routerBound = 'true';
      listeners.set(link, handler);
    });

    // Початкова навігація
    navigate(config.defaultRoute);

    // Cleanup
    navigationCleanup = () => {
      listeners.forEach((handler, link) => {
        if (link.dataset.routerBound === 'true') {
          link.removeEventListener('click', handler);
          delete link.dataset.routerBound;
        }
      });
      listeners.clear();
    };
  };

  return Object.freeze({
    navigate,
    getCurrentRoute: () => context.currentRoute,
    hasRoute: (id) => hasRoute(context, id),
    getRoutes: () => Object.keys(context.routes),
    attachNavigation,
    destroy: () => {
      navigationCleanup?.();
      window.removeEventListener('popstate', handlePopState);
      context.effects.log?.('[Router] Destroyed');
    },
  });
};

// ===== HELPERS =====

/**
 * Helper: створює default effects для роутера
 * @param {Object} selectors
 * @returns {RouterConfig['effects']}
 */
export const createRouterEffects = (selectors) => ({
  getPageElement: (id) => document.querySelector(`#view-${id}`),

  showPage: (id) => {
    const el = document.querySelector(`#view-${id}`);
    if (el) {
      el.classList.add('is-active');
      el.removeAttribute('hidden');
      el.setAttribute('aria-hidden', 'false');
    }
  },

  hidePage: (id) => {
    const el = document.querySelector(`#view-${id}`);
    if (el) {
      el.classList.remove('is-active');
      el.setAttribute('hidden', 'true');
      el.setAttribute('aria-hidden', 'true');
    }
  },

  updateNav: (activeId) => {
    document.querySelectorAll('[data-view]').forEach((link) => {
      const isActive = link.dataset.view === activeId;
      if (isActive) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('is-active');
      }
    });
  },

  log: (msg, level = 'info') => {
    if (level === 'warn') {
      console.warn(msg);
    } else if (level === 'error') {
      console.error(msg);
    } else {
      console.log(msg);
    }
  },
});

/**
 * Helper: реєстрація сторінок у формат роутера
 * @param {Record<string, any>} pages
 * @returns {Record<string, Route>}
 */
export const registerRoutes = (pages) => {
  const routes = {};
  Object.entries(pages).forEach(([id, page]) => {
    routes[id] = {
      id: page.id || id,
      init: page.init,
      activate: page.activate,
      deactivate: page.deactivate,
      onStateChange: page.onStateChange,
    };
  });
  return routes;
};

export default createRouter;
