/**
 * Збагачує варіант додатковими полями для оцінки
 */
const enrichVariant = (
  r: { combination: number[]; beams: number },
  rackLength: number,
  price: unknown
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
  const priceData = price as { spans?: Record<string, { price: number }> } | null;
  spans.forEach((spanLength) => {
    const beamPrice = priceData?.spans?.[String(spanLength)]?.price || 0;
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
 * Optimize rack variants, select TOP-N best
 * Criteria: fewer beams, fewer spans, uniform spans, symmetry, lower price, less overlength
 */
export const optimizeRacks = (
  variants: { combination: number[]; beams: number }[],
  rackLength: number,
  _maxAllowedSpan: number,
  topN = 5,
  price: unknown = null
): { combination: number[]; beams: number }[] => {
  if (!variants.length) return [];

  // Filter: keep variants with min beams (+1 reserve)
  const minBeams = Math.min(...variants.map((v) => v.beams));
  const filtered = variants.filter((v) => v.beams <= minBeams + 1);

  // Filter: keep variants with min spans (+1)
  const minSpanCount = Math.min(...filtered.map((v) => v.combination.length));
  const furtherFiltered = filtered.filter(
    (v) => v.combination.length <= minSpanCount + 1
  );

  // Enrich all filtered variants
  const enriched = furtherFiltered.map((v) => enrichVariant(v, rackLength, price));

  // Sort by priority criteria
  const sorted = enriched.sort((a, b) => {
    if (a.beams !== b.beams) return a.beams - b.beams;  // Fewer beams
    if (a.spanCount !== b.spanCount) return a.spanCount - b.spanCount;  // Fewer spans
    if (a.lengthDiff !== b.lengthDiff) return a.lengthDiff - b.lengthDiff;  // Uniform spans
    if (a.symmetryPairs !== b.symmetryPairs) return b.symmetryPairs - a.symmetryPairs;  // More symmetry
    if (price && a.beamsCost !== b.beamsCost) return a.beamsCost - b.beamsCost;  // Lower price
    return a.overLength - b.overLength;  // Less overlength
  });

  return sorted.slice(0, topN);
};
