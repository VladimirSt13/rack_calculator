/**
 * Helper for battery rack calculations
 * Optimizations: backtracking, weight filtering, memoization
 */

export const CONSTANTS = {
  beamsRange: [2, 3, 4, 5, 6],
  rackLengthTolerance: 200, // Increased for better variant selection
};

// Cache for calcRackSpans results
const spanCache = new Map();

/**
 * Check if span can hold battery weight
 */
export const checkSpanWeight = ({ span, accLength, accWeight, gap, beams }) => {
  const countPerSpan = Math.floor(span.length / (accLength + gap));
  const totalWeight = countPerSpan * accWeight;
  const totalCapacity = span.capacity * beams * 2;
  return totalWeight <= totalCapacity;
};

/**
 * Generate available spans with weight filtering
 */
export const generateSpanOptions = ({
  accLength,
  accWeight,
  gap,
  spans,
  beamsRange = CONSTANTS.beamsRange,
}) => {
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
    if (beamsFound)
      results.push({ spanLength: span.length, beams: beamsFound });
  }

  return results;
};

/**
 * Generate span combinations using backtracking (no duplicates)
 */
export const generateSpanCombinations = ({
  rackLength,
  spans,
  limit = 100,
}) => {
  const results = [];
  const maxLength = rackLength + CONSTANTS.rackLengthTolerance;
  if (!spans.length) return results;

  const spansSorted = [...spans].sort((a, b) => b - a);

  const backtrack = (combo, sum, startIndex) => {
    if (results.length >= limit) return;
    if (sum >= rackLength && sum <= maxLength) {
      results.push(combo);
      return;
    }
    if (sum >= maxLength) return;

    for (let i = startIndex; i < spansSorted.length; i++) {
      const newSum = sum + spansSorted[i];
      if (newSum > maxLength) continue;
      backtrack([...combo, spansSorted[i]], newSum, i);
    }
  };

  backtrack([], 0, 0);
  return results;
};

/**
 * Find all valid spans with early filtering and memoization
 */
export const calcRackSpans = ({
  rackLength,
  accLength,
  accWeight,
  gap,
  standardSpans,
}) => {
  const cacheKey = `${rackLength}:${accLength}:${accWeight}:${gap}`;

  if (spanCache.has(cacheKey)) {
    return spanCache.get(cacheKey);
  }

  const results = [];

  // Filter spans by weight capacity
  const viableSpans = standardSpans.filter((span) => {
    return CONSTANTS.beamsRange.some((beams) =>
      checkSpanWeight({ span, beams, accLength, accWeight, gap }),
    );
  });

  if (viableSpans.length === 0) {
    spanCache.set(cacheKey, results);
    return results;
  }

  // Find minimum beams for each viable span
  const spanWithBeams = viableSpans.map((span) => {
    const beams = CONSTANTS.beamsRange.find((b) =>
      checkSpanWeight({ span, beams: b, accLength, accWeight, gap }),
    );
    return { spanLength: span.length, beams };
  });

  // Generate combinations once for all lengths
  const allSpanLengths = spanWithBeams
    .map((s) => s.spanLength)
    .sort((a, b) => b - a);
  const combinations = generateSpanCombinations({
    rackLength,
    spans: allSpanLengths,
    limit: 200,
  });

  // Use max span to determine beams for each combination
  for (const combo of combinations) {
    const maxSpanLength = Math.max(...combo);
    const spanData = spanWithBeams.find((s) => s.spanLength === maxSpanLength);
    if (spanData) {
      results.push({ combination: combo, beams: spanData.beams });
    }
  }

  spanCache.set(cacheKey, results);
  return results;
};

/**
 * Clear span cache (for tests)
 */
export const clearSpanCache = () => {
  spanCache.clear();
};

/**
 * Enrich variant with additional fields for evaluation
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
 * Optimize rack variants, select TOP-N best
 * Criteria: fewer beams, fewer spans, uniform spans, symmetry, lower price, less overlength
 */
export const optimizeRacks = (
  variants,
  rackLength,
  maxAllowedSpan,
  topN = 5,
  price = null,
) => {
  if (!variants.length) return [];

  // Filter: keep variants with min beams (+1 reserve)
  const minBeams = Math.min(...variants.map((v) => v.beams));
  const filtered = variants.filter((v) => v.beams <= minBeams + 1);

  // Filter: keep variants with min spans (+1)
  const minSpanCount = Math.min(...filtered.map((v) => v.combination.length));
  const furtherFiltered = filtered.filter(
    (v) => v.combination.length <= minSpanCount + 1,
  );

  // Enrich all filtered variants
  const enriched = furtherFiltered.map((v) =>
    enrichVariant(v, rackLength, price),
  );

  // Sort by priority criteria
  const sorted = enriched.sort((a, b) => {
    if (a.beams !== b.beams) return a.beams - b.beams; // Fewer beams
    if (a.spanCount !== b.spanCount) return a.spanCount - b.spanCount; // Fewer spans
    if (a.lengthDiff !== b.lengthDiff) return a.lengthDiff - b.lengthDiff; // Uniform spans
    if (a.symmetryPairs !== b.symmetryPairs)
      return b.symmetryPairs - a.symmetryPairs; // More symmetry
    if (price && a.beamsCost !== b.beamsCost) return a.beamsCost - b.beamsCost; // Lower price
    return a.overLength - b.overLength; // Less overlength
  });

  return sorted.slice(0, topN);
};

export default {
  CONSTANTS,
  checkSpanWeight,
  generateSpanOptions,
  generateSpanCombinations,
  calcRackSpans,
  optimizeRacks,
};
