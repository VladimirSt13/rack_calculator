import { createState } from '../../../state/createState.js';
import { initialRackSetState } from './state/rackSetState.js';
import { createRackSetActions } from './state/rackSetActions.js';
import { createRackSetSelectors } from './state/rackSetSelectors.js';

/**
 * @typedef {import('./state/rackSetState.js').RackSetState} RackSetState
 */

/**
 * Creates isolated rack set context
 * @returns {{
 *   state: import('../../../state/createState.js').StateInstance<RackSetState>,
 *   actions: ReturnType<typeof createRackSetActions>,
 *   selectors: ReturnType<typeof createRackSetSelectors>,
 *   init: (opts: { onStateChange: (s: RackSetState) => void }) => void,
 *   destroy: () => void
 * }}
 */
export const createRackSetContext = () => {
  const state = createState({ ...initialRackSetState });
  const actions = createRackSetActions(state, initialRackSetState);
  const selectors = createRackSetSelectors(state);

  /** @type {(() => void) | null} */
  let unsubscribe = null;

  const init = ({ onStateChange }) => {
    unsubscribe = state.subscribe((currentState) => {
      onStateChange?.(currentState);
    });
  };

  const destroy = () => {
    unsubscribe?.();
    unsubscribe = null;
  };

  return { state, actions, selectors, init, destroy };
};
