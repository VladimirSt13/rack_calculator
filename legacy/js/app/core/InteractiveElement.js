// js/app/core/InteractiveElement.js

import { log } from '../config/env.js';

/**
 * @typedef {Object} InteractiveElementConfig
 * @property {HTMLElement} container - контейнер для делегування подій
 * @property {string} selector - CSS selector для елементів (напр. '[data-action="updateField"]')
 * @property {'input'|'change'|'click'|'keydown'|'keyup'|'submit'} event - тип події
 * @property {string} feature - назва фичі в FeatureContext (напр. 'form', 'spans')
 * @property {string} action - назва action для виклику (напр. 'updateField', 'addSpan')
 * @property {(e: Event, el: Element) => any} [transformValue] - кастомна трансформація значення
 * @property {(e: Event, el: Element) => boolean} [shouldHandle] - умова для обробки події
 * @property {Function} [onBefore] - hook перед викликом action
 * @property {Function} [onAfter] - hook після виклику action
 * @property {Function} [onError] - обробник помилок
 */

/**
 * @typedef {Object} InteractiveHandler
 * @property {() => void} cleanup - видалити слухач подій
 * @property {boolean} isActive - чи активний handler
 */

/**
 * @typedef {Object} InteractiveUtils
 * @property {(config: InteractiveElementConfig) => InteractiveHandler} createInteractiveHandler
 * @property {(container: HTMLElement, features: Record<string, any>) => InteractiveHandler} createAutoHandler
 * @property {(handler: Function, delay: number) => Function} debounceHandler
 * @property {(handler: Function, limit: number) => Function} throttleHandler
 */

// ===== TRANSFORM UTILITIES =====

/**
 * Transform value based on data-transform attribute
 * @param {any} value
 * @param {string | null} transformType
 * @returns {any}
 */
export const transformValue = (value, transformType) => {
  if (value === null || value === undefined) {
    return value;
  }

  switch (transformType) {
    case 'number':
      return value === '' ? null : Number(value);
    case 'boolean':
      return value === 'true' || value === true;
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    case 'string':
    default:
      return String(value);
  }
};

/**
 * Get transform type from element's data-transform attribute
 * @param {Element} el
 * @returns {string | null}
 */
export const getTransformType = (el) => el.dataset?.transform || null;

// ===== INTERACTIVE HANDLER =====

/**
 * Creates universal interactive event handler with delegation
 * @param {InteractiveElementConfig} config
 * @returns {InteractiveHandler}
 */
export const createInteractiveHandler = (config) => {
  const {
    container,
    selector,
    event,
    feature,
    action,
    transformValue: customTransform,
    shouldHandle,
    onBefore,
    onAfter,
    onError,
  } = config;

  if (!container) {
    console.warn('[InteractiveElement] Container not found');
    return { cleanup: () => {}, isActive: false };
  }

  /**
   * Main event handler
   * @param {Event} e
   */
  const handler = (e) => {
    const target = e.target?.closest?.(selector);

    if (!target || !container.contains(target)) {
      return;
    }

    if (shouldHandle && !shouldHandle(e, target)) {
      return;
    }

    if (event === 'submit' || (event === 'click' && target.tagName === 'BUTTON')) {
      e.preventDefault();
    }

    try {
      const featureContext = window.__FEATURES__?.[feature];

      if (!featureContext?.actions?.[action]) {
        console.warn(`[InteractiveElement] Action not found: ${feature}.${action}`);
        return;
      }

      let value;
      if (customTransform) {
        value = customTransform(e, target);
      } else {
        const transformType = getTransformType(target);
        const rawValue =
          target.tagName === 'SELECT' || target.tagName === 'INPUT'
            ? target.value
            : target.dataset.value;
        value = transformValue(rawValue, transformType);
      }

      const field = target.dataset?.field;

      onBefore?.(e, target, { value, field, feature, action });

      if (field !== undefined) {
        featureContext.actions[action](field, value);
      } else {
        featureContext.actions[action](value);
      }

      onAfter?.(e, target, { value, field, feature, action });
    } catch (error) {
      console.error(`[InteractiveElement] Error handling ${action}:`, error);
      onError?.(error, { e, target, feature, action });
    }
  };

  const options =
    event === 'submit'
      ? { capture: true }
      : event === 'click'
        ? { passive: false }
        : { passive: true };

  container.addEventListener(event, handler, options);

  return {
    cleanup: () => {
      container.removeEventListener(event, handler);
    },
    isActive: true,
  };
};

/**
 * Creates auto-handler that reads data-feature/data-action from ALL elements in container
 * @param {HTMLElement} container
 * @param {Record<string, any>} features - map of feature contexts
 * @returns {InteractiveHandler}
 */
export const createAutoHandler = (container, features) => {
  if (!container) {
    console.warn('[InteractiveElement] Container not found for auto-handler');
    return { cleanup: () => {}, isActive: false };
  }

  // Очищаємо попередні features перед реєстрацією нових
  if (window.__FEATURES__) {
    log('[InteractiveElement] Clearing previous features:', Object.keys(window.__FEATURES__));
    delete window.__FEATURES__;
  }

  if (container.__autoHandlerRegistered) {
    log('[InteractiveElement]', 'Auto-handler already registered for container, skipping');
    log('[InteractiveElement]', 'Existing features:', window.__FEATURES__ ? Object.keys(window.__FEATURES__) : 'none');
    return {
      cleanup: () => {},
      isActive: true,
    };
  }
  container.__autoHandlerRegistered = true;

  window.__FEATURES__ = features;
  log('[InteractiveElement] window.__FEATURES__ set to:', Object.keys(features));
  log('[InteractiveElement] Container:', container.dataset?.js || container.className);

  const handler = (e) => {
    const target = e.target;
    const actionEl = target.closest?.('[data-action]');

    if (!actionEl || !container.contains(actionEl)) {
      return;
    }

    const feature = actionEl.dataset?.feature;
    const action = actionEl.dataset?.action;

    log('[InteractiveElement] Event detected:', {
      type: e.type,
      feature,
      action,
      target: actionEl.tagName,
      inModal: actionEl.closest('.modal') ? 'yes' : 'no',
    });

    if (!feature || !action) {
      return;
    }

    const featureContext = window.__FEATURES__?.[feature];
    if (!featureContext?.actions?.[action]) {
      console.warn(`[InteractiveElement] Action not found: ${feature}.${action}`, {
        feature,
        action,
        availableFeatures: Object.keys(window.__FEATURES__ || {}),
        featureContext: featureContext ? {
          hasState: !!featureContext.state,
          hasActions: !!featureContext.actions,
          actionKeys: featureContext.actions ? Object.keys(featureContext.actions) : [],
        } : 'undefined',
      });
      return;
    }

    if (e.type === 'click' && actionEl.tagName === 'BUTTON') {
      e.preventDefault();
    }

    try {
      const transformType = getTransformType(actionEl);
      let value;

      if (actionEl.tagName === 'INPUT' || actionEl.tagName === 'SELECT') {
        value = transformValue(actionEl.value, transformType);
      } else if (actionEl.dataset?.value !== undefined) {
        value = transformValue(actionEl.dataset.value, transformType);
      }

      const field = actionEl.dataset?.field;
      const idAttr = actionEl.dataset?.id || actionEl.dataset?.rackid;
      const id = idAttr ? (isNaN(Number(idAttr)) ? idAttr : Number(idAttr)) : undefined;

      log('[InteractiveElement] Action triggered:', {
        feature,
        action,
        id,
        field,
        value,
        dataset: actionEl.dataset,
      });

      // Call action with correct parameters
      if (action === 'updateSpan' && field && id !== undefined) {
        featureContext.actions[action](id, field, value);
      } else if (action === 'removeSpan' && id !== undefined) {
        featureContext.actions[action](id);
      } else if (action === 'removeRack' && id !== undefined) {
        featureContext.actions[action](id);
      } else if (action === 'increaseQty' && id !== undefined) {
        featureContext.actions[action](id);
      } else if (action === 'decreaseQty' && id !== undefined) {
        featureContext.actions[action](id);
      } else if (field !== undefined) {
        featureContext.actions[action](field, value);
      } else if (value !== undefined) {
        featureContext.actions[action](value);
      } else {
        featureContext.actions[action]();
      }
    } catch (error) {
      console.error(`[InteractiveElement] Auto-handler error:`, error);
    }
  };

  const events = ['click', 'input', 'change', 'submit'];
  events.forEach((event) => {
    const options =
      event === 'submit'
        ? { capture: true }
        : event === 'click'
          ? { passive: false }
          : { passive: true };

    container.addEventListener(event, handler, options);
  });

  return {
    cleanup: () => {
      events.forEach((event) => {
        container.removeEventListener(event, handler);
      });
      delete window.__FEATURES__;
      delete container.__autoHandlerRegistered; // Скидаємо прапорець для наступної сторінки
    },
    isActive: true,
  };
};

// ===== UTILITY HANDLERS =====

export const debounceHandler = (handler, delay = 300) => {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => handler.apply(this, args), delay);
  };
};

export const throttleHandler = (handler, limit = 100) => {
  let inThrottle = false;
  return function throttled(...args) {
    if (!inThrottle) {
      handler.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export const createKeyboardHandler = (handler, keys, options = {}) => {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  const { ctrl = false, shift = false, alt = false, meta = false } = options;

  return (e) => {
    if (
      (ctrl && !e.ctrlKey) ||
      (shift && !e.shiftKey) ||
      (alt && !e.altKey) ||
      (meta && !e.metaKey)
    ) {
      return;
    }

    const keyMatch = keyArray.some(
      (k) => k.toLowerCase() === e.key.toLowerCase() || k.toLowerCase() === e.code.toLowerCase(),
    );

    if (keyMatch) {
      e.preventDefault();
      handler(e, e.key);
    }
  };
};

export const syncInput = (input, getValue, setValue, event = 'input') => {
  input.value = getValue() ?? '';

  const handler = (e) => {
    const value = input.type === 'number' ? Number(e.target.value) : e.target.value;
    setValue(value);
  };

  input.addEventListener(event, handler);

  return {
    unsubscribe: () => input.removeEventListener(event, handler),
    update: () => {
      input.value = getValue() ?? '';
    },
  };
};

// ===== EXPORTS =====

/** @type {InteractiveUtils} */
export const interactive = {
  createInteractiveHandler,
  createAutoHandler,
  debounceHandler,
  throttleHandler,
};

export default {
  createInteractiveHandler,
  createAutoHandler,
  transformValue,
  getTransformType,
  debounceHandler,
  throttleHandler,
  createKeyboardHandler,
  syncInput,
};
