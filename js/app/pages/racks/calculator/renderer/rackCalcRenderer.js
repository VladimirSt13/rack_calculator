// js/app/pages/racks/calculator/renderer.js

import { createRenderer } from '../../../../ui/createRenderer.js';
import { generateRackNameHTML } from '../ui/templates/rackName.js';
import { generateComponentsTableHTML } from '../ui/templates/componentsTable.js';

/**
 * Pure: render rack name from state
 * @param {import('../state/rackState.js').RackState} state
 * @returns {string}
 */
const renderRackName = (state) => {
  const rack = state.currentRack;
  if (!rack?.description || !rack?.abbreviation) {
    return '---';
  }
  return generateRackNameHTML({
    description: rack.description,
    abbreviation: rack.abbreviation,
  });
};

/**
 * Pure: render components table from state
 * @param {import('../state/rackState.js').RackState} state
 * @returns {string}
 */
const renderComponentsTable = (state) => {
  const rack = state.currentRack;
  if (!rack?.components) {
    return '<p class="empty-state">Недостатньо даних для розрахунку</p>';
  }
  return generateComponentsTableHTML({
    components: rack.components,
    totalCost: rack.totalCost,
  });
};

/**
 * Pure: render add-to-set button state
 * @param {import('../state/rackState.js').RackState} state
 * @returns {{ disabled: boolean, title: string }}
 */
const renderAddToSetButtonState = (state) => {
  const rack = state.currentRack;
  const hasData = !!rack?.totalCost && rack?.components && Object.keys(rack.components).length > 0;

  return {
    disabled: !hasData,
    title: hasData ? 'Додати стелаж до комплекту' : "Заповніть усі обов'язкові поля",
  };
};

export const rackNameRenderer = createRenderer(renderRackName);
export const componentsTableRenderer = createRenderer(renderComponentsTable);
export const addToSetButtonRenderer = createRenderer(renderAddToSetButtonState);

export default {
  rackNameRenderer,
  componentsTableRenderer,
  addToSetButtonRenderer,
};
