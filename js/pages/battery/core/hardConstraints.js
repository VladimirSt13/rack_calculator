/**
 * Обчислює м’які штрафи для варіанта
 * @param {Object} v - enriched варіант { combination, beams, maxSpan, lengthDiff, symmetryPairs, totalLength, overLength }
 * @param {number} rackLength - потрібна довжина стелажа
 * @returns {Object} об’єкт з полями штрафів
 */
export const computeSoftPenalties = (v, rackLength) => {
  const spans = v.combination;
  const maxSpan = v.maxSpan;

  const shortSpans = spans.filter((s) => s < 0.5 * maxSpan).length;

  return {
    shortSpansPenalty: Math.max(0, shortSpans - 1) * 1, // м’який штраф за короткі спани
    lengthDiffPenalty: v.lengthDiff / maxSpan > 1 ? (v.lengthDiff / maxSpan) * 20 : 0, // нерівномірність
    overLengthPenalty: Math.max(0, v.totalLength - rackLength - 150) * 0.2, // перевищення довжини
    symmetryPenalty: spans.length >= 3 && v.symmetryPairs === 0 ? 10 : 0, // відсутність симетрії
  };
};
