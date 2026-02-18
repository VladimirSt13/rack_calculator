// js/app/pages/racks/ui/beams.js"

import { generateBeamRowHTML } from "./templates/beamRow.js";

/**
 * Inserts a new beam row into the beams container.
 *
 * @param {Object} options - The options for inserting a new beam row.
 * @param {number} options.id - The unique identifier for the new beam row.
 * @param {Array} options.beamsData - The data for the beams.
 * @param {Object} options.refs - The references to the DOM elements.
 * @return {void} This function does not return a value.
 */
export const insertBeamUI = ({ id, beamsData, refs }) => {
  const html = generateBeamRowHTML(id, beamsData);
  refs.beamsContainer.insertAdjacentHTML("beforeend", html);
};

export const removeBeamUI = (id) => {
  const row = racksCalcRefs.beamsContainer.querySelector(`[data-id="${id}"]`);
  if (row) row.remove();
};

export const clearBeamsUI = (refs) => {
  if (racksCalcRefs.beamsContainer) refs.beamsContainer.innerHTML = "";
};

export const toggleVerticalSupportsUI = (floors) => {
  const disabled = floors < 2;
  racksCalcRefs.verticalSupports.disabled = disabled;
  if (disabled) racksCalcRefs.verticalSupports.selectedIndex = -1;
};
