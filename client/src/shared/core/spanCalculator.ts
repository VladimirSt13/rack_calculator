import { beamsRange, rackLengthTolerance } from "./constants";

/**
 * Кеш для мемоізації calcRackSpans
 * Ключ: `${rackLength}:${accLength}:${accWeight}:${gap}`
 */
const spanCache = new Map<string, { combination: number[]; beams: number }[]>();

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
    if (beamsFound)
      results.push({ spanLength: span.length, beams: beamsFound });
  }

  return results;
};

/**
 * Генерує комбінації спанів без дублікатів за допомогою backtracking
 * Генерує тільки унікальні комбінації (наприклад, [1200, 900] але не [900, 1200])
 * Сортує від більшого до меншого для кращої продуктивності
 */
export const generateSpanCombinations = ({
  rackLength,
  spans,
  limit = 100,
}: {
  rackLength: number;
  spans: number[];
  limit?: number;
}): number[][] => {
  const results: number[][] = [];
  const maxLength = rackLength + rackLengthTolerance;
  if (!spans.length) return results;

  // Сортуємо від більшого до меншого - швидше знаходимо підходящі комбінації
  const spansSorted = [...spans].sort((a, b) => b - a);

  /**
   * Backtracking з уникненням дублікатів
   * @param combo - поточна комбінація
   * @param sum - поточна сума
   * @param startIndex - індекс для наступних елементів (уникаємо дублікатів)
   */
  const backtrack = (combo: number[], sum: number, startIndex: number) => {
    if (results.length >= limit) return;

    // Знайдено підходящу комбінацію
    if (sum >= rackLength && sum <= maxLength) {
      results.push(combo);
      return;
    }

    // Перевищено максимальну довжину
    if (sum >= maxLength) return;

    // Перебираємо спани починаючи з startIndex (уникаємо дублікатів типу [900, 1200] і [1200, 900])
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
 * Підбирає всі можливі спани для стелажа з ранньою відсіюванням та мемоізацією
 * Оптимізації:
 * 1. Мемоізація результатів для уникнення повторних обчислень
 * 2. Рання фільтрація нежиттєздатних прольотів за вантажопідйомністю
 * 3. Генерація комбінацій без дублікатів
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
  // Створюємо унікальний ключ для кешу
  const cacheKey = `${rackLength}:${accLength}:${accWeight}:${gap}`;

  // Перевіряємо кеш
  if (spanCache.has(cacheKey)) {
    return spanCache.get(cacheKey)!;
  }

  const results: { combination: number[]; beams: number }[] = [];

  // 1. Фільтруємо спани, які взагалі не підходять по вантажопідйомності
  const viableSpans = standardSpans.filter((span) => {
    return beamsRange.some((beams) =>
      checkSpanWeight({ span, beams, accLength, accWeight, gap }),
    );
  });

  if (viableSpans.length === 0) {
    spanCache.set(cacheKey, results);
    return results;
  }

  // 2. Для кожного життєздатного спану визначаємо мінімальну кількість балок
  const spanWithBeams = viableSpans.map((span) => {
    const beams = beamsRange.find((b) =>
      checkSpanWeight({ span, beams: b, accLength, accWeight, gap }),
    )!;
    return { spanLength: span.length, beams };
  });

  // 3. Генеруємо комбінації тільки один раз для всіх доступних довжин
  const allSpanLengths = spanWithBeams
    .map((s) => s.spanLength)
    .sort((a, b) => b - a);
  const combinations = generateSpanCombinations({
    rackLength,
    spans: allSpanLengths,
    limit: 100,
  });

  // 4. Для кожної комбінації беремо максимальний проліт і відповідну кількість балок
  for (const combo of combinations) {
    const maxSpanLength = Math.max(...combo);
    const spanData = spanWithBeams.find((s) => s.spanLength === maxSpanLength);
    if (spanData) {
      results.push({ combination: combo, beams: spanData.beams });
    }
  }

  // Зберігаємо в кеш
  spanCache.set(cacheKey, results);
  return results;
};

/**
 * Очищає кеш spanCache (використовується для тестів або при зміні стандартних значень)
 */
export const clearSpanCache = (): void => {
  spanCache.clear();
};
