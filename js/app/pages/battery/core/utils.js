// js/pages/battery/core/utils.js
/**
 * Повертає найближче стандартне значення, яке більше або рівне заданому
 * @param {number} value - Значення, яке треба округлити
 * @param {Array<number>} standards - Масив стандартних значень
 * @returns {number} Найближче більше або рівне стандартне значення
 */
export const getClosestLarger = ({ value, standards }) => {
  const candidates = standards.filter((s) => s >= value);
  return candidates.length ? Math.min(...candidates) : Math.max(...standards);
};

/**
 * Видаляє дублікати та дзеркальні комбінації спанів
 * @param {Array<Object>} results - Масив комбінацій спанів { combination: Array<number>, beams: number }
 * @returns {Array<Object>} Масив унікальних комбінацій
 */
export const removeDuplicateCombinations = (results) => {
  const seen = new Set();
  const unique = [];

  results.forEach((r) => {
    const key = `${[...r.combination].sort((a, b) => b - a).join("-")}-${r.beams}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
  });

  return unique;
};

/**
 * Перевіряє симетричність комбінації спанів
 * @param {Array<number>} combination - Комбінація спанів
 * @returns {number} Кількість пар спанів, які симетричні
 */
export const calculateSymmetryScore = (combination) => {
  const spanCount = combination.length;
  const half = Math.floor(spanCount / 2);
  let score = 0;
  for (let i = 0; i < half; i++) {
    if (combination[i] === combination[spanCount - 1 - i]) score++;
  }
  return score;
};
