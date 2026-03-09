/**
 * Helper для розрахунку варіантів стелажів для battery page
 * Аналог legacy/js/app/pages/battery/core/spanCalculator.js
 */

/**
 * Стандартні значення
 */
export const CONSTANTS = {
  beamsRange: [2, 3, 4, 5, 6],  // Кількість балок в ряду на проліт
  rackLengthTolerance: 100,  // Допустиме перевищення довжини (мм)
};

/**
 * Перевіряє, чи витримує спан вагу акумуляторів
 * @param {Object} params
 * @param {Object} params.span - Об'єкт спану { length, capacity }
 * @param {number} params.accLength - Довжина акумулятора
 * @param {number} params.accWeight - Вага акумулятора
 * @param {number} params.gap - Проміжок між акумуляторами
 * @param {number} params.beams - Кількість балок в ряду на проліт
 * @returns {boolean} true, якщо спан витримує навантаження
 */
export const checkSpanWeight = ({ span, accLength, accWeight, gap, beams }) => {
  // Кількість акумуляторів на проліт
  const countPerSpan = Math.floor(span.length / (accLength + gap));
  const totalWeight = countPerSpan * accWeight;

  // Вантажопідйомність:
  // beams = кількість балок в ряду на проліт
  // Рядів = 2 (зліва і справа)
  // capacity вказаний на одну балку
  const totalCapacity = span.capacity * beams * 2;

  return totalWeight <= totalCapacity;
};

/**
 * Генерує доступні спани з урахуванням ваги акумуляторів
 * @param {Object} params
 * @param {number} params.accLength
 * @param {number} params.accWeight
 * @param {number} params.gap
 * @param {Array<Object>} params.spans - Масив { length, capacity }
 * @param {Array<number>} [params.beamsRange=beamsRange]
 * @returns {Array<Object>} Масив { spanLength, beams }
 */
export const generateSpanOptions = ({ accLength, accWeight, gap, spans, beamsRange = CONSTANTS.beamsRange }) => {
  const results = [];
  const spansSorted = [...spans].sort((a, b) => b.length - a.length);

  for (const span of spansSorted) {
    let beamsFound = null;
    for (const beams of beamsRange) {
      if (checkSpanWeight({ span, beams, accLength, accWeight, gap })) {
        beamsFound = beams;
        break;
      }
    }
    if (beamsFound) results.push({ spanLength: span.length, beams: beamsFound });
  }

  return results;
};

/**
 * Генерує комбінації спанів, які покривають потрібну довжину стелажа
 * @param {Object} params
 * @param {number} params.rackLength
 * @param {Array<number>} params.spans
 * @param {number} [params.limit=500]
 * @returns {Array<Array<number>>} Комбінації спанів
 */
export const generateSpanCombinations = ({ rackLength, spans, limit = 500 }) => {
  const results = [];
  const maxLength = rackLength + CONSTANTS.rackLengthTolerance;
  if (!spans.length) return results;

  const minSpan = Math.min(...spans);
  const maxItems = Math.ceil(maxLength / minSpan);
  const stack = spans.map((length, index) => ({ combo: [length], sum: length, index }));

  while (stack.length > 0) {
    const { combo, sum, index } = stack.pop();

    if (sum >= rackLength && sum <= maxLength) {
      results.push(combo);
      if (results.length >= limit) break;
    }
    if (sum >= maxLength || combo.length >= maxItems) continue;

    for (let i = index; i < spans.length; i++) {
      const newSum = sum + spans[i];
      if (newSum > maxLength) continue;
      stack.push({ combo: [...combo, spans[i]], sum: newSum, index: i });
    }
  }

  return results;
};

/**
 * Підбирає всі можливі спани для стелажа
 * @param {Object} params
 * @param {number} params.rackLength
 * @param {number} params.accLength
 * @param {number} params.accWeight
 * @param {number} params.gap
 * @param {Array<Object>} params.standardSpans
 * @returns {Array<Object>} Комбінації { combination, beams }
 */
export const calcRackSpans = ({ rackLength, accLength, accWeight, gap, standardSpans }) => {
  const results = [];
  
  // Спочатку генеруємо всі комбінації прольотів
  const allSpans = standardSpans.map(s => s.length).sort((a, b) => b - a);
  const combinations = generateSpanCombinations({ rackLength, spans: allSpans });
  
  // Для кожної комбінації перевіряємо вантажопідйомність
  for (const combo of combinations) {
    // Беремо найбільший проліт в комбінації
    const maxSpanLength = Math.max(...combo);
    const maxSpanObj = standardSpans.find(s => s.length === maxSpanLength);
    
    if (!maxSpanObj) continue;
    
    // Перевіряємо, скільки балок потрібно для вантажопідйомності
    for (const beams of CONSTANTS.beamsRange) {
      if (checkSpanWeight({ span: maxSpanObj, beams, accLength, accWeight, gap })) {
        results.push({ combination: combo, beams });
        break; // Знайдено мінімальну кількість балок - додаємо і переходимо далі
      }
    }
  }
  
  return results;
};

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

  // Розрахунок вартості балок
  let beamsCost = 0;
  spans.forEach((spanLength) => {
    const beamPrice = price?.spans?.[String(spanLength)]?.price || 0;
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
 * Оптимізує варіанти стелажів, обираючи TOP-N кращих
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

  // Сортування за пріоритетами
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

export default {
  CONSTANTS,
  checkSpanWeight,
  generateSpanOptions,
  generateSpanCombinations,
  calcRackSpans,
  optimizeRacks,
};
