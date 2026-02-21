// js/app/pages/racks/set/context/setContext.js

import { createState } from "../../../../state/createState.js";
import { initialRackSetState } from "../state/rackSetState.js";
import { createRackSetActions } from "../state/rackSetActions.js";
import { createRackSetSelectors } from "../state/rackSetSelectors.js";
import { renderRackSet } from "../ui/renderRackSet.js";
import { getRackSetRefs } from "../ui/dom.js";

/**
 * Creates a context for the rack set page.
 * The context includes the state, selectors and actions for the rack set page.
 * It also includes an init function to initialize the refs and subscribe to state changes,
 * a getRefs function to retrieve the refs, a destroy function to unsubscribe from state changes.
 * @returns {Object} An object containing the state, selectors, actions, init, destroy and getRefs functions.
 */
export const createRackSetContext = () => {
  const state = createState(initialRackSetState);
  const selectors = createRackSetSelectors(state);
  const actions = createRackSetActions(state, initialRackSetState);

  let refs = null;
  let unsubscribe = null;

  /**
   * Ensures that a value is initialized.
   * If the value is not initialized, throws an error.
   * @param {*} value - The value to check.
   * @param {string} name - The name of the value for the error message.
   * @returns {*} The initialized value.
   * @throws {Error} If the value is not initialized.
   */
  const ensureInit = (value, name) => {
    if (!value) throw new Error(`${name} is not initialized`);
    return value;
  };

  /**
   * Initializes the context for the rack set page.
   * @param {Object} opts - An object containing the onEditRack function to be called when the user edits the rack.
   * @param {Function} opts.onEditRack - A function to be called when the user edits the rack.
   */
  const init = () => {
    refs = getRackSetRefs();

    unsubscribe = state.subscribe(() => renderRackSet({ actions, selectors, refs, showDetails: false }));
  };

  const getRefs = () => ensureInit(refs, "RackCalculator refs");

  const destroy = () => unsubscribe?.();

  return {
    state,
    selectors,
    actions,
    init,
    destroy,
    getRefs,
  };
};
