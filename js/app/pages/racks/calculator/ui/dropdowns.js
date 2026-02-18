// js/pages/racks/ui/dropdowns.js

import { generateDropdownOptionsHTML } from "./templates/dropdown.js";

/**
 * Populates the dropdowns with the given options.
 *
 * @param {Object} options - The options for populating the dropdowns.
 * @param {Array} options.verticalSupports - The options for the vertical supports dropdown.
 * @param {Array} options.supports - The options for the supports dropdown.
 * @param {Object} options.refs - The references to the DOM elements.
 * @param {HTMLElement} options.refs.verticalSupports - The reference to the vertical supports dropdown.
 * @param {HTMLElement} options.refs.supports - The reference to the supports dropdown.
 * @return {void}
 */
export const populateDropdowns = ({ verticalSupports, supports, refs }) => {
  refs.verticalSupports.innerHTML =
    generateDropdownOptionsHTML(verticalSupports);
  refs.supports.innerHTML = generateDropdownOptionsHTML(supports);
};
