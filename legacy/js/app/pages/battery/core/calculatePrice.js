// js/app/pages/battery/core/calculatePrice.js

/**
 * Розраховує вартість стелажа для battery page
 * @param {Object} rack - конфігурація стелажа
 * @param {Object} price - прайс-лист
 * @returns {{ total: number, components: Object }}
 */
export const calculateBatteryRackPrice = (rack, price) => {
  const { floors, rows, width, height, topSpans } = rack;
  const components = {};
  let totalPrice = 0;

  // 1. Опори (supports) - залежать від ширини
  const supportKey = findClosestSupport(width, Object.keys(price.supports));
  if (supportKey && price.supports[supportKey]) {
    const supportType = rows === 1 ? 'edge' : 'intermediate';
    const supportPrice = price.supports[supportKey][supportType]?.price || 0;
    const supportsCount = 2; // дві опори
    components.supports = {
      count: supportsCount,
      price: supportPrice,
      total: supportsCount * supportPrice,
    };
    totalPrice += components.supports.total;
  }

  // 2. Вертикальні опори (vertical_supports) - залежать від висоти
  const verticalKey = findClosestVerticalSupport(height, Object.keys(price.vertical_supports));
  if (verticalKey && price.vertical_supports[verticalKey]) {
    const verticalPrice = price.vertical_supports[verticalKey].price || 0;
    const verticalCount = 2; // дві вертикальні опори
    components.verticalSupports = {
      count: verticalCount,
      price: verticalPrice,
      total: verticalCount * verticalPrice,
    };
    totalPrice += components.verticalSupports.total;
  }

  // 3. Прольоти (spans) - з topSpans[0] (найкращий варіант)
  if (topSpans && topSpans.length > 0) {
    const bestSpan = topSpans[0];
    const spanComponents = [];
    let spansTotal = 0;

    for (const spanLength of bestSpan.combination) {
      const spanKey = String(spanLength);
      if (price.spans[spanKey]) {
        const spanPrice = price.spans[spanKey].price || 0;
        spanComponents.push({
          length: spanLength,
          price: spanPrice,
        });
        spansTotal += spanPrice;
      }
    }

    components.spans = {
      count: spanComponents.length,
      items: spanComponents,
      total: spansTotal,
    };
    totalPrice += spansTotal;
  }

  // 4. Діагональні зв'язки (diagonal_brace) - по одній на секцію
  if (price.diagonal_brace?.diagonal_brace) {
    const bracePrice = price.diagonal_brace.diagonal_brace.price || 0;
    const braceCount = floors * rows; // по одній на секцію
    components.diagonalBrace = {
      count: braceCount,
      price: bracePrice,
      total: braceCount * bracePrice,
    };
    totalPrice += components.diagonalBrace.total;
  }

  // 5. Ізолятори (isolator) - по 4 на опору
  if (price.isolator?.isolator) {
    const isolatorPrice = price.isolator.isolator.price || 0;
    const isolatorCount = 4 * 2; // 4 на каждую з 2 опор
    components.isolator = {
      count: isolatorCount,
      price: isolatorPrice,
      total: isolatorCount * isolatorPrice,
    };
    totalPrice += components.isolator.total;
  }

  return {
    total: Math.round(totalPrice * 100) / 100,
    components,
  };
};

/**
 * Знаходить найближчу опору за шириною
 * @param {number} width - потрібна ширина
 * @param {Array<string>} keys - ключі опор
 * @returns {string|null}
 */
const findClosestSupport = (width, keys) => {
  let closest = null;
  let minDiff = Infinity;

  for (const key of keys) {
    const supportWidth = parseInt(key, 10);
    if (supportWidth >= width) {
      const diff = supportWidth - width;
      if (diff < minDiff) {
        minDiff = diff;
        closest = key;
      }
    }
  }

  // Якщо не знайдено більшої, беремо максимальну
  if (!closest && keys.length > 0) {
    closest = keys.reduce((a, b) => (parseInt(a, 10) > parseInt(b, 10) ? a : b));
  }

  return closest;
};

/**
 * Знаходить найближчу вертикальну опору за висотою
 * @param {number} height - потрібна висота
 * @param {Array<string>} keys - ключі вертикальних опор
 * @returns {string|null}
 */
const findClosestVerticalSupport = (height, keys) => {
  let closest = null;
  let minDiff = Infinity;

  for (const key of keys) {
    const supportHeight = parseInt(key, 10);
    if (supportHeight >= height) {
      const diff = supportHeight - height;
      if (diff < minDiff) {
        minDiff = diff;
        closest = key;
      }
    }
  }

  // Якщо не знайдено більшої, беремо максимальну
  if (!closest && keys.length > 0) {
    closest = keys.reduce((a, b) => (parseInt(a, 10) > parseInt(b, 10) ? a : b));
  }

  return closest;
};
