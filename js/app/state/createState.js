// js/state/createState.js

/**
 * Створює state з геттерами, actions і підпискою
 * @param {Object} initialData - початковий стан
 * @returns {{
 *   get: () => Object,
 *   set: (patch: Object) => void,
 *   updateField: (key: string, value: any) => void,
 *   reset: () => void,
 *   batch: (callback: Function) => void,
 *   subscribe: (listener: Function) => Function
 * }}
 */
export const createState = (initialData = {}) => {
  let state = { ...initialData };
  const listeners = new Set();

  let isBatching = false;
  let hasChangesInBatch = false;

  // Shallow compare
  const shallowEqual = (a, b) => {
    if (a === b) return true;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => v === b[i]);
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [key, val] of a) {
        if (!b.has(key) || b.get(key) !== val) return false;
      }
      return true;
    }

    if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every((key) => a[key] === b[key]);
    }

    return false;
  };

  const notify = () => {
    if (isBatching) {
      hasChangesInBatch = true;
      return;
    }
    listeners.forEach((fn) => fn(state));
  };

  const applyNotifyIfNeeded = () => {
    if (hasChangesInBatch) {
      hasChangesInBatch = false;
      listeners.forEach((fn) => fn(state));
    }
  };

  return {
    /**
     * Повертає копію state
     * @returns {Object}
     */
    get() {
      const copy = {};
      Object.entries(state).forEach(([key, val]) => {
        if (Array.isArray(val)) copy[key] = [...val];
        else if (val instanceof Map) copy[key] = new Map(val);
        else copy[key] = val;
      });
      return copy;
    },

    /**
     * Встановлює patch у state
     * @param {Object} patch
     * @returns {void}
     */
    set(patch) {
      const nextState = { ...state, ...patch };

      let changed = false;
      for (const key of Object.keys(nextState)) {
        if (!shallowEqual(nextState[key], state[key])) {
          changed = true;
          break;
        }
      }

      if (!changed) return;

      state = nextState;
      notify();
    },

    /**
     * Оновлює одне поле state
     * @param {string} key
     * @param {any} value
     * @returns {void}
     */
    updateField(key, value) {
      if (shallowEqual(state[key], value)) return;

      state = { ...state, [key]: value };
      notify();
    },

    /**
     * Скидає state до початкового
     * @returns {void}
     */
    reset() {
      let changed = false;

      for (const key of Object.keys(initialData)) {
        if (!shallowEqual(state[key], initialData[key])) {
          changed = true;
          break;
        }
      }

      if (!changed) return;

      state = { ...initialData };
      notify();
    },

    /**
     * Виконує групове оновлення state
     * notify викликається один раз наприкінці
     * @param {Function} callback
     * @returns {void}
     */
    batch(callback) {
      if (isBatching) {
        callback();
        return;
      }

      isBatching = true;
      callback();
      isBatching = false;

      applyNotifyIfNeeded();
    },

    /**
     * Підписка на зміни state
     * @param {Function} listener
     * @returns {Function} unsubscribe
     */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};
