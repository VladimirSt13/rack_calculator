import { generateBatteryRackName } from "../../../shared/rackCalculator.js";
import {
  calcRackSpans,
  optimizeRacks,
  checkSpanWeight,
  CONSTANTS,
} from "../helpers/batteryRackBuilder.js";
import { getCurrentPriceData } from "./priceService.js";
import { findOrCreateConfiguration } from "./rackConfigurationService.js";
import { calculateRack } from "./rackService.js";

/**
 * Сервіс для розрахунку стелажів по батареї
 *
 * Відповідає тільки за:
 * 1. Підбір оптимальних прольотів (calcRackSpans, optimizeRacks)
 * 2. Вибір опори з переліку стандартних (rows * width + delta)
 * 3. Вибір вертикальної опори за висотою (floors * height + зазори)
 * 4. Перевірка несучої здатності балок (checkSpanWeight)
 * 5. Визначення типу розкосів (braces)
 * 6. Генерацію назви (generateBatteryRackName)
 *
 * Розрахунок цін делегує rackService.calculateRack()
 */

/**
 * Розрахувати висоту стелажа
 * @param {Object} params
 * @param {number} params.elementHeight - Висота акумулятора
 * @param {number} params.floors - Кількість поверхів
 * @param {number} params.floorGap - Зазор між поверхами (за замовчуванням 50мм)
 * @param {number} params.supportHeight - Висота опори (за замовчуванням 100мм)
 * @returns {number} Висота стелажа
 */
export const calcRackHeight = ({
  elementHeight,
  floors,
  floorGap = 50,
  supportHeight = 100,
}) => {
  return floors * elementHeight + floors * (supportHeight + floorGap);
};

/**
 * Вибрати вертикальну опору з прайсу за висотою
 * @param {Object} params
 * @param {number} params.height - Потрібна висота
 * @param {Object} params.price - Дані прайсу
 * @returns {string|null} Назва вертикальної опори або null
 */
export const findVerticalSupport = ({ height, price }) => {
  const verticalSupports = price?.vertical_supports || {};
  const keys = Object.keys(verticalSupports);

  let closest = null;
  let minDiff = Infinity;

  for (const key of keys) {
    const supportHeight = parseInt(key, 10);
    if (supportHeight >= height) {
      const diff = supportHeight - height;
      if (diff < minDiff) {
        minDiff = diff;
        closest = key;
      }
    }
  }

  // Якщо не знайдено більшої, беремо максимальну
  if (!closest && keys.length > 0) {
    closest = keys.reduce((a, b) =>
      parseInt(a, 10) > parseInt(b, 10) ? a : b,
    );
  }

  return closest;
};

/**
 * Розрахувати ширину стелажа (вибір опори з переліку стандартних)
 * @param {Object} params
 * @param {number} params.elementWidth - Ширина акумулятора
 * @param {number} params.rows - Кількість рядів
 * @param {Object} params.price - Дані прайсу для отримання стандартних опор
 * @param {number} params.rowGap - Дельта між рядами (за замовчуванням 50мм)
 * @param {string} params.supportType - Тип опори: 'straight' або 'step'
 * @returns {string} Назва опори (наприклад, '430С' для ступінчастого або '430' для прямої)
 */
export const calcRackWidth = ({
  elementWidth,
  rows,
  price,
  rowGap = 50,
  supportType = "straight",
}) => {
  // Отримуємо стандартні опори з прайсу
  const supports = price?.supports || {};
  const standardWidths = Object.keys(supports)
    .map((key) => {
      // Парсинг назви опори: '430', '430С', 'C400', '600С' тощо
      const match = key.match(/^(\d+)(С|C)?$/i);
      return match ? parseInt(match[1]) : null;
    })
    .filter((w) => w !== null);

  // Якщо немає опор в прайсі, використовуємо стандартний набір
  const widths =
    standardWidths.length > 0
      ? standardWidths
      : [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500];

  const requiredWidth = elementWidth * rows + (rows - 1) * rowGap;

  // Знаходимо найблильшу більшу стандартну ширину
  const selectedWidth =
    widths.find((w) => w >= requiredWidth) || widths[widths.length - 1];

  // Формуємо назву опори
  // Для ступінчастого стелажа: 430С, 600С (літера після цифр)
  // Для прямого стелажа: 430, 600 (тільки цифри)
  if (supportType === "step") {
    return `${selectedWidth}С`; // Ступінчаста опора (літера після)
  } else {
    return `${selectedWidth}`; // Пряма опора (тільки цифри)
  }
};

/**
 * Підбір найкращого варіанту стелажа по батареї
 */
export const findBestRackForBattery = async (batteryData, user) => {
  const { batteryDimensions, quantity, config } = batteryData;

  if (
    !batteryDimensions ||
    !batteryDimensions.length ||
    !batteryDimensions.width
  ) {
    throw new Error("Battery dimensions are required");
  }

  const price = await getCurrentPriceData();

  const spanObjects = Object.entries(price.spans || {}).map(
    ([length, data]) => ({
      length: Number(length),
      capacity: data.capacity || 1000,
    }),
  );

  if (spanObjects.length === 0) {
    throw new Error("No span options available in price data");
  }

  const rows = config?.rows || 2;
  const floors = config?.floors || 1;
  const batteriesPerRow = Math.ceil(quantity / (rows * floors));

  const batteryLength = batteryDimensions.length;
  const gap = batteryDimensions.gap || 0;
  const requiredLength =
    batteriesPerRow * batteryLength + (batteriesPerRow - 1) * gap;

  // ✅ Перевірка несучої здатності та підбір балок
  const spanCombinations = calcRackSpans({
    rackLength: requiredLength,
    accLength: batteryLength,
    accWeight: batteryDimensions.weight,
    gap,
    standardSpans: spanObjects,
  });

  const maxSpan = Math.max(...spanObjects.map((s) => s.length));
  const optimizedVariants = optimizeRacks(
    spanCombinations,
    requiredLength,
    maxSpan,
    5,
    price,
  );

  const bestVariant = optimizedVariants[0];
  const rackLength = bestVariant?.totalLength || requiredLength;
  const bracesType =
    rackLength >= 1500 ? "D1500" : rackLength >= 1000 ? "D1000" : "D600";

  // Визначаємо тип опори
  const supportType = config.supportType || "straight";

  // ✅ Вибір опори з переліку стандартних (з прайсу)
  const supports = calcRackWidth({
    elementWidth: batteryDimensions.width,
    rows,
    price,
    rowGap: config.rowGap || 50,
    supportType,
  });

  // ✅ Розрахунок висоти стелажа та вибір вертикальної опори
  // Вертикальні опори потрібні тільки для багатоповерхових стелажів (floors > 1)
  let verticalSupports = null;
  let rackHeight = null;

  if (floors > 1) {
    rackHeight = calcRackHeight({
      elementHeight: batteryDimensions.height,
      floors,
      floorGap: config.floorGap || 50,
      supportHeight: config.supportHeight || 100,
    });

    verticalSupports = findVerticalSupport({
      height: rackHeight,
      price,
    });
  }

  const rackConfig = {
    floors,
    rows,
    beamsPerRow: bestVariant?.beams || 2,
    supports, // Вибір опори на основі ширини з прайсу
    verticalSupports, // Вибір вертикальної опори за висотою (null для floors=1)
    spansArray: bestVariant?.combination || [],
    braces: bracesType,
  };

  // ✅ Використовуємо rackService для розрахунку найкращого варіанту
  const bestRackResult = await calculateRack(rackConfig, user);
  const bestRackConfigId = await findOrCreateConfiguration(rackConfig);

  const variantsWithPrices = await Promise.all(
    optimizedVariants.map(async (v, index) => {
      const variantLength = v.totalLength || requiredLength;
      const variantBraces =
        variantLength >= 1500
          ? "D1500"
          : variantLength >= 1000
            ? "D1000"
            : "D600";

      const variantConfig = {
        floors,
        rows,
        beamsPerRow: v.beams,
        supports, // Та сама опора для всіх варіантів
        verticalSupports, // Та сама вертикальна опора для всіх варіантів
        spansArray: v.combination,
        braces: variantBraces,
      };

      // ✅ Використовуємо rackService для розрахунку кожного варіанту
      const variantRackResult = await calculateRack(variantConfig, user);

      // ✅ Створюємо або знаходимо конфігурацію для кожного варіанту
      const variantConfigId = await findOrCreateConfiguration({
        floors,
        rows,
        beamsPerRow: v.beams,
        supports,
        verticalSupports,
        spans: v.combination, // Зберігаємо як масив чисел
      });

      return {
        rackConfigId: variantConfigId,
        name: generateBatteryRackName({
          floors: variantConfig.floors,
          rows: variantConfig.rows,
          supportType:
            variantConfig.supports?.includes("С") ||
            variantConfig.supports?.includes("C")
              ? "step"
              : "edge",
          rackWidth: parseInt(supports) || batteryDimensions.width, // ✅ Використовуємо розраховану ширину опори
          rackLength: batteryLength,
          spans: variantConfig.spansArray,
        }),
        config: variantConfig,
        components: variantRackResult.components,
        prices: variantRackResult.prices,
        totalCost: variantRackResult.total,
        span: v.combination[0],
        spansCount: v.combination.length,
        totalLength: v.totalLength,
        combination: v.combination,
        beams: v.beams,
        batteriesPerRow,
        excessLength: Math.round(v.overLength * 100) / 100,
        isBest: index === 0,
        index,
      };
    }),
  );

  return {
    rackConfigId: bestRackConfigId,
    requiredLength: Math.round(requiredLength),
    batteriesPerRow,
    supports, // Додано назву опори
    verticalSupports, // Додано вертикальну опору
    rackHeight, // Додано висоту стелажа
    variants: variantsWithPrices,
    bestMatch: {
      rackConfigId: bestRackConfigId,
      span: bestVariant?.combination?.[0],
      spansCount: bestVariant?.combination?.length,
      totalLength: bestVariant?.totalLength,
      combination: bestVariant?.combination,
      config: rackConfig,
      components: bestRackResult.components,
      prices: bestRackResult.prices,
      totalCost: bestRackResult.total,
      name: generateBatteryRackName({
        floors: rackConfig.floors,
        rows: rackConfig.rows,
        supportType:
          supports.includes("С") || supports.includes("C") ? "step" : "edge",
        rackWidth: parseInt(supports), // ✅ Використовуємо розраховану ширину опори
        rackLength: batteryLength,
        spans: rackConfig.spansArray,
      }),
    },
  };
};

/**
 * Розрахунок стелажа по батареї
 */
export const calculateBatteryRack = async (batteryData, user) => {
  const { batteryDimensions, weight, quantity, config } = batteryData;

  const price = await getCurrentPriceData();

  const rows = config?.rows || 2;
  const floors = config?.floors || 1;
  const batteriesPerRow = Math.ceil(quantity / (rows * floors));

  const batteryLength = batteryDimensions.length;
  const gap = batteryDimensions.gap || 0;
  const requiredLength =
    batteriesPerRow * batteryLength + (batteriesPerRow - 1) * gap;

  // Підбір прольотів (якщо не передано готові)
  let spansArray = config.spansArray || [];

  if (spansArray.length === 0) {
    const spanObjects = Object.entries(price.spans || {}).map(
      ([length, data]) => ({
        length: Number(length),
        capacity: data.capacity || 1000,
      }),
    );

    if (spanObjects.length === 0) {
      throw new Error("No span options available in price data");
    }

    // ✅ Перевірка несучої здатності та підбір балок
    const spanCombinations = calcRackSpans({
      rackLength: requiredLength,
      accLength: batteryLength,
      accWeight: batteryDimensions.weight,
      gap,
      standardSpans: spanObjects,
    });

    const maxSpan = Math.max(...spanObjects.map((s) => s.length));
    const optimizedVariants = optimizeRacks(
      spanCombinations,
      requiredLength,
      maxSpan,
      1,
      price,
    );
    const bestVariant = optimizedVariants[0];

    spansArray = bestVariant?.combination || [];
  }

  // Визначаємо тип опори
  const supportType = config.supportType || "straight";

  // ✅ Вибір опори з переліку стандартних (з прайсу)
  const supports = calcRackWidth({
    elementWidth: batteryDimensions.width,
    rows,
    price,
    rowGap: config.rowGap || 50,
    supportType,
  });

  // ✅ Розрахунок висоти стелажа та вибір вертикальної опори
  // Вертикальні опори потрібні тільки для багатоповерхових стелажів (floors > 1)
  let verticalSupports = null;
  let rackHeight = null;

  if (floors > 1) {
    rackHeight = calcRackHeight({
      elementHeight: batteryDimensions.height,
      floors,
      floorGap: config.floorGap || 50,
      supportHeight: config.supportHeight || 100,
    });

    verticalSupports = findVerticalSupport({
      height: rackHeight,
      price,
    });
  }

  // Формуємо конфігурацію стелажа
  const rackConfig = {
    floors: config.floors,
    rows: config.rows,
    beamsPerRow: config.beamsPerRow || 2,
    supports, // Вибір опори на основі ширини з прайсу
    verticalSupports, // null для одноповерхових
    spans: spansArray,
  };

  // ✅ Використовуємо rackService для розрахунку!
  const rackResult = await calculateRack(rackConfig, user);

  // Зберігаємо конфігурацію
  const rackConfigId = await findOrCreateConfiguration({
    floors: config.floors,
    rows: config.rows,
    beamsPerRow: config.beamsPerRow || 2,
    supports,
    verticalSupports,
    spans: spansArray,
  });

  return {
    rackConfigId,
    supports, // Додано назву опори
    verticalSupports, // Додано вертикальну опору
    rackHeight, // Додано висоту стелажа
    name: generateBatteryRackName({
      floors: config.floors,
      rows: config.rows,
      supportType:
        supports.includes("С") || supports.includes("C") ? "step" : "edge",
      rackWidth: parseInt(supports) || batteryDimensions.width, // ✅ Використовуємо розраховану ширину опори
      rackLength: batteryDimensions?.length || 0,
      spans: spansArray,
    }),
    components: rackResult.components,
    prices: rackResult.prices,
    totalCost: rackResult.total,
  };
};

export default {
  calcRackWidth,
  findOrCreateRackConfiguration: findOrCreateConfiguration,
  calculateBatteryRack,
  findBestRackForBattery,
};
