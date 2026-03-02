// js/app/pages/racks/core/calculator.js

import { log } from '../../../config/env.js';
import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateComponentsTable,
  generateRackName,
} from '../../../core/rackCalculator.js';

/**
 * Перевірити наявність обов'язкових даних
 * Виводить лог з назвою функції та відсутнім полем
 * @param {any} value - значення для перевірки
 * @param {string} fieldName - назва поля
 * @param {string} callerFn - назва функції, що викликає
 * @returns {boolean} - true якщо валідне, false якщо ні
 */
const validateRequired = (value, fieldName, callerFn) => {
  if (!value) {
    log(`[${callerFn}] Missing required field: ${fieldName}`);
    return false;
  }
  return true;
};

/**
 * @typedef {Object} RackConfig
 * @property {number} floors - кількість поверхів
 * @property {number} rows - кількість рядів
 * @property {number} beamsPerRow - балок в ряду
 * @property {string} supports - тип опори
 * @property {string} verticalSupports - тип вертикальної опори
 * @property {Array<{ item: string, quantity: number|null }>} spans - прольоти
 */

/**
 * @typedef {Object} PriceData
 * @property {Object.<string, { price: number }>} spans - ціни на прольоти (балки)
 * @property {Object.<string, { edge: { price: number }, intermediate: { price: number } }>} supports - ціни на опори
 * @property {Object.<string, { price: number }>} vertical_supports - ціни на вертикальні стійки
 * @property {Object.<string, { price: number }>} diagonal_brace - ціни на розкоси
 * @property {Object.<string, { price: number }>} isolator - ціни на ізолятори
 */

/**
 * @typedef {Object} ComponentItem
 * @property {string} name - назва компонента
 * @property {number} amount - кількість
 * @property {number} price - ціна за одиницю
 * @property {number} total - загальна вартість
 */

/**
 * @typedef {Object} CalculationResult
 * @property {string} name - назва стелажа (абревіатура)
 * @property {string} tableHtml - HTML таблиці компонентів
 * @property {number} total - загальна вартість
 * @property {number} totalWithoutIsolators - вартість без ізоляторів
 * @property {number} zeroBase - нульова вартість (total * 1.44)
 * @property {Object.<string, ComponentItem|ComponentItem[]>} components - компоненти за типами
 */

/**
 * @typedef {Object} CalculatorInput
 * @property {import('../features/form/state.js').FormState} form
 * @property {import('../features/spans/state.js').SpansState} spans
 * @property {PriceData} price
 */

/**
 * Pure function: розрахунок стелажа
 * @param {CalculatorInput} data
 * @returns {CalculationResult | null}
 */
export const calculateRack = (data) => {
  log('[calculateRack] start');
  const {
    form: { form },
    spans: spansMap,
    price,
  } = data;
  let spans = [];
  if (spansMap.spans.size > 0) {
    spans = Array.from(spansMap.spans.values());
  }

  // 1. Валідація вхідних даних
  if (
    !validateRequired(form, 'form', 'calculateRack') ||
    !validateRequired(price, 'price', 'calculateRack') ||
    !validateRequired(spans.length, 'spans', 'calculateRack') ||
    !validateRequired(form.floors, 'form.floors', 'calculateRack') ||
    !validateRequired(form.rows, 'form.rows', 'calculateRack') ||
    !validateRequired(form.supports, 'form.supports', 'calculateRack') ||
    !validateRequired(form.beamsPerRow, 'form.beamsPerRow', 'calculateRack') ||
    (form.floors > 1 &&
      !validateRequired(form.verticalSupports, 'form.verticalSupports', 'calculateRack'))
  ) {
    return null;
  }
  log('[calculateRack] form', form);

  const isEnoughDataForCalculation =
    price !== null ||
    form.floors ||
    form.rows ||
    spans.length ||
    form.supports ||
    form.beamsPerRow ||
    !(form.floors > 1 && form.verticalSupports);

  if (!isEnoughDataForCalculation) {
    log('[calculateRack] not enough data for calculation');
    return null;
  }

  // 2. Фільтрація валідних прольотів
  const validSpans = spans ? spans.filter((s) => s.item && s.quantity > 0) : [];

  if (validSpans.length === 0) {
    log('[calculateRack] no valid spans');
    return null;
  }

  // 3. Розрахунок параметрів стелажа
  const rackConfig = {
    floors: form.floors,
    rows: form.rows,
    beamsPerRow: form.beamsPerRow,
    supports: form.supports,
    verticalSupports: form.verticalSupports,
    spans: validSpans,
  };
  log('[calculateRack] rackConfig', rackConfig);
  // 4. Розрахунок компонентів
  const components = calculateRackComponents(rackConfig, price);

  // 5. Генерація назви
  const name = generateRackName(rackConfig);

  // 6. Генерація HTML таблиці (за замовчуванням показуємо ціни)
  const tableHtml = generateComponentsTable(components, true);

  // 7. Підрахунок загальної вартості
  const total = calculateTotalCost(components);
  const totalWithoutIsolators = calculateTotalWithoutIsolators(components);
  const zeroBase = total * 1.44;

  return {
    name,
    tableHtml,
    total: Math.round(total * 100) / 100,
    totalWithoutIsolators: Math.round(totalWithoutIsolators * 100) / 100,
    zeroBase: Math.round(zeroBase * 100) / 100,
    components,
  };
};

export default calculateRack;
