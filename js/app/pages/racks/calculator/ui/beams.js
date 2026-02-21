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

/**
 * Removes a beam row from the beams container.
 *
 * @param {Object} options - The options for removing a beam row.
 * @param {number} options.id - The unique identifier of the beam row to be removed.
 * @param {Object} options.refs - The references to the DOM elements.
 * @return {void} This function does not return a value.
 */
export const removeBeamUI = ({ id, refs }) => {
  const row = refs.beamsContainer.querySelector(`[data-id="${id}"]`);
  if (row) row.remove();
};

/**
 * Clears the contents of the beams container.
 *
 * @param {Object} refs - The references to the DOM elements.
 * @return {void} This function does not return a value.
 */
export const clearBeamsUI = (refs) => {
  if (refs.beamsContainer) refs.beamsContainer.innerHTML = "";
};
