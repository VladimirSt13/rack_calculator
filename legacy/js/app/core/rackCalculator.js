// js/app/core/rackCalculator.js

/**
 * Спільний калькулятор стелажів для rack та battery сторінок
 * Використовується для розрахунку вартості комплектуючих
 */

/**
 * @typedef {Object} RackConfig
 * @property {number} floors - кількість поверхів
 * @property {number} rows - кількість рядів
 * @property {number} beamsPerRow - балок в ряду
 * @property {string} [supports] - тип опори (для battery не використовується)
 * @property {string} [verticalSupports] - тип вертикальної опори
 * @property {Array<{ item: string, quantity: number }>} [spans] - прольоти (для rack)
 * @property {Array<number>} [spansArray] - масив прольотів [600, 600, 750] (для battery)
 * @property {number} [beams] - кількість балок в ряду на проліт (для battery)
 */

/**
 * @typedef {Object} PriceData
 * @property {Object.<string, { edge: { price: number }, intermediate: { price: number } }>} supports
 * @property {Object.<string, { price: number }>} spans
 * @property {Object.<string, { price: number }>} vertical_supports
 * @property {Object.<string, { price: number }>} diagonal_brace
 * @property {Object.<string, { price: number }>} isolator
 */

/**
 * @typedef {Object} ComponentItem
 * @property {string} name
 * @property {number} amount
 * @property {number} price
 * @property {number} total
 */

/**
 * Розрахунок всіх компонентів стелажа
 * @param {RackConfig} config
 * @param {PriceData} price
 * @returns {Object.<string, ComponentItem|ComponentItem[]>}
 */
export const calculateRackComponents = (config, price) => {
  const components = {};

  // 1. Опори (supports) - тільки для rack page
  if (config.supports && config.spans) {
    const supportsData = calculateSupports(config, price);
    if (supportsData.length > 0) {
      components.supports = supportsData;
    }
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

  return components;
};

/**
 * Розрахунок опор (тільки для rack page)
 * @param {RackConfig} config
 * @param {PriceData} price
 * @returns {ComponentItem[]}
 */
export const calculateSupports = (config, price) => {
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
export const calculateSpans = (config, price) => {
  const { rows, beamsPerRow, spans, floors, spansArray, beams } = config;
  const spansMap = new Map();

  // Для rack page (spans з quantity)
  if (spans && spans.length > 0) {
    spans.forEach((span) => {
      const code = span.item;
      const qty = (span.quantity || 0) * rows * beamsPerRow * floors;
      const current = spansMap.get(code) || 0;
      spansMap.set(code, current + qty);
    });
  }
  // Для battery page (spansArray - масив прольотів)
  else if (spansArray && spansArray.length > 0) {
    spansArray.forEach((spanLength) => {
      const code = String(spanLength);
      // Кількість балок: 1 проліт × beams × rows × floors
      const qty = 1 * (beams || 2) * rows * floors;
      const current = spansMap.get(code) || 0;
      spansMap.set(code, current + qty);
    });
  }

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
export const calculateVerticalSupports = (config, price) => {
  const { floors, spans, spansArray, rows, verticalSupports } = config;
  if (!verticalSupports || floors <= 1) {
    return null;
  }

  // Кількість прольотів + 1 = кількість стійок в ряду
  const totalSpans = spans
    ? spans.reduce((sum, s) => sum + (s.quantity || 0), 0)
    : (spansArray?.length || 0);
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
export const calculateBraces = (config, price) => {
  const { floors, spans, spansArray, rows } = config;
  if (floors <= 1) {
    return null;
  }

  const totalSpans = spans
    ? spans.reduce((sum, s) => sum + (s.quantity || 0), 0)
    : (spansArray?.length || 0);

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
 * Ізолятори встановлюються тільки на опори (по 2 на опору)
 * Опори є спільними для всіх рядів стелажа
 * @param {RackConfig} config
 * @param {PriceData} price
 * @returns {ComponentItem|null}
 */
export const calculateIsolators = (config, price) => {
  const { floors, spans, spansArray } = config;
  if (floors > 1) {
    return null;
  }

  const totalSpans = spans
    ? spans.reduce((sum, s) => sum + (s.quantity || 0), 0)
    : (spansArray?.length || 0);

  // Кількість опор: 2 крайні + (прольоти - 1) проміжних
  // Опори спільні для всіх рядів, тому rows не множимо
  const edgeSupports = 2;
  const intermediateSupports = Math.max(0, totalSpans - 1);
  const totalSupports = edgeSupports + intermediateSupports;
  const totalIsolators = totalSupports * 2; // 2 ізолятори на кожну опору

  const isolatorPrice = price.isolator?.isolator?.price || 0;

  return {
    name: 'Ізолятор',
    amount: totalIsolators,
    price: isolatorPrice,
    total: totalIsolators * isolatorPrice,
  };
};

/**
 * Підрахунок загальної вартості
 * @param {Object.<string, ComponentItem|ComponentItem[]>} components
 * @returns {number}
 */
export const calculateTotalCost = (components) => {
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
export const calculateTotalWithoutIsolators = (components) => {
  let total = 0;
  for (const [type, items] of Object.entries(components)) {
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

/**
 * Генерація назви стелажа (для rack page)
 * @param {RackConfig} config
 * @returns {string}
 */
export const generateRackName = (config) => {
  const { floors, rows, spans, supports } = config;

  const totalLength = spans.reduce(
    (sum, s) => sum + (parseInt(s.item) || 0) * (s.quantity || 0),
    0,
  );

  const hasC = supports.includes('C');
  const abbreviation = `L${floors}A${rows}${hasC ? 'C' : ''}-${totalLength}/${supports.replace('C', '')}`;

  const floorsWords = ['', 'одноповерховий', 'двоповерховий', 'трьохповерховий', 'чотириповерховий', "п'ятиповерховий"];
  const rowsWords = ['', 'однорядний', 'двохрядний', 'трьохрядний', 'чотирьохрядний'];

  const description = [
    `Стелаж ${floorsWords[floors] || `${floors}-поверховий`}`,
    rowsWords[rows] || `${rows}-рядний`,
    hasC ? 'ступінчатий' : '',
  ].filter(Boolean).join(' ');

  return `${description} ${abbreviation}`;
};

/**
 * Генерація назви стелажа (для battery page)
 * Формат: L1A2C-1000/430 (600+600+750 - 1150)
 * @param {Object} params
 * @param {number} params.floors
 * @param {number} params.rows
 * @param {string} params.supportType
 * @param {number} params.rackWidth
 * @param {number} params.rackLength
 * @param {Array<number>} params.spans
 * @returns {string}
 */
export const generateBatteryRackName = ({
  floors,
  rows,
  supportType,
  rackWidth,
  rackLength,
  spans,
}) => {
  const supportMarker = supportType === 'step' ? 'C' : '';
  const prefix = `L${floors}A${rows}${supportMarker}`;
  const spansSum = spans.reduce((a, b) => a + b, 0);
  const base = `${prefix}-${spansSum}/${rackWidth}`;
  const spansDetail = spans.join('+');
  const detail = floors > 1 ? ` (${spansDetail} - ${rackLength})` : ` (${spansDetail})`;

  return base + detail;
};

/**
 * Генерація HTML таблиці компонентів (тільки для rack page)
 * @param {Object.<string, ComponentItem|ComponentItem[]>} components
 * @param {boolean} showPrices - чи показувати ціни
 * @returns {string}
 */
export const generateComponentsTable = (components, showPrices = true) => {
  const rows = [];
  const priceVisibilityClass = showPrices ? '' : ' rack__prices-hidden';
  const checkboxCheckedAttr = showPrices ? 'checked' : '';
  const toggleLabelText = showPrices ? 'Приховати ціни' : 'Показати ціни';

  for (const items of Object.values(components)) {
    const itemsArray = Array.isArray(items) ? items : [items];
    itemsArray.forEach((item) => {
      rows.push(`
        <tr class="table__row">
          <td class="table__cell table__cell--name">${item.name}</td>
          <td class="table__cell table__cell--qty">${item.amount}</td>
          <td class="table__cell table__cell--price" data-price="${item.price.toFixed(2)}">${item.price.toFixed(2)} ₴</td>
          <td class="table__cell table__cell--total" data-total="${item.total.toFixed(2)}">${item.total.toFixed(2)} ₴</td>
        </tr>
      `);
    });
  }

  if (rows.length === 0) {
    return '<p class="empty-state">Недостатньо даних для розрахунку</p>';
  }

  return `
    <div class="table-wrapper${priceVisibilityClass}">
      <div class="rack__price-toggle">
        <label class="rack__price-toggle-label">
          <span class="rack__price-toggle-text">${toggleLabelText}</span>
          <input
            type="checkbox"
            data-js="rack-togglePrices"
            ${checkboxCheckedAttr}
          />
          <span class="rack__price-switch" aria-hidden="true"></span>
        </label>
      </div>
      <table class="table">
        <thead class="table__header">
          <tr class="table__row table__row--header">
            <th class="table__cell table__cell--header table__cell--name">Компонент</th>
            <th class="table__cell table__cell--header table__cell--qty">Кількість</th>
            <th class="table__cell table__cell--header table__cell--price rack__price-header">Ціна за од.</th>
            <th class="table__cell table__cell--header table__cell--total rack__price-header">Загальна вартість</th>
          </tr>
        </thead>
        <tbody class="table__body">
          ${rows.join('')}
        </tbody>
      </table>
    </div>
  `;
};

export default {
  calculateRackComponents,
  calculateSupports,
  calculateSpans,
  calculateVerticalSupports,
  calculateBraces,
  calculateIsolators,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateRackName,
  generateBatteryRackName,
  generateComponentsTable,
};
