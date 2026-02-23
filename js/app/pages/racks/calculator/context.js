// js/app/pages/racks/calculator/context.js
import { createState } from '../../../state/createState.js';
import { initialRackCalcState } from './state/rackCalcState.js';
import { createRackCalcActions } from './state/rackCalcActions.js';
import { createRackCalcSelectors } from './state/rackCalcSelectors.js';
import { calculateComponents } from './core/calculator.js';
import { serializeForm } from '../utils/serializeForm.js';

/**
 * @typedef {import('./state/rackCalcState.js').RackState} RackState
 */

/**
 * Creates isolated calculator context
 * @returns {{
 *   state: import('../../../state/createState.js').StateInstance<RackState>,
 *   actions: ReturnType<typeof createRackCalcActions>,
 *   selectors: ReturnType<typeof createRackCalcSelectors>,
 *   init: (opts: { price: any, onStateChange: (s: RackState) => void }) => void,
 *   destroy: () => void
 * }}
 */
export const createCalculatorContext = () => {
  const state = createState({ ...initialRackCalcState });
  const actions = createRackCalcActions(state, initialRackCalcState);
  const selectors = createRackCalcSelectors(state);

  /** @type {(() => void) | null} */
  let unsubscribe = null;
  /** @type {any} */
  let priceRef = null;

  const init = ({ price, onStateChange }) => {
    priceRef = price;
    let prevFormSerialized = null;
    let prevRackJSON = '';

    unsubscribe = state.subscribe((currentState) => {
      const { form } = currentState;
      const currentFormSerialized = serializeForm(form);

      if (prevFormSerialized === currentFormSerialized) {
        return;
      }
      prevFormSerialized = currentFormSerialized;

      if (!price || Object.keys(price).length === 0 || !form) {
        return;
      }

      const rackConfig = {
        floors: form.floors,
        rows: form.rows,
        beams: [...form.beams.values()].map((beam) => ({ ...beam })),
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

      if (!canCalculate) {
        if (selectors.getCurrentRack() !== null) {
          actions.clearCurrentRack();
          onStateChange?.(state.get());
        }
        return;
      }

      const { newRack } = calculateComponents({ rackConfig, price: priceRef });
      if (newRack) {
        const newRackJSON = JSON.stringify(newRack);
        if (newRackJSON !== prevRackJSON) {
          prevRackJSON = newRackJSON;
          actions.batchCurrentRack(newRack);
          onStateChange?.(state.get());
        }
      }
    });
  };

  const destroy = () => {
    unsubscribe?.();
    unsubscribe = null;
  };
  return { state, actions, selectors, init, destroy };
};
