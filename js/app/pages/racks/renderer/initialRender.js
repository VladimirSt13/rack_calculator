// js/app/pages/racks/renderer/initialRender.js
import { componentsTableRenderer, rackNameRenderer } from '../calculator/renderer/renderer.js';
import { rackSetSummaryRenderer, rackSetTableRenderer } from '../set/renderer/rackSetRenderer.js';
import { getRackCalcSelectors } from '../calculator/effects/rackCalcEffects.js';
import { getRackSetSelectors } from '../set/effects/rackSetEffects.js';

/**
 * @typedef {import('../calculator/state/rackCalcState.js').RackState} RackState
 * @typedef {import('../set/state/rackSetState.js').RackSetState} RackSetState
 */

/**
 * Pure: initial render of calculator + rack set UI
 * @param {{ calcState: RackState, rackSetState: RackSetState }} states
 * @returns {void}
 */
export const initialRender = ({ calcState, rackSetState }) => {
  // Calculator
  const nameEl = getRackCalcSelectors().rackName();
  const tableEl = getRackCalcSelectors().componentsTable();
  if (nameEl) {
    rackNameRenderer.render(nameEl)(calcState);
  }
  if (tableEl) {
    componentsTableRenderer.render(tableEl)(calcState);
  }

  // Rack Set
  const pageTable = getRackSetSelectors().rackSetTable();
  const pageSummary = getRackSetSelectors().rackSetSummary();
  if (pageTable) {
    rackSetTableRenderer.render(pageTable)(rackSetState);
  }
  if (pageSummary) {
    rackSetSummaryRenderer.render(pageSummary)(rackSetState);
  }
};

export default initialRender;
