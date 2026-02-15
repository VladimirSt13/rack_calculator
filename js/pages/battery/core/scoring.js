/**
 * Обчислює стандартне відхилення
 * @param {number[]} values
 * @returns {number}
 */
const stdDev = (values) => {
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
};

/**
 * Обчислює фінальний скоринг варіанта
 * @param {Object} r - enriched варіант
 * @param {number} requiredLength
 * @param {number} maxAllowedSpan
 * @returns {number}
 */
export const calculateScore = (r, requiredLength, maxAllowedSpan) => {
  const spans = r.combination;
  const spanCount = spans.length;

  const maxSpan = r.maxSpan;
  const meanSpan = spans.reduce((s, x) => s + x, 0) / spanCount;

  const variation = stdDev(spans) / meanSpan; // коефіцієнт варіації
  const shortSpanRatio = spans.filter((s) => s < maxAllowedSpan * 0.7).length / spanCount;

  const beamsScore = 1 / r.beams;
  const spanCountScore = 1 / spanCount;
  const maxSpanScore = maxSpan / maxAllowedSpan;
  const overLengthScore = 1 / (1 + r.overLength / requiredLength);
  const symmetryScore = r.symmetryPairs / Math.floor(spanCount / 2 || 1);

  const baseScore =
    30 * beamsScore + 20 * spanCountScore + 25 * maxSpanScore + 15 * symmetryScore + 20 * overLengthScore;

  // враховуємо м’які штрафи, якщо вони ще не підраховані
  const totalPenalty = r.softPenalty
    ? Object.values(r.softPenalty).reduce((s, x) => s + x, 0)
    : 30 * variation + 20 * shortSpanRatio;

  return Math.round(Math.max(0, baseScore - totalPenalty) * 100) / 100;
};
