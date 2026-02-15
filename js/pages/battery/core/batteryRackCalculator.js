// -------------------------
// Стандартні розміри
// -------------------------
const standardWidths = [215, 290, 430, 580];
const standardHeights = [632, 1190];
const standardSpans = [600, 750, 900, 950, 1000, 1050, 1200, 1500];
const MIN_GOOD_SPAN = 900;

const SPAN_WEIGHTS = {
  overLength: 1.0,
  partsCount: 0.6,
  variety: 0.8,
  smallSpan: 1.2,
};

const SPAN_TYPES = {
  BEST_FIT: "BEST_FIT",
  MIN_PARTS: "MIN_PARTS",
  SYMMETRIC: "SYMMETRIC",
  BALANCED: "BALANCED",
};

// -------------------------
// Допоміжні функції
// -------------------------
const getClosestLarger = (value, standards) => {
  const candidates = standards.filter((s) => s >= value);
  return candidates.length ? Math.min(...candidates) : Math.max(...standards);
};

const calcSpanScore = (combo, rackLength) => {
  const total = combo.reduce((s, n) => s + n, 0);
  if (total < rackLength) return Infinity;

  const overLength = total - rackLength;
  const partsCount = combo.length;
  const varietyPenalty = new Set(combo).size - 1;
  const smallSpanPenalty = combo.filter((s) => s < MIN_GOOD_SPAN).length;

  return (
    overLength * SPAN_WEIGHTS.overLength +
    partsCount * SPAN_WEIGHTS.partsCount +
    varietyPenalty * SPAN_WEIGHTS.variety +
    smallSpanPenalty * SPAN_WEIGHTS.smallSpan
  );
};

const isSymmetricCombo = (combo) => {
  const n = combo.length;
  for (let i = 0; i < Math.floor(n / 2); i++) {
    if (combo[i] !== combo[n - 1 - i]) return false;
  }
  return true;
};

const getLabelByType = (type) => {
  switch (type) {
    case SPAN_TYPES.BEST_FIT:
      return "Рекомендований";
    case SPAN_TYPES.SYMMETRIC:
      return "Симетричний";
    case SPAN_TYPES.BALANCED:
      return "Збалансований";
    default:
      return "Мінімум прольотів";
  }
};

const classifySpanVariant = (combo, rackLength, maxParts) => {
  const total = combo.reduce((s, n) => s + n, 0);
  const over = total - rackLength;

  if (over === 0) return SPAN_TYPES.BEST_FIT; // точний збіг
  if (isSymmetricCombo(combo)) return SPAN_TYPES.SYMMETRIC; // перевірка симетрії перед мінімумом
  // if (combo.length === Math.min(combo.length, maxParts)) return SPAN_TYPES.MIN_PARTS; // мінімальна кількість елементів
  return SPAN_TYPES.BALANCED;
};

// -------------------------
// Розрахунок ширини та висоти
// -------------------------
export const calcRackWidth = (elementWidth, rows) => {
  return getClosestLarger(elementWidth * rows, standardWidths);
};

export const calcRackHeight = (elementHeight, floors, floorGap = 150, supportHeight = 150) => {
  return getClosestLarger(floors * elementHeight + floors * (supportHeight + floorGap), standardHeights);
};

// Розрахунок прольотів з типами та підписами
export const calcRackSpans = (rackLength, maxOver = 200, maxParts = 10, maxVariants = 3) => {
  const spansSorted = [...standardSpans].sort((a, b) => b - a);
  const candidates = [];

  // --- Генерація всіх комбінацій ---
  const backtrack = (combo, sum) => {
    if (combo.length > maxParts) return;
    if (sum - rackLength > maxOver) return;

    if (sum >= rackLength) {
      candidates.push([...combo]);
      return;
    }

    for (const span of spansSorted) {
      backtrack([...combo, span], sum + span);
    }
  };
  backtrack([], 0);

  // Якщо не знайшли комбінацій – використовуємо мінімальний стандартний
  if (!candidates.length) {
    const minSpan = Math.min(...standardSpans);
    const count = Math.ceil(rackLength / minSpan);
    return [
      {
        combo: Array(count).fill(minSpan),
        totalLength: count * minSpan,
        overLength: count * minSpan - rackLength,
        type: SPAN_TYPES.BALANCED,
        label: getLabelByType(SPAN_TYPES.BALANCED),
        isRecommended: true,
      },
    ];
  }

  // --- Формуємо об’єкти з оцінкою та типом ---
  let enriched = candidates.map((combo) => {
    const total = combo.reduce((s, n) => s + n, 0);
    const over = total - rackLength;
    const type = classifySpanVariant(combo, rackLength, maxParts);

    return {
      combo: combo.sort((a, b) => b - a),
      totalLength: total,
      overLength: over,
      score: calcSpanScore(combo, rackLength),
      type,
      label: getLabelByType(type),
      isRecommended: false,
    };
  });

  // --- Фільтруємо дублікати комбінацій ---
  const seen = new Set();
  enriched = enriched.filter((v) => {
    const key = v.combo.join("-");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // --- Сортування: BEST_FIT перший, інші за score ---
  enriched.sort((a, b) => {
    if (a.type === SPAN_TYPES.BEST_FIT && b.type !== SPAN_TYPES.BEST_FIT) return -1;
    if (b.type === SPAN_TYPES.BEST_FIT && a.type !== SPAN_TYPES.BEST_FIT) return 1;
    return a.score - b.score;
  });

  // --- Встановлюємо рекомендований варіант ---
  if (enriched.length) enriched[0].isRecommended = true;

  return enriched.slice(0, maxVariants);
};

// -------------------------
// Формування конфігурації стелажа
// -------------------------
export const buildRackConfig = (element, totalCount, floors, rows, gap) => {
  const itemsPerRow = Math.ceil(totalCount / (floors * rows));
  const rackLength = itemsPerRow * element.length + (itemsPerRow - 1) * gap;

  return {
    floors,
    rows,
    itemsPerRow,
    rackLength,
    width: calcRackWidth(element.width, rows),
    height: calcRackHeight(element.height, floors),
    spans: calcRackSpans(rackLength),
  };
};

// -------------------------
// Генерація варіантів стелажів
// -------------------------
export const generateRackVariants = ({ element, totalCount, gap }) => {
  const variants = [];

  [1, 2].forEach((floors) => {
    [1, 2].forEach((rows) => {
      const itemsPerRow = Math.ceil(totalCount / (floors * rows));
      const rackLength = itemsPerRow * element.length + (itemsPerRow - 1) * gap;

      variants.push({
        floors,
        rows,
        itemsPerRow,
        rackLength,
        width: calcRackWidth(element.width, rows),
        height: calcRackHeight(element.height, floors),
        spans: calcRackSpans(rackLength),
      });
    });
  });

  return variants;
};
