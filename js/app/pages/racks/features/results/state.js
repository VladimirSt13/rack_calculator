// @ts-check
// js/app/pages/racks/features/results/state.js

/**
 * @typedef {Object} ComponentItem
 * @property {string} name - назва компонента
 * @property {number} amount - кількість
 * @property {number} price - ціна за одиницю
 * @property {number} total - загальна вартість (amount × price)
 */

/**
 * @typedef {Object} ResultsState
 * @property {string} name - назва стелажа (абревіатура)
 * @property {string} tableHtml - HTML таблиці компонентів
 * @property {number} total - загальна вартість
 * @property {number} totalWithoutIsolators - вартість без ізоляторів
 * @property {number} zeroBase - нульова вартість
 * @property {Object.<string, ComponentItem|ComponentItem[]>} components - компоненти за типами
 * @property {number|null} lastCalculated - timestamp останнього розрахунку
 */

/**
 * Початковий стан результатів
 * @type {ResultsState}
 */
export const initialResultsState = {
  name: '',
  tableHtml: '',
  total: 0,
  totalWithoutIsolators: 0,
  zeroBase: 0,
  components: {},
  lastCalculated: null,
};

export default initialResultsState;
