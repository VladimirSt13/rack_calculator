// js/app/state/createState.js

/**
 * Створює state з геттерами, actions і підпискою
 * @param {Object} initialData - початковий стан
 * @returns {{
 *   get: () => Object,
 *   set: (patch: Object) => void,
 *   updateField: (key: string, value: any) => void,
 *   updateNestedField: (key: string, patch: Object) => void,
 *   reset: () => void,
 *   batch: (callback: Function) => void,
 *   subscribe: (listener: Function) => Function
 * }}
 */
export const createState = (initialData = {}) => {
  const cloneValue = (val) => {
    if (Array.isArray(val)) return [...val];
    if (val instanceof Map) return new Map(val);
    if (val && typeof val === "object") return { ...val };
    return val;
  };

  let state = Object.fromEntries(Object.entries(initialData).map(([k, v]) => [k, cloneValue(v)]));

  const listeners = new Set();
  let isBatching = false;
  let hasChangesInBatch = false;

  const shallowEqual = (a, b) => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [key, val] of a) if (!b.has(key) || b.get(key) !== val) return false;
      return true;
    }
    if (a && typeof a === "object" && b && typeof b === "object") {
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
    const snapshot = Object.fromEntries(Object.entries(state).map(([k, v]) => [k, cloneValue(v)]));
    listeners.forEach((fn) => fn(snapshot));
  };

  const applyNotifyIfNeeded = () => {
    if (hasChangesInBatch) {
      hasChangesInBatch = false;
      notify();
    }
  };

  return {
    get() {
      return Object.fromEntries(Object.entries(state).map(([k, v]) => [k, cloneValue(v)]));
    },

    set(patch) {
      let changed = false;
      const nextState = { ...state };
      for (const key of Object.keys(patch)) {
        const nextVal = cloneValue(patch[key]);
        if (!shallowEqual(nextVal, state[key])) {
          changed = true;
          nextState[key] = nextVal;
        }
      }
      if (!changed) return;
      state = nextState;
      notify();
    },

    updateField(key, value) {
      const nextValue = cloneValue(value);
      if (shallowEqual(state[key], nextValue)) return;
      state = { ...state, [key]: nextValue };
      notify();
    },

    /**
     * Безпечне оновлення вкладених об’єктів, напр. form.beams
     * @param {string} key - ключ у state
     * @param {Object} patch - частина об’єкта, яку треба оновити
     */
    updateNestedField(key, patch) {
      const oldVal = state[key];
      if (!oldVal || typeof oldVal !== "object") return;
      const nextVal = { ...oldVal, ...patch };
      if (shallowEqual(oldVal, nextVal)) return;
      state = { ...state, [key]: nextVal };
      notify();
    },

    reset() {
      const nextState = Object.fromEntries(Object.entries(initialData).map(([k, v]) => [k, cloneValue(v)]));
      let changed = false;
      for (const key of Object.keys(nextState)) {
        if (!shallowEqual(state[key], nextState[key])) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = nextState;
      notify();
    },

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

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};
