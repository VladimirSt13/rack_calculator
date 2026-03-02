/**
 * Збагачує варіант додатковими полями для оцінки
 */
const enrichVariant = (
  r: { combination: number[]; beams: number },
  rackLength: number,
  price: any
) => {
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
 */
export const optimizeRacks = (
  variants: { combination: number[]; beams: number }[],
  rackLength: number,
  _maxAllowedSpan: number,
  topN = 5,
  price: any = null
): { combination: number[]; beams: number }[] => {
  if (!variants.length) return [];

  const enriched = variants.map((v) => enrichVariant(v, rackLength, price));

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
