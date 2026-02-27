// js/app/ui/router.js

import { pipe } from '../utils/compose.js';
import { renderNavigation } from './renderNavigation.js';

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
 * @property {Array<{ id: string, label: string }>} [navItems] - ✅ FIX: список пунктів навігації
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
 * @property {() => string} renderNavLinks - ✅ FIX: рендер навігації
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
  navItems: config.navItems || [], // ✅ FIX: пункти навігації
});

const hasRoute = (ctx, id) => id in ctx.routes;
const getRoute = (ctx, id) => ctx.routes[id];
const hasContext = (ctx, id) => hasRoute(ctx, id);

// ===== SIDE EFFECTS =====

const getPageElement = (effects, id) => document.querySelector(`[data-js="page-${id}"]`);

const switchView = (ctx, targetId) => {
  const { effects, routes } = ctx;

  Object.keys(routes).forEach((routeId) => {
    const pageEl = getPageElement(effects, routeId);
    if (pageEl) {
      if (routeId === targetId) {
        effects.showPage(routeId);
        pageEl.hidden = false;
        pageEl.removeAttribute('hidden');
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
      history.pushState({ pageId: id }, '', newHash);
    }

    withContext({ currentRoute: id });
    context.effects.log?.(`[Router] Navigated to: ${id}`);
    return true;
  };

  const handlePopState = () => {
    const hash = window.location.hash.replace('#view-', '');
    if (hash && hasRoute(context, hash)) {
      navigate(hash);
    }
  };
  window.addEventListener('popstate', handlePopState);

  const attachNavigation = ({ container, linkSelector = '[data-view]' }) => {
    if (!container) {
      context.effects.log?.('[Router] No navigation container', 'warn');
      return;
    }

    const links = Array.from(container.querySelectorAll(linkSelector));
    if (links.length === 0 && context.navItems?.length > 0) {
      container.innerHTML = renderNavigation(context.navItems, context.currentRoute);
    }

    const handleClick = async (e, link) => {
      e.preventDefault();
      const targetId = link.dataset.view;
      if (targetId) {
        await navigate(targetId);
      }
    };

    const listeners = new Map();
    const currentLinks = Array.from(container.querySelectorAll(linkSelector));
    currentLinks.forEach((link) => {
      const handler = async (e) => handleClick(e, link);
      link.addEventListener('click', handler);
      link.dataset.routerBound = 'true';
      listeners.set(link, handler);
    });

    if (!context.currentRoute) {
      navigate(config.defaultRoute);
    }

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
    renderNavLinks: renderNavigation, // ✅ FIX: експортуємо для зовнішнього використання
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
  getPageElement: (id) => document.querySelector(`[data-js="page-${id}"]`),

  showPage: (id) => {
    const el = document.querySelector(`[data-js="page-${id}"]`);
    if (el) {
      el.hidden = false;
      el.removeAttribute('hidden');
      el.setAttribute('aria-hidden', 'false');
    }
  },

  hidePage: (id) => {
    const el = document.querySelector(`[data-js="page-${id}"]`);
    if (el) {
      el.hidden = true;
      el.setAttribute('hidden', 'true');
      el.setAttribute('aria-hidden', 'true');
    }
  },

  updateNav: (activeId) => {
    document.querySelectorAll('[data-view]').forEach((link) => {
      const isActive = link.dataset.view === activeId;
      if (isActive) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
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
 * @param {Object} [extraDeps]
 * @param {Array<{ id: string, label: string }>} [navItems] - ✅ FIX: пункти навігації
 * @returns {Record<string, Route>}
 */
export const registerRoutes = (pages, extraDeps = {}, navItems = []) => {
  const routes = {};
  Object.entries(pages).forEach(([id, page]) => {
    routes[id] = {
      id: page.id || id,
      init: page.init,
      activate: (ctx) => page.activate?.({ ...ctx, ...extraDeps }),
      deactivate: (ctx) => page.deactivate?.({ ...ctx, ...extraDeps }),
      onStateChange: page.onStateChange,
    };
  });
  return { routes, navItems }; // ✅ FIX: повертаємо об'єкт з navItems
};

export default createRouter;
