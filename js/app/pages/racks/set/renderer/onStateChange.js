// js/app/pages/racks/set/renderer/onStateChange.js
import { rackSetSummaryRenderer, rackSetTableRenderer } from './rackSetRenderer.js';
import { getRackSetSelectors } from '../effects/rackSetEffects.js';

/**
 * @typedef {import('../state/rackSetState.js').RackSetState} RackSetState
 */

/**
 * Pure callback: render rack set UI when state changes
 * @param {RackSetState} state
 * @returns {void}
 */
export const onRackSetStateChange = (state) => {
  const tableEl = getRackSetSelectors().rackSetTable();
  const summaryEl = getRackSetSelectors().rackSetSummary();

  if (tableEl) {
    rackSetTableRenderer.render(tableEl)(state);
  }
  if (summaryEl) {
    rackSetSummaryRenderer.render(summaryEl)(state);
  }
};

export default onRackSetStateChange;
