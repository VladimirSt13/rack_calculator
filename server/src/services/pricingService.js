import { getDb } from "../db/index.js";
import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateRackName,
} from "../../../shared/rackCalculator.js";
import {
  filterPriceArrayByPermissions,
  getUserPricePermissions,
} from "../helpers/roles.js";

/**
 * Сервіс для розрахунку цін на стелажі
 *
 * Використовується в:
 * - rackSetController (getRackSets, getRackSet, createRackSet)
 * - rackConfigurationController (findOrCreateConfiguration, calculatePricesForConfiguration)
 * - exportController (exportRackSet)
 */

/**
 * Розрахувати ціни для стелажа з урахуванням дозволів користувача
 *
 * @param {Object} rackConfig - Конфігурація стелажа {floors, rows, beamsPerRow, supports, verticalSupports, spans}
 * @param {Object} user - Користувач з правами доступу
 * @param {Object} priceData - Дані прайсу (опціонально, якщо не передано - береться останній з БД)
 * @returns {Object} { components, prices, totalCost, name }
 */
export const calculateRackPrices = async (
  rackConfig,
  user,
  priceData = null,
) => {
  const db = await getDb();

  // Отримати актуальний прайс, якщо не передано
  if (!priceData) {
    const priceRecord = db
      .prepare("SELECT data FROM prices ORDER BY id DESC LIMIT 1")
      .get();
    priceData = priceRecord ? JSON.parse(priceRecord.data) : null;
  }

  // Отримати дозволи користувача
  const userPermissions = await getUserPricePermissions(user);

  // Розрахувати компоненти
  const components = calculateRackComponents(rackConfig, priceData);
  const totalCost = calculateTotalCost(components);
  const totalWithoutIsolators = calculateTotalWithoutIsolators(components);

  // Сформувати масив цін
  // "Без ізоляторів" = базова ціна мінус вартість ізоляторів (а не знижка 10%)
  const prices = [
    { type: "базова", label: "Базова", value: totalCost },
    {
      type: "без_ізоляторів",
      label: "Без ізоляторів",
      value: totalWithoutIsolators,
    },
    { type: "нульова", label: "Нульова", value: totalCost * 1.44 },
  ];

  // Відфільтрувати за дозволами
  const filteredPrices = filterPriceArrayByPermissions(prices, userPermissions);

  return {
    components,
    prices: filteredPrices,
    totalCost,
    name: generateRackName(rackConfig),
  };
};

/**
 * Розрахувати ціни для списку стелажів (комплектів)
 *
 * @param {Array} racksData - Масив стелажів з БД
 * @param {Object} user - Користувач з правами доступу
 * @param {Object} priceData - Дані прайсу (опціонально)
 * @returns {Array} Масив стелажів з розрахованими цінами
 */
export const calculateRackSetPrices = async (
  racksData,
  user,
  priceData = null,
) => {
  const db = await getDb();

  // Перевірка на масив
  if (!Array.isArray(racksData)) {
    console.error(
      "calculateRackSetPrices: очікується масив racksData, отримано:",
      racksData,
    );
    return [];
  }

  // Отримати актуальний прайс, якщо не передано
  if (!priceData) {
    const priceRecord = db
      .prepare("SELECT data FROM prices ORDER BY id DESC LIMIT 1")
      .get();
    priceData = priceRecord ? JSON.parse(priceRecord.data) : null;
  }

  // Розрахувати ціни для кожного стелажа
  return racksData.map((rack) => {
    // Якщо вже є components і prices (збережені повні дані) - використовуємо їх
    // Це важливо для експорту, щоб не втрачати дані
    if (
      rack.components &&
      Object.keys(rack.components).length > 0 &&
      rack.prices &&
      rack.prices.length > 0 &&
      rack.totalCost !== undefined &&
      rack.totalCost !== 0
    ) {
      // Дані вже розраховані - повертаємо як є
      return {
        ...rack,
        components: rack.components,
        prices: rack.prices,
        totalCost: rack.totalCost,
        name: rack.name || "Стелаж",
      };
    }

    // Нова структура: { rackConfigId, quantity } без components і prices
    if (rack.rackConfigId && priceData) {
      const config = db
        .prepare("SELECT * FROM rack_configurations WHERE id = ?")
        .get(rack.rackConfigId);
      if (config) {
        const rackConfig = {
          floors: config.floors,
          rows: config.rows,
          beamsPerRow: config.beams_per_row,
          supports: config.supports || null,
          verticalSupports: config.vertical_supports || null,
          spans: config.spans ? JSON.parse(config.spans) : null,
        };

        const prices = calculateRackPrices(rackConfig, user, priceData);

        return {
          ...rack,
          rackConfigId: rack.rackConfigId,
          config: rackConfig,
          ...prices,
        };
      } else {
        // Конфігурацію не знайдено - повертаємо rack з попередженням
        console.warn(
          `[pricingService] Конфігурацію rackConfigId=${rack.rackConfigId} не знайдено`,
        );
        return {
          ...rack,
          components: rack.components || {},
          prices: rack.prices || [],
          totalCost: rack.totalCost || 0,
          name: rack.name || "Невідома конфігурація",
        };
      }
    }

    // Стара структура: { form, quantity }
    if (rack.form && priceData) {
      const prices = calculateRackPrices(rack.form, user, priceData);

      return {
        ...rack,
        ...prices,
        name: rack.name || prices.name,
      };
    }

    // Дуже стара структура або немає priceData - повертаємо як є
    // Додаємо порожні компоненти і ціни для сумісності
    return {
      ...rack,
      components: rack.components || {},
      prices: rack.prices || [],
      totalCost: rack.totalCost || 0,
    };
  });
};

/**
 * Розрахувати загальну вартість комплекту стелажів
 *
 * @param {Array} racksWithPrices - Масив стелажів з цінами
 * @returns {number} Загальна вартість
 */
export const calculateRackSetTotal = (racksWithPrices) => {
  // Перевірка на масив для уникнення помилки "reduce is not a function"
  if (!Array.isArray(racksWithPrices)) {
    console.error(
      "calculateRackSetTotal: очікується масив, отримано:",
      racksWithPrices,
    );
    return 0;
  }

  return racksWithPrices.reduce(
    (sum, rack) => sum + (rack.totalCost || 0) * (rack.quantity || 1),
    0,
  );
};

export default {
  calculateRackPrices,
  calculateRackSetPrices,
  calculateRackSetTotal,
};
