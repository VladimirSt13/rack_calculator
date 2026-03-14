/**
 * Повертає найближче стандартне значення, яке більше або рівне заданому
 */
export const getClosestLarger = ({
  value,
  standards,
}: {
  value: number;
  standards: number[];
}): number => {
  const candidates = standards.filter((s) => s >= value);
  return candidates.length ? Math.min(...candidates) : Math.max(...standards);
};

/**
 * Видаляє дублікати та дзеркальні комбінації спанів
 */
export const removeDuplicateCombinations = (
  results: { combination: number[]; beams: number }[],
): { combination: number[]; beams: number }[] => {
  const seen = new Set<string>();
  const unique: { combination: number[]; beams: number }[] = [];

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
 */
export const calculateSymmetryScore = (combination: number[]): number => {
  const spanCount = combination.length;
  const half = Math.floor(spanCount / 2);
  let score = 0;
  for (let i = 0; i < half; i++) {
    if (combination[i] === combination[spanCount - 1 - i]) score++;
  }
  return score;
};
