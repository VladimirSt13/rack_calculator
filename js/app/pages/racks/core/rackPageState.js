// js/app/pages/racks/core/rackPageState.js

import { createState } from '../../../core/createState.js';

/**
 * @typedef {Object} RackPageState
 * @property {Object|null} price
 * @property {string[]} supportsOptions
 * @property {string[]} verticalSupportsOptions
 * @property {string[]} spanOptions
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/** @type {import('../../../core/createState.js').StateInstance<RackPageState>} */
export const pageState = createState({
  price: null,
  supportsOptions: [],
  verticalSupportsOptions: [],
  spanOptions: [],
  isLoading: false,
  error: null,
});

export default pageState;
