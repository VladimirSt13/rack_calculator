// js/app/effects/events.js

/**
 * @typedef {Object} Listener
 * @property {string} id
 * @property {EventTarget} target
 * @property {string} event
 * @property {Function} handler
 * @property {AddEventListenerOptions} [options]
 */

/**
 * @typedef {Object} EventManager
 * @property {(target: EventTarget, event: string, handler: Function, options?: AddEventListenerOptions) => string} addListener
 * @property {(id: string) => boolean} removeListener
 * @property {(container: EventTarget) => number} removeAllFromContainer
 * @property {() => readonly Listener[]} getListeners
 * @property {() => number} count
 */

/**
 * @typedef {Object} InteractiveHandlerConfig
 * @property {string} selector - CSS selector для елементів
 * @property {string} event - тип події ('click', 'input', 'change')
 * @property {(e: Event, el: Element) => void} handler - обробник події
 * @property {boolean} [useCapture] - фаза перехоплення
 */

/**
 * @typedef {Object} EventUtils
 * @property {() => EventManager} createEventManager
 * @property {(handler: Function, delay: number) => Function} debounceHandler
 * @property {(handler: Function, limit: number) => Function} throttleHandler
 * @property {(container: HTMLElement, config: InteractiveHandlerConfig) => () => void} createInteractiveHandler
 * @property {(container: EventTarget, eventType: string, selector: string, handler: Function) => () => void} delegateEvents
 */

// ===== PURE UTILITIES =====

/**
 * Pure: генерує унікальний id для слухача
 * @returns {string}
 */
export const generateId = () => `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * Pure: перевіряє валідність аргументів для слухача
 * @param {EventTarget} target
 * @param {string} event
 * @param {Function} handler
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateListener = (target, event, handler) => {
  if (!(target instanceof EventTarget)) {
    return { valid: false, error: 'target не є EventTarget' };
  }
  if (typeof event !== 'string' || !event) {
    return { valid: false, error: 'event повинен бути непорожнім рядком' };
  }
  if (typeof handler !== 'function') {
    return { valid: false, error: 'handler повинен бути функцією' };
  }
  return { valid: true };
};

/**
 * Pure: створює об'єкт Listener
 * @param {EventTarget} target
 * @param {string} event
 * @param {Function} handler
 * @param {AddEventListenerOptions} [options]
 * @returns {Listener}
 */
export const createListener = (target, event, handler, options) => ({
  id: generateId(),
  target,
  event,
  handler,
  options: options || {},
});

// ===== SIDE EFFECTS =====

/**
 * Side-effect: реєструє слухача в DOM
 * @param {Listener} listener
 * @returns {{ success: boolean, error?: Error }}
 */
export const registerInDOM = (listener) => {
  try {
    listener.target.addEventListener(listener.event, listener.handler, listener.options);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Side-effect: видаляє слухача з DOM
 * @param {Listener} listener
 * @returns {{ success: boolean, error?: Error }}
 */
export const unregisterFromDOM = (listener) => {
  try {
    listener.target.removeEventListener(listener.event, listener.handler, listener.options);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// ===== EVENT MANAGER (SIMPLIFIED) =====

/**
 * Creates simple mutable EventManager for DOM events
 * @returns {EventManager}
 */
export const createEventManager = () => {
  /** @type {Listener[]} */
  const listeners = [];

  return {
    /**
     * Add event listener, returns unique id for later removal
     * @param {EventTarget} target
     * @param {string} event
     * @param {Function} handler
     * @param {AddEventListenerOptions} [options]
     * @returns {string} listener id
     */
    addListener: (target, event, handler, options) => {
      const validation = validateListener(target, event, handler);
      if (!validation.valid) {
        console.warn(`[EventManager] ${validation.error}`);
        return '';
      }

      const listener = createListener(target, event, handler, options);
      const result = registerInDOM(listener);

      if (result.success) {
        listeners.push(listener);
        return listener.id;
      }

      console.warn('[EventManager] не вдалося додати слухача:', result.error);
      return '';
    },

    /**
     * Remove listener by id
     * @param {string} id
     * @returns {boolean} success
     */
    removeListener: (id) => {
      const index = listeners.findIndex((l) => l.id === id);
      if (index === -1) {
        return false;
      }

      const listener = listeners[index];
      const result = unregisterFromDOM(listener);

      if (result.success) {
        listeners.splice(index, 1);
        return true;
      }
      return false;
    },

    /**
     * Remove all listeners attached to a specific container
     * @param {EventTarget} container
     * @returns {number} count of removed listeners
     */
    removeAllFromContainer: (container) => {
      let removed = 0;
      for (let i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i].target === container) {
          unregisterFromDOM(listeners[i]);
          listeners.splice(i, 1);
          removed++;
        }
      }
      return removed;
    },

    /**
     * ✅ FIX: Remove ALL listeners (regardless of container)
     * @returns {number} count of removed listeners
     */
    removeAllListeners: () => {
      let removed = 0;
      for (let i = listeners.length - 1; i >= 0; i--) {
        unregisterFromDOM(listeners[i]);
        removed++;
      }
      listeners.length = 0; // clear array
      return removed;
    },

    /**
     * Get copy of all registered listeners
     * @returns {readonly Listener[]}
     */
    getListeners: () => Object.freeze([...listeners]),

    /**
     * Count of registered listeners
     * @returns {number}
     */
    count: () => listeners.length,
  };
};

// ===== EVENT UTILITIES =====

/**
 * Creates debounced event handler
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
 * Creates throttled event handler
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
 * Universal handler for data-action/data-feature pattern
 * @param {HTMLElement} container - container element for delegation
 * @param {InteractiveHandlerConfig} config
 * @returns {() => void} cleanup function
 */
export const createInteractiveHandler = (container, config) => {
  const { selector, event, handler, useCapture = false } = config;

  const delegateHandler = (e) => {
    const target = e.target.closest?.(selector);
    if (target && container.contains(target)) {
      handler(e, target);
    }
  };

  container.addEventListener(event, delegateHandler, useCapture);

  return () => {
    container.removeEventListener(event, delegateHandler, useCapture);
  };
};

/**
 * Simple event delegation helper
 * @param {EventTarget} container
 * @param {string} eventType
 * @param {string} selector
 * @param {Function} handler - receives (event, delegatedElement)
 * @returns {() => void} cleanup function
 */
export const delegateEvents = (container, eventType, selector, handler) => {
  const delegateHandler = (e) => {
    const target = e.target.closest?.(selector);
    if (target && container.contains(target)) {
      handler(e, target);
    }
  };

  container.addEventListener(eventType, delegateHandler);
  return () => container.removeEventListener(eventType, delegateHandler);
};

/**
 * Creates keyboard shortcut handler
 * @param {Function} handler - receives (event, key)
 * @param {string|string[]} keys - key or array of keys
 * @param {Object} [options] - { ctrl?: boolean, shift?: boolean, alt?: boolean }
 * @returns {Function} handler for addEventListener
 */
export const createKeyboardHandler = (handler, keys, options = {}) => {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  const { ctrl = false, shift = false, alt = false } = options;

  return (e) => {
    if ((ctrl && !e.ctrlKey) || (shift && !e.shiftKey) || (alt && !e.altKey)) {
      return;
    }
    if (keyArray.includes(e.key.toLowerCase()) || keyArray.includes(e.code)) {
      e.preventDefault();
      handler(e, e.key);
    }
  };
};

/**
 * Creates form input sync helper (two-way binding)
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

/** @type {EventUtils} */
export const events = {
  createEventManager,
  debounceHandler,
  throttleHandler,
  createInteractiveHandler,
  delegateEvents,
};

export default {
  createEventManager,
  generateId,
  validateListener,
  createListener,
  registerInDOM,
  unregisterFromDOM,
  debounceHandler,
  throttleHandler,
  createInteractiveHandler,
  delegateEvents,
  createKeyboardHandler,
  syncInput,
};
