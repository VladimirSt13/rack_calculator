// js/app/effects/events.js
// ts-check

import { curry } from '../core/curry.js';

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
 * @property {Function} addListener - curried: (target) => (event) => (handler) => (options?) => EventManager
 * @property {(id: string) => EventManager} removeListener
 * @property {(predicate: (l: Listener) => boolean) => EventManager} removeListeners
 * @property {() => EventManager} removeAllListeners
 * @property {() => readonly Listener[]} getListeners
 * @property {() => number} count
 */

/**
 * @typedef {Object} EventUtils
 * @property {Function} createEventManager
 * @property {Function} createDebugEventManager
 * @property {(handler: Function, delay: number) => Function} debounceHandler
 * @property {(handler: Function, limit: number) => Function} throttleHandler
 * @property {(events: EventManager, container: EventTarget, eventType: string, selector: string, handler: Function) => EventManager} addDelegatedListener
 * @property {(events: EventManager, target: EventTarget, event: string, handler: Function, options?: AddEventListenerOptions) => EventManager} addOnceListener
 */

// ===== PURE UTILITIES =====

/**
 * Pure: генерує унікальний id для слухача
 * @returns {string}
 */
export const generateId = () => `listener_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * Pure: перевіряє валідність аргументів
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
  options,
});

/**
 * Pure: перевіряє чи існує слухач (без урахування id)
 * @param {Listener} a
 * @param {Listener} b
 * @returns {boolean}
 */
export const listenerEquals = (a, b) =>
  a.target === b.target &&
  a.event === b.event &&
  a.handler === b.handler &&
  a.options === b.options;

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

// ===== EVENT MANAGER FACTORY =====

/**
 * Pure factory: створює EventManager з immutable state
 * @param {readonly Listener[]} [initialListeners=[]]
 * @returns {EventManager}
 */
export const createEventManager = (initialListeners = []) => {
  const listeners = [...initialListeners];

  // Curried addListener: target -> event -> handler -> options -> EventManager
  const addListener = curry((target, event, handler, options = {}) => {
    const validation = validateListener(target, event, handler);
    if (!validation.valid) {
      console.warn(`[EventManager] ${validation.error}`);
      return createEventManager(listeners);
    }

    const newListener = createListener(target, event, handler, options);

    if (listeners.some((l) => listenerEquals(l, newListener))) {
      return createEventManager(listeners);
    }

    const result = registerInDOM(newListener);
    if (!result.success) {
      console.warn('[EventManager] не вдалося додати слухача:', result.error);
      return createEventManager(listeners);
    }

    return createEventManager([...listeners, newListener]);
  });

  const removeListener = (id) => {
    const listener = listeners.find((l) => l.id === id);
    if (!listener) {
      return createEventManager(listeners);
    }
    unregisterFromDOM(listener);
    return createEventManager(listeners.filter((l) => l.id !== id));
  };

  const removeListeners = (predicate) => {
    const toRemove = listeners.filter(predicate);
    toRemove.forEach(unregisterFromDOM);
    return createEventManager(listeners.filter((l) => !predicate(l)));
  };

  const removeAllListeners = () => {
    listeners.forEach(unregisterFromDOM);
    return createEventManager([]);
  };

  const getListeners = () => Object.freeze([...listeners]);
  const count = () => listeners.length;

  return Object.freeze({
    addListener,
    removeListener,
    removeListeners,
    removeAllListeners,
    getListeners,
    count,
  });
};

// ===== DEBUG HELPER =====

/**
 * Helper: створює EventManager з логуванням (для dev)
 * @param {boolean} [debug=true]
 * @returns {EventManager}
 */
export const createDebugEventManager = (debug = true) => {
  const manager = createEventManager();
  if (!debug) {
    return manager;
  }

  return Object.freeze({
    ...manager,
    addListener: (...args) => {
      const newManager = manager.addListener(...args);
      // eslint-disable-next-line no-console
      console.log(`[EventManager] + listener (total: ${newManager.count()})`);
      return newManager;
    },
    removeListener: (id) => {
      const newManager = manager.removeListener(id);
      // eslint-disable-next-line no-console
      console.log(`[EventManager] - listener ${id} (total: ${newManager.count()})`);
      return newManager;
    },
    removeAllListeners: () => {
      const cnt = manager.count();
      const newManager = manager.removeAllListeners();
      // eslint-disable-next-line no-console
      console.log(`[EventManager] removed ${cnt} listeners`);
      return newManager;
    },
  });
};

// ===== EVENT UTILITIES =====

/**
 * Creates a debounced event handler
 * @param {Function} handler - original handler
 * @param {number} delay - debounce delay in ms
 * @returns {Function} debounced handler
 */
export const debounceHandler = (handler, delay = 300) => {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => handler.apply(this, args), delay);
  };
};

/**
 * Creates a throttled event handler
 * @param {Function} handler - original handler
 * @param {number} limit - throttle limit in ms
 * @returns {Function} throttled handler
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
 * Adds a one-time listener that auto-removes after first call
 * @param {EventManager} events
 * @param {EventTarget} target
 * @param {string} event
 * @param {Function} handler
 * @param {AddEventListenerOptions} [options]
 * @returns {EventManager}
 */
export const addOnceListener = (events, target, event, handler, options = {}) => {
  const wrappedHandler = (e) => {
    handler(e);
    // Auto-remove: find and remove this specific listener
    const listeners = events.getListeners();
    const listenerId = listeners.find(
      (l) => l.target === target && l.event === event && l.handler === wrappedHandler,
    )?.id;
    if (listenerId) {
      return events.removeListener(listenerId);
    }
    return events;
  };

  return events.addListener(target)(event)(wrappedHandler)({
    ...options,
    once: true,
  });
};

/**
 * Adds delegated event listener (event delegation pattern)
 * @param {EventManager} events
 * @param {EventTarget} container - parent element to listen on
 * @param {string} eventType - event type (e.g., 'click')
 * @param {string} selector - CSS selector for target elements
 * @param {Function} handler - receives (event, delegatedElement)
 * @returns {EventManager}
 */
export const addDelegatedListener = (events, container, eventType, selector, handler) => {
  const delegatedHandler = (e) => {
    const target = e.target.closest?.(selector);
    if (target && container.contains(target)) {
      handler(e, target);
    }
  };

  return events.addListener(container)(eventType)(delegatedHandler);
};

/**
 * Creates a keyboard shortcut handler
 * @param {Function} handler - receives (event, key)
 * @p;aram {string|string[]} keys - key or array of keys to listen for
 * @param {Object} [options] - { ctrl?: boolean, shift?: boolean, alt?: boolean }
 * @returns {Function} keyboard handler for addListener
 */
export const createKeyboardHandler = (handler, keys, options = {}) => {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  const { ctrl = false, shift = false, alt = false } = options;

  return (e) => {
    // Check modifier keys
    if ((ctrl && !e.ctrlKey) || (shift && !e.shiftKey) || (alt && !e.altKey)) {
      return;
    }

    // Check if pressed key matches
    if (keyArray.includes(e.key.toLowerCase()) || keyArray.includes(e.code)) {
      e.preventDefault();
      handler(e, e.key);
    }
  };
};

/**
 * Creates a form input sync helper (two-way binding)
 * @param {EventManager} events
 * @param {HTMLInputElement|HTMLSelectElement} input
 * @param {Function} getValue - () => any
 * @param {Function} setValue - (value: any) => void
 * @param {string} [event='input'] - event to listen for
 * @returns {{ unsubscribe: () => void }}
 */
export const syncInput = (events, input, getValue, setValue, event = 'input') => {
  // Initial sync: state → UI
  input.value = getValue() ?? '';

  // Event sync: UI → state
  const handler = (e) => {
    const value = input.type === 'number' ? Number(e.target.value) : e.target.value;
    setValue(value);
  };

  const withListener = events.addListener(input)(event)(handler);

  return {
    unsubscribe: () => withListener.removeAllListeners()(),
    update: () => {
      input.value = getValue() ?? '';
    },
  };
};

// ===== EXPORTS =====

/** @type {EventUtils} */
export const events = {
  createEventManager,
  createDebugEventManager,
  debounceHandler,
  throttleHandler,
  addDelegatedListener,
  addOnceListener,
};

export default {
  createEventManager,
  createDebugEventManager,
  generateId,
  validateListener,
  createListener,
  listenerEquals,
  registerInDOM,
  unregisterFromDOM,
  debounceHandler,
  throttleHandler,
  addDelegatedListener,
  addOnceListener,
  createKeyboardHandler,
  syncInput,
};
