// js/app/pages/racks/calculator/renderer/onStateChange.js

import { addToSetButtonRenderer, componentsTableRenderer, rackNameRenderer } from './renderer.js';
import { getRackCalcSelectors } from '../effects/rackCalcEffects.js';
import { updateAddToSetButton } from '../effects/rackCalcEffects.js';

/**
 * @typedef {import('../state/rackCalcState.js').RackState} RackState
 */

/**
 * Pure callback: render calculator UI when state changes
 * @param {RackState} state
 * @returns {void}
 */
export const onCalculatorStateChange = (state) => {
  const nameEl = getRackCalcSelectors().rackName();
  const tableEl = getRackCalcSelectors().componentsTable();
  const btnEl = getRackCalcSelectors().addToSetBtn();

  if (nameEl) {
    rackNameRenderer.render(nameEl)(state);
  }
  if (tableEl) {
    componentsTableRenderer.render(tableEl)(state);
  }
  if (btnEl) {
    const btnState = addToSetButtonRenderer.toHTML(state);
    updateAddToSetButton(btnState)();
  }
};
