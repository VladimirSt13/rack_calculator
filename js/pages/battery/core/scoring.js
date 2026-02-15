// js/pages/battery/core/scoring.js
import { maxSpanReference } from "./constants.js";
import { calculateSymmetryScore } from "./utils.js";

/**
 * Оцінює комбінації спанів за комплексною системою
 * @param {Array<Object>} results - { combination: Array<number>, beams: number }
 * @param {number} rackLength
 * @returns {Array<Object>} Комбінації з полем score
 */
export const scoreSpanCombinations = (results, rackLength) => {
  return results
    .map((r) => {
      const spanCount = r.combination.length;
      const maxSpan = Math.max(...r.combination);
      const minSpan = Math.min(...r.combination);
      const lengthDiff = maxSpan - minSpan;
      const totalLength = r.combination.reduce((s, x) => s + x, 0);
      const overLength = totalLength - rackLength;
      const symmetryScore = calculateSymmetryScore(r.combination);

      const score =
        34 * (1 / r.beams) +
        5 * (maxSpan / maxSpanReference) +
        5 * (1 / spanCount) +
        10 * (symmetryScore / Math.floor(spanCount / 2) || 1) +
        1 * (1 / (1 + lengthDiff)) +
        45 * (1 / (1 + overLength));

      return { ...r, score: Math.round(score * 100) / 100 };
    })
    .sort((a, b) => b.score - a.score);
};
