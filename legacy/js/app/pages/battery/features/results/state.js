// js/app/pages/battery/features/results/state.js

/**
 * @typedef {Object} BatteryVariant
 * @property {number} floors - кількість поверхів
 * @property {number} rows - кількість рядів
 * @property {string} supportType - тип опори
 * @property {number} length - довжина стелажа
 * @property {number} width - ширина стелажа
 * @property {number} height - висота стелажа
 * @property {Array<number>} combination - прольоти [600, 600, 750]
 * @property {number} beams - кількість балок
 * @property {string} name - абревіатура стелажа
 * @property {Object.<string, any>} components - комплектуючі
 * @property {number} total - загальна вартість
 * @property {number} totalWithoutIsolators - вартість без ізоляторів
 * @property {number} zeroBase - нульова вартість
 */

/**
 * Початковий стан результатів battery
 * @type {Object}
 */
export const initialBatteryResultsState = {
  variants: [], // масив варіантів стелажів з розрахунком вартості
};
