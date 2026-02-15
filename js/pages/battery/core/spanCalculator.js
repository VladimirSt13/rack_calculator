// js/pages/battery/core/spanCalculator.js
import { beamsRange, rackLengthTolerance } from "./constants.js";
import { calculateSymmetryScore } from "./utils.js";

/**
 * Перевіряє, чи витримує спан вагу акумуляторів
 * @param {Object} params
 * @param {Object} params.span - Об’єкт спану { length, capacity }
 * @param {number} params.accLength - Довжина акумулятора
 * @param {number} params.accWeight - Вага акумулятора
 * @param {number} params.gap - Проміжок між акумуляторами
 * @param {number} params.beams - Кількість балок
 * @returns {boolean} true, якщо спан витримує навантаження
 */
export const checkSpanWeight = ({ span, accLength, accWeight, gap, beams }) => {
  const countPerSpan = Math.floor(span.length / (accLength + gap));
  const totalWeight = countPerSpan * accWeight;
  return totalWeight <= span.capacity * beams;
};

/**
 * Генерує доступні спани з урахуванням ваги акумуляторів
 * @param {Object} params
 * @param {number} params.accLength
 * @param {number} params.accWeight
 * @param {number} params.gap
 * @param {Array<Object>} params.spans
 * @param {Array<number>} [params.beamsRange=beamsRange]
 * @returns {Array<Object>} Масив { spanLength, beams }
 */
export const generateSpanOptions = ({ accLength, accWeight, gap, spans, beamsRange = beamsRange }) => {
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
  const maxLength = rackLength + rackLengthTolerance;
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
  const neededBeamsForSpan = generateSpanOptions({ accLength, accWeight, gap, spans: standardSpans, beamsRange });

  for (const currentSpan of neededBeamsForSpan) {
    const spans = standardSpans
      .filter((s) => s.length <= currentSpan.spanLength)
      .map((s) => s.length)
      .sort((a, b) => b - a);

    const combinations = generateSpanCombinations({ rackLength, spans });
    combinations.forEach((combo) => results.push({ combination: combo, beams: currentSpan.beams }));
  }
  return results;
};
