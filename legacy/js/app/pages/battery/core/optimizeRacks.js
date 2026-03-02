// js/app/pages/battery/core/optimizeRacks.js

/**
 * Збагачує варіант додатковими полями для оцінки
 * @param {Object} r - варіант з combination та beams
 * @param {number} rackLength - потрібна довжина стелажа
 * @param {Object} price - прайс-лист для розрахунку вартості
 * @returns {Object} enriched варіант
 */
const enrichVariant = (r, rackLength, price) => {
  const spans = r.combination;
  const totalLength = spans.reduce((s, x) => s + x, 0);
  const half = Math.floor(spans.length / 2);

  let symmetryPairs = 0;
  for (let i = 0; i < half; i++) {
    if (spans[i] === spans[spans.length - 1 - i]) symmetryPairs++;
  }

  // Розрахунок вартості балок (аналогічно racks/core/calculator.js)
  let beamsCost = 0;
  spans.forEach((spanLength) => {
    const beamPrice = price?.spans?.[String(spanLength)]?.price || 0;
    // Формула: 1 проліт × beams × rows × floors
    // Для порівняння варіантів використовуємо базову кількість (rows=1, floors=1)
    beamsCost += beamPrice * r.beams;
  });

  return {
    ...r,
    spanCount: spans.length,
    maxSpan: Math.max(...spans),
    minSpan: Math.min(...spans),
    totalLength,
    overLength: totalLength - rackLength,
    lengthDiff: Math.max(...spans) - Math.min(...spans),
    symmetryPairs,
    beamsCost,
  };
};

/**
 * Оптимізує варіанти стелажів, обираючи TOP-N кращих з різними конфігураціями
 * Пріоритети сортування:
 * 1. Менше балок
 * 2. Менше прольотів
 * 3. Симетрія
 * 4. Ціна
 * @param {Array<Object>} variants - масив варіантів { combination, beams }
 * @param {number} rackLength - потрібна довжина стелажа
 * @param {number} maxAllowedSpan - максимальна довжина прольоту
 * @param {number} [topN=5] - кількість кращих варіантів
 * @param {Object} [price] - прайс-лист для розрахунку вартості
 * @returns {Array<Object>} Масив оптимізованих варіантів
 */
export const optimizeRacks = (variants, rackLength, maxAllowedSpan, topN = 5, price = null) => {
  if (!variants.length) return [];

  const enriched = variants.map((v) => enrichVariant(v, rackLength, price));

  // Сортування за пріоритетами:
  // 1. Менше балок (beams)
  // 2. Менше прольотів (spanCount)
  // 3. Більше симетрії (symmetryPairs)
  // 4. Менша ціна (beamsCost)
  return enriched
    .sort((a, b) => {
      // 1. Менше балок
      if (a.beams !== b.beams) return a.beams - b.beams;
      
      // 2. Менше прольотів
      if (a.spanCount !== b.spanCount) return a.spanCount - b.spanCount;
      
      // 3. Більше симетрії
      if (a.symmetryPairs !== b.symmetryPairs) return b.symmetryPairs - a.symmetryPairs;
      
      // 4. Менша ціна
      if (price && a.beamsCost !== b.beamsCost) return a.beamsCost - b.beamsCost;
      
      // Додатково: менша довжина
      return a.totalLength - b.totalLength;
    })
    .slice(0, topN);
};
