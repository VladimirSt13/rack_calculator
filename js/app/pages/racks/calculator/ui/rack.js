// js/app pages/racks/ui/rack.js

/**
 * Updates the innerHTML of the rackName element with the provided HTML.
 *
 * @param {Object} params - An object containing the following properties:
 *   @property {Object} refs - An object containing references to DOM elements.
 *   @property {string} html - The HTML to be set as the innerHTML of the rackName element.
 * @return {void} This function does not return a value.
 */
export const updateRackName = ({ refs, html }) =>
  (refs.rackName.innerHTML = html);

/**
 * Updates the innerHTML of the componentsTable element with the provided HTML.
 *
 * @param {Object} params - An object containing the following properties:
 *   @param {Object} refs - An object containing references to DOM elements.
 *   @param {string} html - The HTML to be set as the innerHTML of the componentsTable element.
 * @return {void} This function does not return a value.
 */
export const updateComponentsTable = ({ refs, html }) =>
  (refs.componentsTable.innerHTML = html);
