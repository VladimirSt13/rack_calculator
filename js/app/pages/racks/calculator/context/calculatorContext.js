// js/app/racks/calculator/context/calculatorContext.js

import { createState } from "../../../../state/createState.js";
import { initialRackState } from "../state/rackState.js";
import { createRackActions } from "../state/rackActions.js";
import { createRackSelectors } from "../state/rackSelectors.js";
import { getRacksCalcRefs } from "../ui/dom.js";
import { calculateComponents } from "../core/calculator.js";

/**
 * Creates a context for the rack calculator page.
 * The context includes the state, selectors and actions for the calculator.
 * It also includes an init function to initialize the refs and subscribe to state changes,
 * a getRefs function to retrieve the refs, a destroy function to unsubscribe from state changes.
 * @returns {Object} An object containing the state, selectors, actions, init, destroy and getRefs functions.
 */
export const createRackCalculatorContext = () => {
  const state = createState({ ...initialRackState });
  const selectors = createRackSelectors(state);
  const actions = createRackActions(state, initialRackState);

  let unsubscribe = null;
  let onChange = null;
  let refs = null;
  let priceRef = null;

  const ensureInit = (value, name) => {
    if (!value) throw new Error(`${name} is not initialized`);
    return value;
  };

  const init = ({ listener, price }) => {
    priceRef = price;
    onChange = listener;
    refs = getRacksCalcRefs();
    let prevForm = null;
    let prevRackJSON = "";

    unsubscribe = state.subscribe((currentState) => {
      const { form } = currentState;

      if (prevForm === form) {
        onChange?.();
        return;
      }

      prevForm = form;

      // Розрахунок нового currentRack
      if (!price || Object.keys(price).length === 0 || !form) return;

      const rackConfig = {
        floors: form.floors,
        rows: form.rows,
        beams: [...form.beams.values()],
        supports: form.supports,
        verticalSupports: form.verticalSupports,
        beamsPerRow: form.beamsPerRow,
      };

      const canCalculate =
        rackConfig.floors &&
        (rackConfig.floors === 1 || rackConfig.verticalSupports) &&
        rackConfig.rows &&
        rackConfig.supports &&
        rackConfig.beams.length > 0 &&
        rackConfig.beams.every((b) => b.item && b.quantity);

      if (!canCalculate) return;

      const { currentRack: newRack } = calculateComponents({ rackConfig, price });
      newRack.form = { ...rackConfig };

      const newRackJSON = JSON.stringify(newRack);
      if (newRackJSON !== prevRackJSON) {
        prevRackJSON = newRackJSON;
        state.updateField("currentRack", newRack);
      }

      onChange?.();
    });
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
