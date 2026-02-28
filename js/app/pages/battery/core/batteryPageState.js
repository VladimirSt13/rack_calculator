// js/app/pages/battery/core/batteryPageState.js

import { createState } from '../../../core/createState.js';

/**
 * @typedef {Object} BatteryPageState
 * @property {Object|null} price
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/** @type {import('../../../core/createState.js').StateInstance<BatteryPageState>} */
export const batteryPageState = createState({
  price: null,
  isLoading: false,
  error: null,
});

export default batteryPageState;
