// js/app/core/InteractiveElement.js

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
 *
 * @example
 * const handler = createInteractiveHandler({
 *   container: document.querySelector('[data-js="rackForm"]'),
 *   selector: '[data-action="updateField"]',
 *   event: 'input',
 *   feature: 'form',
 *   action: 'updateField',
 *   transformValue: (e, el) => el.dataset.transform === 'number' ? Number(el.value) : el.value,
 * });
 *
 * // Cleanup при деактивації:
 * return () => handler.cleanup();
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
    // Find closest matching element
    const target = e.target?.closest?.(selector);

    if (!target || !container.contains(target)) {
      return;
    }

    // Check custom condition
    if (shouldHandle && !shouldHandle(e, target)) {
      return;
    }

    // Prevent default for certain events
    if (event === 'submit' || (event === 'click' && target.tagName === 'BUTTON')) {
      e.preventDefault();
    }

    try {
      // Get feature context from window (injected by PageContext)
      const featureContext = window.__FEATURES__?.[feature];

      if (!featureContext?.actions?.[action]) {
        console.warn(`[InteractiveElement] Action not found: ${feature}.${action}`);
        return;
      }

      // Extract value from element
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

      // Get field name if applicable
      const field = target.dataset?.field;

      // Before hook
      onBefore?.(e, target, { value, field, feature, action });

      // Call action
      if (field !== undefined) {
        featureContext.actions[action](field, value);
      } else {
        featureContext.actions[action](value);
      }

      // After hook
      onAfter?.(e, target, { value, field, feature, action });
    } catch (error) {
      console.error(`[InteractiveElement] Error handling ${action}:`, error);
      onError?.(error, { e, target, feature, action });
    }
  };

  // Register event listener
  container.addEventListener(event, handler, { passive: event !== 'submit' });

  return {
    cleanup: () => {
      container.removeEventListener(event, handler);
    },
    isActive: true,
  };
};

/**
 * Creates auto-handler that reads data-feature/data-action from ALL elements in container
 * This is the "magic" option - minimal setup, maximum automation
 * @param {HTMLElement} container
 * @param {Record<string, any>} features - map of feature contexts
 * @returns {InteractiveHandler}
 *
 * @example
 * const handler = createAutoHandler(
 *   document.querySelector('[data-js="page-rack"]'),
 *   { form, spans, results, set }
 * );
 */
export const createAutoHandler = (container, features) => {
  if (!container) {
    console.warn('[InteractiveElement] Container not found for auto-handler');
    return { cleanup: () => {}, isActive: false };
  }

  // Inject features into window for handler access
  window.__FEATURES__ = features;

  /**
   * Universal delegate handler
   * @param {Event} e
   */
  const handler = (e) => {
    const target = e.target;

    // Find closest element with data-action
    const actionEl = target.closest?.('[data-action]');
    if (!actionEl || !container.contains(actionEl)) {
      return;
    }

    const feature = actionEl.dataset?.feature;
    const action = actionEl.dataset?.action;

    if (!feature || !action) {
      return;
    }

    const featureContext = features[feature];
    if (!featureContext?.actions?.[action]) {
      console.warn(`[InteractiveElement] Action not found: ${feature}.${action}`);
      return;
    }

    // Prevent default for buttons/submit
    if (e.type === 'click' && actionEl.tagName === 'BUTTON') {
      e.preventDefault();
    }

    try {
      // Extract value
      const transformType = getTransformType(actionEl);
      let value;

      if (actionEl.tagName === 'INPUT' || actionEl.tagName === 'SELECT') {
        value = transformValue(actionEl.value, transformType);
      } else if (actionEl.dataset?.value !== undefined) {
        value = transformValue(actionEl.dataset.value, transformType);
      }

      // Get field if applicable
      const field = actionEl.dataset?.field;

      // Call action
      if (field !== undefined) {
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

  // Listen to common events
  const events = ['click', 'input', 'change', 'submit'];
  events.forEach((event) => {
    container.addEventListener(event, handler, {
      passive: event !== 'submit',
      capture: event === 'submit',
    });
  });

  return {
    cleanup: () => {
      events.forEach((event) => {
        container.removeEventListener(event, handler);
      });
      delete window.__FEATURES__;
    },
    isActive: true,
  };
};

// ===== UTILITY HANDLERS =====

/**
 * Creates debounced handler for frequent events (input, scroll)
 * @param {Function} handler
 * @param {number} delay - ms
 * @returns {Function}
 */
export const debounceHandler = (handler, delay = 300) => {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => handler.apply(this, args), delay);
  };
};

/**
 * Creates throttled handler for rate limiting
 * @param {Function} handler
 * @param {number} limit - ms
 * @returns {Function}
 */
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

/**
 * Creates keyboard shortcut handler
 * @param {Function} handler - receives (event, key)
 * @param {string|string[]} keys - key or array of keys (e.g. 'Enter' or ['Ctrl+S', 'Cmd+S'])
 * @param {Object} [options] - { ctrl?: boolean, shift?: boolean, alt?: boolean, meta?: boolean }
 * @returns {Function} handler for addEventListener
 */
export const createKeyboardHandler = (handler, keys, options = {}) => {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  const { ctrl = false, shift = false, alt = false, meta = false } = options;

  return (e) => {
    // Check modifier keys
    if (
      (ctrl && !e.ctrlKey) ||
      (shift && !e.shiftKey) ||
      (alt && !e.altKey) ||
      (meta && !e.metaKey)
    ) {
      return;
    }

    // Check if pressed key matches
    const keyMatch = keyArray.some(
      (k) => k.toLowerCase() === e.key.toLowerCase() || k.toLowerCase() === e.code.toLowerCase(),
    );

    if (keyMatch) {
      e.preventDefault();
      handler(e, e.key);
    }
  };
};

/**
 * Creates form sync helper (two-way binding)
 * @param {HTMLInputElement|HTMLSelectElement} input
 * @param {() => any} getValue
 * @param {(value: any) => void} setValue
 * @param {string} [event='input']
 * @returns {{ unsubscribe: () => void, update: () => void }}
 */
export const syncInput = (input, getValue, setValue, event = 'input') => {
  // Initial sync: state → UI
  input.value = getValue() ?? '';

  // Event sync: UI → state
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
