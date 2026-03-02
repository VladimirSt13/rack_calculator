// js/app/ui/createPageModule.js

import { createEventManager } from '../effects/events.js';
import { pipe } from '../utils/compose.js';

/**
 * @typedef {Object} PageDependencies
 * @property {Object} effects - side effects (DOM, events, http)
 * @property {Function} effects.query - (selector: string) => () => HTMLElement|null
 * @property {Function} effects.setState - (el: HTMLElement, state: string) => () => HTMLElement
 * @property {Function} effects.addListener - (el: HTMLElement, event: string, handler: Function) => () => void
 * @property {Object} selectors - мапа CSS селекторів
 * @property {Object} [selectors.page] - селектори конкретної сторінки
 * @property {Function} [registerState] - 🆕 реєстрація стану для дебагу: (label, getter) => void
 */

/**
 * @typedef {Object} PageLifecycle
 * @property {() => Promise<void>} [onInit] - ініціалізація (async)
 * @property {(deps: PageDependencies) => void} [onActivate] - активація сторінки
 * @property {(deps: PageDependencies) => void} [onDeactivate] - деактивація сторінки
 * @property {() => void} [onReset] - скидання UI форми
 */

/**
 * @typedef {Object} PageModule
 * @property {string} id - унікальний ідентифікатор сторінки
 * @property {() => Promise<void>} init - ініціалізація
 * @property {(deps: PageDependencies) => void} activate - активація
 * @property {(deps: PageDependencies) => void} deactivate - деактивація
 */

/**
 * @typedef {Object} PageConfig
 * @property {string} id
 * @property {PageLifecycle} lifecycle
 * @property {Object} [options]
 * @property {boolean} [options.autoReset=true] - чи скидати форму при активації
 * @property {boolean} [options.cleanupEvents=true] - чи чистити події при деактивації
 */

/**
 * Pure factory: створює конфігурацію модуля сторінки
 * Не виконує жодних side effects
 *
 * @param {PageConfig} config
 * @returns {PageModule}
 */
export const createPageModule = ({ id, lifecycle = {}, options = {} }) => {
  // Default options (immutable)
  const defaults = {
    autoReset: true,
    cleanupEvents: true,
  };

  const config = { ...defaults, ...options };

  // Pure: створення менеджера подій (без реєстрації)
  const createEventScope = () => {
    const { addListener, removeAllListeners } = createEventManager();
    return { addListener, removeAllListeners };
  };

  // Pure: композиція init логіки
  const composeInit = (userInit) => async () => {
    // Можна додати загальну логіку (логер, аналітика)
    if (userInit) {
      await userInit();
    }
  };

  // Pure: композиція activate логіки
  const composeActivate = (userActivate, eventScope) => (deps) => {
    // 1. Reset UI (side-effect, але ізольований)
    if (config.autoReset && lifecycle.onReset) {
      lifecycle.onReset();
    }

    // 2. User activate logic (side-effects через deps)
    if (userActivate) {
      userActivate({
        ...deps,
        addListener: eventScope.addListener,
      });
    }
  };

  // Pure: композиція deactivate логіки
  const composeDeactivate = (userDeactivate, eventScope) => (deps) => {
    // 1. Cleanup events (side-effect)
    if (config.cleanupEvents) {
      eventScope.removeAllListeners();
    }

    // 2. User deactivate logic
    if (userDeactivate) {
      userDeactivate({ ...deps, addListener: eventScope.addListener });
    }
  };

  // ===== PUBLIC API (Immutable) =====

  return Object.freeze({
    id,

    /**
     * Ініціалізація модуля
     * @returns {Promise<void>}
     */
    init: composeInit(lifecycle.onInit),

    /**
     * Активація модуля (відображення сторінки)
     * @param {PageDependencies} deps
     * @returns {void}
     */
    activate: (deps) => {
      const eventScope = createEventScope();
      const activateFn = composeActivate(lifecycle.onActivate, eventScope);
      activateFn(deps);

      // Зберігаємо cleanup функцію для подальшого використання
      return () => eventScope.removeAllListeners();
    },

    /**
     * Деактивація модуля (приховування сторінки)
     * @param {PageDependencies} deps
     * @returns {void}
     */
    deactivate: (deps) => {
      const eventScope = createEventScope();
      const deactivateFn = composeDeactivate(lifecycle.onDeactivate, eventScope);
      deactivateFn(deps);
    },

    // Для тестування / debug
    _config: config,
  });
};

/**
 * Helper: створює PageDependencies з реальних DOM елементів
 * @param {Object} selectors - мапа селекторів з config/selectors.js
 * @returns {PageDependencies}
 */
export const createPageDeps = (selectors) => {
  // Pure wrappers around DOM APIs
  const query = (selector) => () => document.querySelector(selector);

  const setState = (element) => (state) => {
    if (element) {
      element.dataset.state = state;
    }
    return element;
  };

  const addListener = (element, event, handler) => () => {
    if (element) {
      element.addEventListener(event, handler);
    }
  };

  return {
    effects: {
      query,
      setState,
      addListener,
    },
    selectors,
  };
};

export default createPageModule;
