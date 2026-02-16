// js/pages/battery/core/pareto.js

/**
 * Загальна перевірка домінування
 * @param {Object} a
 * @param {Object} b
 * @param {Array<Function>} criteria
 * @returns {boolean}
 */
const dominatesBy = (a, b, criteria) => {
  let strictlyBetter = false;

  for (const cmp of criteria) {
    const res = cmp(a, b);
    if (res > 0) return false;
    if (res < 0) strictlyBetter = true;
  }

  return strictlyBetter;
};

/**
 * Multi-level Pareto фільтр
 * @param {Array<Object>} variants
 * @returns {Array<Object>}
 */
export const multiLevelPareto = (variants) => {
  const levels = [
    // Level 1 — конструктив
    [(a, b) => a.beams - b.beams, (a, b) => a.spanCount - b.spanCount],
    // Level 2 — геометрія
    [(a, b) => a.overLength - b.overLength, (a, b) => b.maxSpan - a.maxSpan],
    // Level 3 — естетика
    [(a, b) => b.symmetryPairs - a.symmetryPairs, (a, b) => a.lengthDiff - b.lengthDiff],
  ];

  let current = variants;

  for (const level of levels) {
    current = current.filter((v, i) => !current.some((o, j) => i !== j && dominatesBy(o, v, level)));
  }

  return current;
};
