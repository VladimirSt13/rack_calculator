// js/app/pages/racks/set/state/rackSetState.js

/**
 * @typedef {Object} RackSetItem
 * @property {string} id - унікальний ID (генерується з rack.abbreviation + totalLength)
 * @property {import('../../calculator/state/rackState.js').RackCalcResult} rack - повний результат розрахунку
 * @property {number} qty - кількість таких стелажів у комплекті
 */

/**
 * @typedef {Object} RackSetState
 * @property {RackSetItem[]} racks - масив стелажів у комплекті
 * @property {boolean} isModalOpen - чи відкрита модалка
 * @property {string | null} expandedRackId - ID розгорнутого стелажа (для деталей)
 */

/** @type {RackSetState} */
export const initialRackSetState = {
  racks: [],
  isModalOpen: false,
  expandedRackId: null,
};

export default initialRackSetState;
