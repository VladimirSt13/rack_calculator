// js/app/pages/racks/core/calculator.js

import { log } from '../../../config/env.js';

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
  const components = calculateComponents(rackConfig, price);

  // 5. Генерація назви
  const name = generateRackName(rackConfig);

  // 6. Генерація HTML таблиці
  const tableHtml = generateComponentsTable(components);

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

/**
 * Розрахунок всіх компонентів стелажа
 * @param {RackConfig} config
 * @param {PriceData} price
 * @returns {Object.<string, ComponentItem|ComponentItem[]>}
 */
const calculateComponents = (config, price) => {
  const components = {};

  // 1. Опори (supports)
  const supportsData = calculateSupports(config, price);
  if (supportsData.length > 0) {
    components.supports = supportsData;
  }

  // 2. Балки (beams)
  const beamsData = calculateSpans(config, price);
  if (beamsData.length > 0) {
    components.beams = beamsData;
  }

  // 3. Вертикальні стійки (якщо поверхів > 1)
  if (config.floors > 1 && config.verticalSupports) {
    const verticalData = calculateVerticalSupports(config, price);
    if (verticalData) {
      components.verticalSupports = verticalData;
    }
  }

  // 4. Розкоси (якщо поверхів > 1)
  if (config.floors > 1) {
    const bracesData = calculateBraces(config, price);
    if (bracesData) {
      components.braces = bracesData;
    }
  }

  // 5. Ізолятори (якщо 1 поверх)
  if (config.floors === 1) {
    const isolatorsData = calculateIsolators(config, price);
    if (isolatorsData) {
      components.isolators = isolatorsData;
    }
  }
  log('components', components);
  return components;
};

/**
 * Розрахунок опор
 * @param {RackConfig} config
 * @param {PriceData} price
 * @returns {ComponentItem[]}
 */
const calculateSupports = (config, price) => {
  const { floors, spans, supports } = config;
  const result = [];

  // Кількість прольотів
  const totalSpans = spans.reduce((sum, s) => sum + (s.quantity || 0), 0);

  // Крайні опори: 2 × поверхи
  const edgeSupports = 2 * floors;
  // Проміжні опори: (прольоти - 1) × поверхи
  const intermediateSupports = Math.max(0, totalSpans - 1) * floors;

  // Ціни з прайсу
  const supportPrice = price.supports?.[supports];
  if (supportPrice) {
    if (edgeSupports > 0) {
      result.push({
        name: `Опора ${supports} (крайня)`,
        amount: edgeSupports,
        price: supportPrice.edge?.price || 0,
        total: edgeSupports * (supportPrice.edge?.price || 0),
      });
    }
    if (intermediateSupports > 0) {
      result.push({
        name: `Опора ${supports} (пром)`,
        amount: intermediateSupports,
        price: supportPrice.intermediate?.price || 0,
        total: intermediateSupports * (supportPrice.intermediate?.price || 0),
      });
    }
  }

  return result;
};

/**
 * Розрахунок балок
 * @param {RackConfig} config
 * @param {PriceData} price
 * @returns {ComponentItem[]}
 */
const calculateSpans = (config, price) => {
  const { rows, beamsPerRow, spans, floors } = config;
  const spansMap = new Map();

  // Групуємо балки за типом
  spans.forEach((span) => {
    const code = span.item;
    const qty = (span.quantity || 0) * rows * beamsPerRow * floors;
    const current = spansMap.get(code) || 0;
    spansMap.set(code, current + qty);
  });

  const result = [];
  spansMap.forEach((amount, code) => {
    const beamPrice = price.spans?.[code]?.price || 0;
    result.push({
      name: `Балка ${code}`,
      amount,
      price: beamPrice,
      total: amount * beamPrice,
    });
  });

  result.sort((a, b) => {
    const aCode = parseInt(a.name.replace('Балка ', '')) || 0;
    const bCode = parseInt(b.name.replace('Балка ', '')) || 0;
    return aCode - bCode;
  });

  return result;
};

/**
 * Розрахунок вертикальних стійок
 * @param {RackConfig} config
 * @param {PriceData} price
 * @returns {ComponentItem|null}
 */
const calculateVerticalSupports = (config, price) => {
  const { floors, spans, rows, verticalSupports } = config;
  if (!verticalSupports || floors <= 1) {
    return null;
  }

  // Кількість прольотів + 1 = кількість стійок в ряду
  const totalSpans = spans.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const standsPerRow = totalSpans + 1;
  const totalStands = standsPerRow * 2 * rows; // 2 сторони × ряди

  const standPrice = price.vertical_supports?.[verticalSupports]?.price || 0;

  return {
    name: `Верт. стійка ${verticalSupports}`,
    amount: totalStands,
    price: standPrice,
    total: totalStands * standPrice,
  };
};

/**
 * Розрахунок розкосів
 * @param {RackConfig} config
 * @param {PriceData} price
 * @returns {ComponentItem|null}
 */
const calculateBraces = (config, price) => {
  const { floors, spans, rows } = config;
  if (floors <= 1) {
    return null;
  }

  const totalSpans = spans.reduce((sum, s) => sum + (s.quantity || 0), 0);

  // Формула розкосів: (прольоти - 1) × 2 + 2
  const bracesPerSide = totalSpans > 1 ? (totalSpans - 1) * 2 + 2 : 2;
  const totalBraces = bracesPerSide * rows; // × ряди

  // Беремо перший доступний розкос з прайсу
  const braceCode = Object.keys(price.diagonal_brace || {})[0];
  const bracePrice = price.diagonal_brace?.[braceCode]?.price || 0;

  return {
    name: 'Розкос',
    amount: totalBraces,
    price: bracePrice,
    total: totalBraces * bracePrice,
  };
};

/**
 * Розрахунок ізоляторів
 * @param {RackConfig} config
 * @param {PriceData} price
 * @returns {ComponentItem|null}
 */
const calculateIsolators = (config, price) => {
  const { floors, spans, rows, supports } = config;
  if (floors > 1) {
    return null;
  }

  const totalSpans = spans.reduce((sum, s) => sum + (s.quantity || 0), 0);

  // Кількість опор × 2 ізолятори на опору
  const edgeSupports = 2 * rows;
  const intermediateSupports = Math.max(0, totalSpans - 1) * rows;
  const totalSupports = edgeSupports + intermediateSupports;
  const totalIsolators = totalSupports * 2;

  const isolatorPrice = price.isolator?.isolator?.price || 0;

  return {
    name: 'Ізолятор',
    amount: totalIsolators,
    price: isolatorPrice,
    total: totalIsolators * isolatorPrice,
  };
};

/**
 * Генерація назви стелажа
 * @param {RackConfig} config
 * @returns {string}
 */
const generateRackName = (config) => {
  const { floors, rows, spans, supports } = config;

  // Загальна довжина
  const totalLength = spans.reduce(
    (sum, s) => sum + (parseInt(s.item) || 0) * (s.quantity || 0),
    0,
  );

  // Чи є ступінчаста опора (C)
  const hasC = supports.includes('C');

  // Формат: L{поверхи}A{ряди}{C?}-{довжина}/{опора}
  const abbreviation = `L${floors}A${rows}${hasC ? 'C' : ''}-${totalLength}/${supports.replace('C', '')}`;

  // Опис
  const floorsWords = [
    '',
    'одноповерховий',
    'двоповерховий',
    'трьохповерховий',
    'чотириповерховий',
    "п'ятиповерховий",
  ];
  const rowsWords = ['', 'однорядний', 'двохрядний', 'трьохрядний', 'чотирьохрядний'];

  const description = [
    `Стелаж ${floorsWords[floors] || `${floors}-поверховий`}`,
    rowsWords[rows] || `${rows}-рядний`,
    hasC ? 'ступінчатий' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `${description} ${abbreviation}`;
};

/**
 * Генерація HTML таблиці компонентів
 * @param {Object.<string, ComponentItem|ComponentItem[]>} components
 * @returns {string}
 */
const generateComponentsTable = (components) => {
  const rows = [];

  for (const [type, items] of Object.entries(components)) {
    const itemsArray = Array.isArray(items) ? items : [items];
    itemsArray.forEach((item) => {
      rows.push(`
        <tr class="rack__components-table__row">
          <td>${item.name}</td>
          <td>${item.amount}</td>
          <td>${item.price.toFixed(2)}</td>
          <td>${item.total.toFixed(2)}</td>
        </tr>
      `);
    });
  }

  if (rows.length === 0) {
    return '<p class="empty-state">Недостатньо даних для розрахунку</p>';
  }

  return `
    <table class="rack__components-table__table">
      <thead>
        <tr class="rack__components-table__header">
          <th>Компонент</th>
          <th>Кількість</th>
          <th>Ціна за од.</th>
          <th>Загальна вартість</th>
        </tr>
      </thead>
      <tbody class="rack__components-table__body">
        ${rows.join('')}
      </tbody>
    </table>
  `;
};

/**
 * Підрахунок загальної вартості
 * @param {Object.<string, ComponentItem|ComponentItem[]>} components
 * @returns {number}
 */
const calculateTotalCost = (components) => {
  let total = 0;
  for (const items of Object.values(components)) {
    const itemsArray = Array.isArray(items) ? items : [items];
    itemsArray.forEach((item) => {
      total += item.total || 0;
    });
  }
  return total;
};

/**
 * Підрахунок вартості без ізоляторів
 * @param {Object.<string, ComponentItem|ComponentItem[]>} components
 * @returns {number}
 */
const calculateTotalWithoutIsolators = (components) => {
  let total = 0;
  for (const [type, items] of Object.entries(components)) {
    // Пропускаємо ізолятори
    if (type === 'isolators') {
      continue;
    }
    const itemsArray = Array.isArray(items) ? items : [items];
    itemsArray.forEach((item) => {
      total += item.total || 0;
    });
  }
  return total;
};

export default calculateRack;
