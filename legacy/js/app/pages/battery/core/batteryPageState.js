// js/app/pages/battery/core/batteryPageState.js

import { createState } from '../../../core/createState.js';

/**
 * @typedef {Object} BatteryPageState
 * @property {Object|null} price - прайс-лист
 * @property {Object|null} formConfig - конфігурація форми (опції селектів)
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/** @type {import('../../../core/createState.js').StateInstance<BatteryPageState>} */
export const batteryPageState = createState({
  price: null,
  formConfig: null,
  isLoading: false,
  error: null,
});

export default batteryPageState;
