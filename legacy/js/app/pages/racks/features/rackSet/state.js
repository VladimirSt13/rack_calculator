// @ts-check
// js/app/pages/racks/features/rackSet/state.js

/**
 * @typedef {Object} RackInSet
 * @property {string} id - унікальний ID (абревіатура + довжина)
 * @property {import('../results/state.js').ResultsState} rack - дані стелажа з results
 * @property {import('../form/state.js').FormState | null} formConfig - параметри форми, за якими було розраховано стелаж
 * @property {number} qty - кількість таких стелажів у комплекті
 */

/**
 * @typedef {Object} SetState
 * @property {RackInSet[]} racks - масив стелажів у комплекті
 */

/**
 * Початковий стан комплекту стелажів
 * @type {SetState}
 */
export const initialSetState = {
  racks: [],
};

export default initialSetState;
