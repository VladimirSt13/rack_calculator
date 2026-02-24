// js/app/pages/racks/features/set/state.js

/**
 * @typedef {Object} RackInSet
 * @property {string} id - унікальний ID (абревіатура + довжина)
 * @property {import('../results/state.js').ResultsState} rack - дані стелажа з results
 * @property {number} qty - кількість таких стелажів у комплекті
 */

/**
 * @typedef {Object} SetState
 * @property {RackInSet[]} racks - масив стелажів у комплекті
 * @property {boolean} isModalOpen - чи відкрита модалка перегляду комплекту
 */

/**
 * Початковий стан комплекту стелажів
 * @type {SetState}
 */
export const initialSetState = {
  racks: [],
  isModalOpen: false,
};

export default initialSetState;
