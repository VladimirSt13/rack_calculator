// js/app/pages/battery/core/batteryCalculator.js

import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateBatteryRackName,
} from '../../../core/rackCalculator.js';
import { log } from '../../../config/env.js';

/**
 * @typedef {Object} BatteryRackConfig
 * @property {number} floors - кількість поверхів
 * @property {number} rows - кількість рядів
 * @property {string} supportType - тип опори ('straight'|'step')
 * @property {number} length - довжина стелажа
 * @property {number} width - ширина стелажа
 * @property {number} height - висота стелажа
 * @property {Array<number>} spans - прольоти [600, 600, 750]
 * @property {number} beams - кількість балок на проліт (з розрахунку вантажопідйомності)
 */

/**
 * @typedef {Object} PriceData
 * @property {Object} supports
 * @property {Object} spans
 * @property {Object} vertical_supports
 * @property {Object} diagonal_brace
 * @property {Object} isolator
 */

/**
 * @typedef {Object} BatteryCalculationResult
 * @property {string} name - абревіатура стелажа
 * @property {Object.<string, any>} components
 * @property {number} total - загальна вартість
 * @property {number} totalWithoutIsolators - вартість без ізоляторів
 * @property {number} zeroBase - нульова вартість (total × 1.44)
 */

/**
 * Розрахунок вартості стелажа для battery page
 * @param {BatteryRackConfig} rackConfig
 * @param {PriceData} price
 * @returns {BatteryCalculationResult | null}
 */
export const calculateBatteryRack = (rackConfig, price) => {
  log('[calculateBatteryRack] start', rackConfig);

  const {
    floors,
    rows,
    supportType,
    length: rackLength,
    width: rackWidth,
    spans,
  } = rackConfig;

  // 1. Валідація
  if (!spans || spans.length === 0) {
    log('[calculateBatteryRack] No spans provided');
    return null;
  }

  if (!price) {
    log('[calculateBatteryRack] No price data');
    return null;
  }

  // 2. Конфігурація для спільного калькулятора
  const config = {
    floors,
    rows,
    beamsPerRow: 2, // стандарт для battery
    spansArray: spans, // масив прольотів [600, 600, 750]
    beams: rackConfig.beams || 2, // кількість балок в ряду на проліт
  };

  // 3. Розрахунок компонентів (спільна функція)
  const components = calculateRackComponents(config, price);

  // 4. Генерація назви (спільна функція)
  const name = generateBatteryRackName({
    floors,
    rows,
    supportType,
    rackWidth,
    rackLength,
    spans,
  });

  // 5. Підрахунок вартості (спільні функції)
  const total = calculateTotalCost(components);
  const totalWithoutIsolators = calculateTotalWithoutIsolators(components);
  const zeroBase = total * 1.44;

  return {
    name,
    components,
    total: Math.round(total * 100) / 100,
    totalWithoutIsolators: Math.round(totalWithoutIsolators * 100) / 100,
    zeroBase: Math.round(zeroBase * 100) / 100,
  };
};

export default calculateBatteryRack;
