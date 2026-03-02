import { beamsRange, rackLengthTolerance } from './constants';

/**
 * Перевіряє, чи витримує спан вагу акумуляторів
 */
export const checkSpanWeight = ({
  span,
  accLength,
  accWeight,
  gap,
  beams,
}: {
  span: { length: number; capacity: number };
  accLength: number;
  accWeight: number;
  gap: number;
  beams: number;
}): boolean => {
  // Кількість акумуляторів на проліт
  const countPerSpan = Math.floor(span.length / (accLength + gap));
  const totalWeight = countPerSpan * accWeight;

  // Вантажопідйомність: beams × 2 ряди × capacity
  const totalCapacity = span.capacity * beams * 2;

  return totalWeight <= totalCapacity;
};

/**
 * Генерує доступні спани з урахуванням ваги акумуляторів
 */
export const generateSpanOptions = ({
  accLength,
  accWeight,
  gap,
  spans,
  beamsRange: customBeamsRange,
}: {
  accLength: number;
  accWeight: number;
  gap: number;
  spans: { length: number; capacity: number }[];
  beamsRange?: number[];
}): { spanLength: number; beams: number }[] => {
  const results: { spanLength: number; beams: number }[] = [];
  const spansSorted = [...spans].sort((a, b) => b.length - a.length);
  const beamsToUse = customBeamsRange ?? [2, 3, 4];

  for (const span of spansSorted) {
    let beamsFound: number | null = null;
    for (const beams of beamsToUse) {
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
 */
export const generateSpanCombinations = ({
  rackLength,
  spans,
  limit = 500,
}: {
  rackLength: number;
  spans: number[];
  limit?: number;
}): number[][] => {
  const results: number[][] = [];
  const maxLength = rackLength + rackLengthTolerance;
  if (!spans.length) return results;

  const minSpan = Math.min(...spans);
  const maxItems = Math.ceil(maxLength / minSpan);
  const stack: { combo: number[]; sum: number; index: number }[] = spans.map((length, index) => ({
    combo: [length],
    sum: length,
    index,
  }));

  while (stack.length > 0) {
    const { combo, sum, index } = stack.pop()!;

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
 */
export const calcRackSpans = ({
  rackLength,
  accLength,
  accWeight,
  gap,
  standardSpans,
}: {
  rackLength: number;
  accLength: number;
  accWeight: number;
  gap: number;
  standardSpans: { length: number; capacity: number }[];
}): { combination: number[]; beams: number }[] => {
  const results: { combination: number[]; beams: number }[] = [];
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
