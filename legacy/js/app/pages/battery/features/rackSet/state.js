// js/app/pages/battery/features/rackSet/state.js

/**
 * @typedef {Object} BatteryVariantInSet
 * @property {string} id - унікальний ID (абревіатура + індекс)
 * @property {Object} variant - дані варіанту з results
 * @property {number} qty - кількість таких стелажів у комплекті
 */

/**
 * @typedef {Object} BatterySetState
 * @property {BatteryVariantInSet[]} variants - масив варіантів у комплекті
 */

/**
 * Початковий стан комплекту стелажів
 * @type {BatterySetState}
 */
export const initialBatterySetState = {
  variants: [],
};

export default initialBatterySetState;
