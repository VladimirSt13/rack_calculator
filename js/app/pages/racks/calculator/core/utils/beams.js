// js/pages/racks/core/utils/beams.js

/**
 * Об’єднання повторюваних балок у масив { name, amount, price }
 * @param {Array} beams - масив об’єктів { item, quantity }
 * @param {number} rows
 * @param {number} beamsPerRow
 * @param {Array} beamsData - дані прайсу для балок
 * @returns {Array} масив { name, amount, price }
 */
export const calculateBeams = ({ beams, rows, beamsPerRow, beamsData, floors }) => {
  const beamsCount = {};
  beams.forEach((beam) => {
    const code = beam.item;
    const qty = Number(beam.quantity || 0) * (rows || 1) * (beamsPerRow || 1) * (floors || 1);
    beamsCount[code] = (beamsCount[code] || 0) + qty;
  });

  const res = Object.entries(beamsCount).map(([code, amount]) => {
    const price = beamsData.find((b) => b[0] === code)?.[1]?.price || 0;
    return { name: `Балка ${code}`, amount, price };
  });

  return res;
};

/**
 * Розрахунок загальної довжини стелажа
 * @param {Array} beams - масив об’єктів { item, quantity }
 * @returns {number} довжина
 */
export const calculateRackLength = (beams) => {
  return beams.reduce((length, beam) => {
    const itemLength = Number(beam.item);
    const qty = Number(beam.quantity);
    if (!isNaN(itemLength) && !isNaN(qty)) {
      return length + itemLength * qty;
    }
    return length;
  }, 0);
};

/**
 * Підрахунок загальної кількості прольотів
 * @param {Array} beams - масив об’єктів { quantity }
 * @returns {number} загальна кількість прольотів
 */
export const calculateTotalSpans = (beams) => {
  return beams.reduce((total, beam) => {
    const qty = Number(beam.quantity);
    return total + (isNaN(qty) ? 0 : qty);
  }, 0);
};
