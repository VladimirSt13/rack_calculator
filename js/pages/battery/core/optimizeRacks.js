import { calculateScore } from "./scoring.js";

const enrichVariant = (r, rackLength) => {
  const spans = r.combination;
  const totalLength = spans.reduce((s, x) => s + x, 0);
  const half = Math.floor(spans.length / 2);

  let symmetryPairs = 0;
  for (let i = 0; i < half; i++) {
    if (spans[i] === spans[spans.length - 1 - i]) symmetryPairs++;
  }

  return {
    ...r,
    spanCount: spans.length,
    maxSpan: Math.max(...spans),
    minSpan: Math.min(...spans),
    totalLength,
    overLength: totalLength - rackLength,
    lengthDiff: Math.max(...spans) - Math.min(...spans),
    symmetryPairs,
  };
};

export const optimizeRacks = (variants, rackLength, maxAllowedSpan, topN = 5) => {
  if (!variants.length) return [];

  const enriched = variants.map((v) => enrichVariant(v, rackLength));

  // 🔹 1. Мінімальна кількість балок
  const minBeams = Math.min(...enriched.map((v) => v.beams));
  const beamFiltered = enriched.filter((v) => v.beams === minBeams);

  // 🔹 2. Серед них мінімальна кількість прольотів
  const minSpans = Math.min(...beamFiltered.map((v) => v.spanCount));
  const spanFiltered = beamFiltered.filter((v) => v.spanCount === minSpans);

  // 🔹 3. Сортування за totalLength та симетрією
  const scored = spanFiltered.map((v) => {
    const shortSpansCount = v.combination.filter((s) => s < maxAllowedSpan * 0.7).length;

    v.softPenalty = {
      shortSpansPenalty: shortSpansCount * 0.5,
      variationPenalty: (2 * (v.maxSpan - v.minSpan)) / v.maxSpan,
      overLengthPenalty: Math.max(0, v.overLength - 150) * 0.05,
      symmetryPenalty: v.spanCount >= 3 && v.symmetryPairs === 0 ? 1 : 0,
    };

    // бонус за коротші спани
    const shortSpansBonus = shortSpansCount * 2;

    return {
      ...v,
      score: calculateScore(v, rackLength, maxAllowedSpan) + shortSpansBonus,
    };
  });

  // 🔹 4. Сортування: найменша довжина + більше симетрії
  return scored
    .sort((a, b) => {
      if (a.totalLength !== b.totalLength) return a.totalLength - b.totalLength;
      return b.symmetryPairs - a.symmetryPairs;
    })
    .slice(0, topN);
};
