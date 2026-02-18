// js/app/racks/calculator/context/calculatorContext.js

import { createState } from "../../../../state/createState.js";
import { initialRackState } from "../state/rackState.js";
import { createRackActions } from "../state/rackActions.js";
import { createRackSelectors } from "../state/rackSelectors.js";
import { getRacksCalcRefs } from "../ui/dom.js";

/**
 * Creates a RackCalculator context object with state, selectors, actions, and utility functions.
 *
 * @return {Object} An object containing the following properties:
 *   - {Object} state: The state object for the RackCalculator context.
 *   - {Object} selectors: The selectors object for the RackCalculator context.
 *   - {Object} actions: The actions object for the RackCalculator context.
 *   - {Function} init: Initializes the RackCalculator context by setting up DOM references and subscribing to state changes.
 *   - {Function} destroy: Cleans up the RackCalculator context by unsubscribing from state changes.
 *   - {Function} getRefs: Returns the DOM references for the RackCalculator context.
 */
export const createRackCalculatorContext = () => {
  const state = createState({ ...initialRackState });
  const selectors = createRackSelectors(state);
  const actions = createRackActions(state, initialRackState);

  let unsubscribe = null;
  let onChange = null;
  let refs = null;

  const ensureInit = (value, name) => {
    if (!value) throw new Error(`${name} is not initialized`);
    return value;
  };

  const init = (listener) => {
    onChange = listener;
    refs = getRacksCalcRefs();
    unsubscribe = state.subscribe(() => onChange?.());
  };

  const getRefs = () => {
    return ensureInit(refs, "RackCalculator refs");
  };

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
