// js/app/core/FeatureContext.js

import { createState } from './createState.js';

/**
 * @template T
 * @typedef {Object} FeatureContext
 * @property {import('./createState.js').StateInstance<T>} state - immutable state instance
 * @property {Record<string, Function>} actions - functions to modify state
 * @property {Record<string, Function>} selectors - functions to read state
 * @property {(callback: (state: T) => void) => () => void} subscribe - subscribe to state changes
 * @property {() => T} get - get current state snapshot
 */

/**
 * @template T
 * @typedef {Object} FeatureConfig
 * @property {string} name - feature name for debugging (e.g., 'form', 'spans', 'results')
 * @property {T} initialState - initial state value
 * @property {(state: import('./createState.js').StateInstance<T>) => Record<string, Function>} [createActions] - factory for actions
 * @property {(state: import('.createState.js').StateInstance<T>) => Record<string, Function>} [createSelectors] - factory for selectors
 */

/**
 * Creates isolated feature context with state + actions + selectors
 * @template T
 * @param {FeatureConfig<T>} config
 * @returns {FeatureContext<T>}
 *
 * @example
 * const formFeature = createFeatureContext({
 *   name: 'form',
 *   initialState: { floors: 1, rows: 1, spans: new Map() },
 *   createActions: (state) => ({
 *     updateField: (field, value) => state.updateNestedField('form', { [field]: value }),
 *     reset: () => state.reset(),
 *   }),
 *   createSelectors: (state) => ({
 *     getForm: () => state.get().form,
 *     getData: () => state.get(), // for PageContext.collectInputData()
 *   }),
 * });
 */
export const createFeatureContext = ({
  name,
  initialState,
  createActions = () => ({}),
  createSelectors = () => ({}),
}) => {
  // Create immutable state instance
  const state = createState(initialState);

  // Create actions bound to state
  const actions = createActions(state);

  // Create selectors bound to state
  const selectors = createSelectors(state);

  // Add default getData selector if not provided (for PageContext integration)
  if (!selectors.getData) {
    selectors.getData = () => state.get();
  }

  // Add default get selector if not provided
  if (!selectors.get) {
    selectors.get = () => state.get();
  }

  /**
   * Subscribe to state changes
   * @param {(state: T) => void} callback
   * @returns {() => void} unsubscribe function
   */
  const subscribe = (callback) => state.subscribe(callback);

  /**
   * Get current state snapshot
   * @returns {T}
   */
  const get = () => state.get();

  // Debug logging in dev mode
  if (
    import.meta?.env?.DEV ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')
  ) {
    console.log(`[FeatureContext] "${name}" initialized`, {
      initialState,
      actions: Object.keys(actions),
      selectors: Object.keys(selectors),
    });
  }

  return Object.freeze({
    name,
    state,
    actions,
    selectors,
    subscribe,
    get,
  });
};

/**
 * Helper: create simple feature with minimal boilerplate
 * @template T
 * @param {string} name
 * @param {T} initialState
 * @param {Record<string, (state: T, ...args: any[]) => any>} actionsMap
 * @returns {FeatureContext<T>}
 *
 * @example
 * const spans = createSimpleFeature('spans', { spans: new Map(), nextId: 1 }, {
 *   addSpan: (state) => { /* ... *\/ },
 *   removeSpan: (state, id) => { /* ... *\/ },
 * });
 */
export const createSimpleFeature = (name, initialState, actionsMap) =>
  createFeatureContext({
    name,
    initialState,
    createActions: (state) => {
      const actions = {};
      for (const [actionName, actionFn] of Object.entries(actionsMap)) {
        actions[actionName] = (...args) => actionFn(state.get(), ...args);
      }
      return actions;
    },
  });

export default createFeatureContext;
