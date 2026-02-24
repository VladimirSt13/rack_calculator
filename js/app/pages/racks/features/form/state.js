// @ts-check
// js/app/pages/racks/features/form/state.js

/**
 * @typedef {Object} FormState
 * @property {number} floors - кількість поверхів
 * @property {string} verticalSupports - тип вертикальної опори
 * @property {string} supports - тип опори
 * @property {number} rows - кількість рядів
 * @property {number} beamsPerRow - балок в ряду
 */

/**
 * Початковий стан форми стелажа
 * @type {FormState}
 */
export const initialFormState = {
  floors: 1,
  verticalSupports: '',
  supports: '',
  rows: 1,
  beamsPerRow: 2,
};

export default initialFormState;
