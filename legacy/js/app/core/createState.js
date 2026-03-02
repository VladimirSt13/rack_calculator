// js/app/state/createState.js

/**
 * @template T
 * @typedef {Object} StateInstance
 * @property {() => T} get - отримати поточний стан (immutable snapshot)
 * @property {(patch: Partial<T>) => boolean} set - оновити стан через patch
 * @property {<K extends keyof T>(key: K, value: T[K]) => boolean} updateField - оновити одне поле
 * @property {<K extends keyof T>(key: K, patch: Partial<T[K]>) => boolean} updateNestedField - оновити вкладений об'єкт
 * @property {() => boolean} reset - скинути до початкового стану
 * @property {(callback: () => void) => void} batch - виконати кілька змін без сповіщень
 * @property {(listener: (state: T) => void) => () => void} subscribe - підписатися на зміни
 * @property {(middleware: Middleware<T>) => () => void} use - підключити middleware
 */

/**
 * @template T
 * @typedef {Object} MiddlewareContext
 * @property {T} prevState
 * @property {T} nextState
 * @property {Record<string, any>} changes
 * @property {string} actionType
 */

/**
 * @template T
 * @typedef {(ctx: MiddlewareContext<T>) => void} Middleware
 */

/**
 * @template T
 * @typedef {Object} UpdateResult
 * @property {boolean} changed
 * @property {T} newState
 * @property {Record<string, { before: any, after: any }>} changes
 */

// ===== PURE UTILS =====

/**
 * Глибоке клонування для підтримки Map, Array, Object
 * @template V
 * @param {V} val
 * @returns {V}
 */
export const cloneValue = (val) => {
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(cloneValue);
  }
  if (val instanceof Map) {
    return new Map(Array.from(val.entries()).map(([k, v]) => [k, cloneValue(v)]));
  }
  if (val instanceof Date) {
    return new Date(val.getTime());
  }
  return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, cloneValue(v)]));
};

/**
 * Порівняння на shallow equality з підтримкою Map/Array
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export const shallowEqual = (a, b) => {
  if (Object.is(a, b)) {
    return true;
  }
  if (typeof a !== typeof b || a === null || b === null) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) {
      return false;
    }
    for (const [key, val] of a) {
      if (!b.has(key) || !Object.is(val, b.get(key))) {
        return false;
      }
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      return false;
    }
    return keysA.every((key) => Object.is(a[key], b[key]));
  }

  return false;
};

/**
 * Pure: застосовує patch до стану
 * @template T
 * @param {T} currentState
 * @param {Partial<T>} patch
 * @returns {UpdateResult<T>}
 */
export const applyPatch = (currentState, patch) => {
  const changes = {};
  let hasChanges = false;

  for (const [key, nextVal] of Object.entries(patch)) {
    const prevVal = currentState[key];
    const clonedNext = cloneValue(nextVal);

    if (!shallowEqual(prevVal, clonedNext)) {
      hasChanges = true;
      changes[key] = { before: prevVal, after: clonedNext };
    }
  }

  if (!hasChanges) {
    return { changed: false, newState: currentState, changes: {} };
  }

  return {
    changed: true,
    newState: {
      ...currentState,
      ...Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, cloneValue(v)])),
    },
    changes,
  };
};

/**
 * Pure: оновлює одне поле
 * @template T
 * @param {T} state
 * @param {keyof T} key
 * @param {T[keyof T]} value
 * @returns {UpdateResult<T>}
 */
export const updateFieldPure = (state, key, value) => {
  const clonedValue = cloneValue(value);
  if (shallowEqual(state[key], clonedValue)) {
    return { changed: false, newState: state, changes: {} };
  }
  return {
    changed: true,
    newState: { ...state, [key]: clonedValue },
    changes: { [key]: { before: state[key], after: clonedValue } },
  };
};

/**
 * Pure: оновлює вкладений об'єкт
 * @template T
 * @param {T} state
 * @param {keyof T} key
 * @param {Partial<T[keyof T]>} patch
 * @returns {UpdateResult<T>}
 */
export const updateNestedFieldPure = (state, key, patch) => {
  const currentVal = state[key];
  if (!currentVal || typeof currentVal !== 'object') {
    return { changed: false, newState: state, changes: {} };
  }

  const result = applyPatch(currentVal, patch);
  if (!result.changed) {
    return { changed: false, newState: state, changes: {} };
  }

  return {
    changed: true,
    newState: { ...state, [key]: result.newState },
    changes: { [key]: { before: currentVal, after: result.newState } },
  };
};

// ===== FACTORY =====

/**
 * @template T
 * @param {T} initialData
 * @param {Object} [options]
 * @param {boolean} [options.enableLogging=false]
 * @returns {StateInstance<T>}
 */
export const createState = (initialData, options = {}) => {
  // Private immutable state reference
  let currentState = cloneValue(initialData);
  const initialState = cloneValue(initialData);

  // Private mutable collections (мінімум мутацій, інкапсульовані)
  const listeners = new Set();
  const middlewares = new Set();

  // Batching queue (функціональний підхід)
  let batchQueue = [];
  let isBatching = false;

  // Pure: отримання snapshot
  const getSnapshot = () => cloneValue(currentState);

  // Pure: перевірка чи потрібне сповіщення
  const shouldNotify = (result) => result.changed && !isBatching;

  // Side-effect: сповіщення підписників
  const notify = (result) => {
    if (!result.changed) {
      return;
    }

    const snapshot = getSnapshot();

    // Middleware chain (pure composition)
    if (middlewares.size > 0) {
      const ctx = {
        prevState: currentState,
        nextState: snapshot,
        changes: result.changes,
        actionType: 'update',
      };
      middlewares.forEach((mw) => mw(ctx));
    }

    // Notify listeners
    listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (e) {
        console.error('[State] Listener error:', e);
      }
    });
  };

  // Side-effect: застосування змін з черги
  const flushBatch = () => {
    if (batchQueue.length === 0) {
      return;
    }

    const combinedPatch = batchQueue.reduce((acc, patch) => ({ ...acc, ...patch }), {});
    const result = applyPatch(currentState, combinedPatch);

    if (result.changed) {
      currentState = result.newState;
      notify(result);
    }

    batchQueue = [];
  };

  // ===== PUBLIC API (Immutable) =====

  return Object.freeze({
    get: () => getSnapshot(),

    set: (patch) => {
      if (!patch || typeof patch !== 'object') {
        return false;
      }

      if (isBatching) {
        batchQueue.push(patch);
        return true;
      }

      const result = applyPatch(currentState, patch);
      if (result.changed) {
        currentState = result.newState;
        notify(result);
      }
      return result.changed;
    },

    updateField: (key, value) => {
      if (isBatching) {
        batchQueue.push({ [key]: value });
        return true;
      }

      const result = updateFieldPure(currentState, key, value);
      if (result.changed) {
        currentState = result.newState;
        notify(result);
      }
      return result.changed;
    },

    updateNestedField: (key, patch) => {
      if (isBatching) {
        batchQueue.push({ [key]: patch });
        return true;
      }

      const result = updateNestedFieldPure(currentState, key, patch);
      if (result.changed) {
        currentState = result.newState;
        notify(result);
      }
      return result.changed;
    },

    reset: () => {
      const result = applyPatch(currentState, initialState);
      if (result.changed) {
        currentState = result.newState;
        notify({ ...result, actionType: 'reset' });
      }
      return result.changed;
    },

    batch: (callback) => {
      if (isBatching) {
        callback();
        return;
      }

      isBatching = true;
      try {
        callback();
      } finally {
        isBatching = false;
        flushBatch();
      }
    },

    subscribe: (listener) => {
      if (typeof listener !== 'function') {
        console.warn('[State] subscribe requires a function');
        return () => {};
      }

      listeners.add(listener);
      // Immediately call with current state (optional)
      // listener(getSnapshot());

      return () => listeners.delete(listener);
    },

    use: (middleware) => {
      if (typeof middleware !== 'function') {
        console.warn('[State] use requires a middleware function');
        return () => {};
      }

      middlewares.add(middleware);
      return () => middlewares.delete(middleware);
    },

    // Debug helpers (тільки для dev)
    _debug: {
      getCurrentState: () => currentState,
      getListenerCount: () => listeners.size,
      getMiddlewareCount: () => middlewares.size,
    },
  });
};

// ===== MIDDLEWARE PRESETS =====

/**
 * Middleware для логування змін
 * @template T
 * @param {string} label
 * @param {boolean} [verbose=false]
 * @returns {Middleware<T>}
 */
export const createLoggerMiddleware =
  (label, verbose = false) =>
  (ctx) => {
    if (verbose) {
      console.group(`[State:${label}] ${ctx.actionType}`);
      console.log('Changes:', ctx.changes);
      console.log('Prev:', ctx.prevState);
      console.log('Next:', ctx.nextState);
      console.groupEnd();
    } else {
      console.log(`[State:${label}] ${ctx.actionType}:`, Object.keys(ctx.changes));
    }
  };

/**
 * Middleware для збереження в localStorage
 * @template T
 * @param {string} storageKey
 * @param {Function} [serializer=JSON.stringify]
 * @returns {Middleware<T>}
 */
export const createPersistMiddleware =
  (storageKey, serializer = JSON.stringify) =>
  (ctx) => {
    try {
      const serialized = serializer(ctx.nextState);
      localStorage.setItem(storageKey, serialized);
    } catch (e) {
      console.warn(`[PersistMiddleware] Failed to save ${storageKey}:`, e);
    }
  };

/**
 * Middleware для відкату змін (undo/redo)
 * @template T
 * @param {number} maxHistory
 * @returns {{ middleware: Middleware<T>, undo: () => boolean, redo: () => boolean }}
 */
export const createUndoMiddleware = (maxHistory = 10) => {
  const history = [];
  let currentIndex = -1;

  const middleware = (ctx) => {
    // Зберігаємо історію тільки для реальних змін
    if (ctx.changes && Object.keys(ctx.changes).length > 0) {
      // Видаляємо "майбутнє" якщо ми не в кінці історії
      if (currentIndex < history.length - 1) {
        history.splice(currentIndex + 1);
      }

      history.push(cloneValue(ctx.nextState));
      if (history.length > maxHistory) {
        history.shift();
      }
      currentIndex = history.length - 1;
    }
  };

  const undo = () => {
    if (currentIndex > 0) {
      currentIndex--;
      return true;
    }
    return false;
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      currentIndex++;
      return true;
    }
    return false;
  };

  const getState = () => history[currentIndex];

  return {
    middleware,
    undo,
    redo,
    getState,
    canUndo: () => currentIndex > 0,
    canRedo: () => currentIndex < history.length - 1,
  };
};

export default createState;
