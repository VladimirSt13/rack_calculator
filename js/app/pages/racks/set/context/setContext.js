// js/app/pages/racks/set/context/setContext.js

import { createState } from "../../../../state/createState.js";
import { initialRackSetState } from "../state/rackSetState.js";
import { createRackSetActions } from "../state/rackSetActions.js";
import { createRackSetSelectors } from "../state/rackSetSelectors.js";
import { renderRackSet } from "../ui/renderRackSet.js";
import { getRackSetRefs } from "../ui/dom.js";

export const createRackSetContext = () => {
  const state = createState(initialRackSetState);
  const selectors = createRackSetSelectors(state);
  const actions = createRackSetActions(state, initialRackSetState);

  let refs = null;
  let unsubscribe = null;

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

    unsubscribe = state.subscribe(() => renderRackSet({ actions, selectors, refs }));
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
