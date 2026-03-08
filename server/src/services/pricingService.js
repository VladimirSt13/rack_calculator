import { getDb } from '../db/index.js';
import { calculateRackComponents, calculateTotalCost, generateRackName } from '../../../shared/rackCalculator.js';
import { filterPriceArrayByPermissions, getUserPricePermissions } from '../helpers/roles.js';

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
export const calculateRackPrices = async (rackConfig, user, priceData = null) => {
  const db = await getDb();
  
  // Отримати актуальний прайс, якщо не передано
  if (!priceData) {
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    priceData = priceRecord ? JSON.parse(priceRecord.data) : null;
  }
  
  // Отримати дозволи користувача
  const userPermissions = await getUserPricePermissions(user);
  
  // Розрахувати компоненти
  const components = calculateRackComponents(rackConfig, priceData);
  const totalCost = calculateTotalCost(components);
  
  // Сформувати масив цін
  const prices = [
    { type: 'базова', label: 'Базова', value: totalCost },
    { type: 'без_ізоляторів', label: 'Без ізоляторів', value: totalCost * 0.9 },
    { type: 'нульова', label: 'Нульова', value: totalCost * 1.44 },
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
export const calculateRackSetPrices = async (racksData, user, priceData = null) => {
  const db = await getDb();
  
  // Отримати актуальний прайс, якщо не передано
  if (!priceData) {
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    priceData = priceRecord ? JSON.parse(priceRecord.data) : null;
  }
  
  // Розрахувати ціни для кожного стелажа
  return racksData.map(rack => {
    // Нова структура: { rackConfigId, quantity }
    if (rack.rackConfigId && priceData) {
      const config = db.prepare('SELECT * FROM rack_configurations WHERE id = ?').get(rack.rackConfigId);
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
      }
    }
    
    // Стара структура: { form, quantity }
    else if (rack.form && priceData) {
      const prices = calculateRackPrices(rack.form, user, priceData);
      
      return {
        ...rack,
        ...prices,
        name: rack.name || prices.name,
      };
    }
    
    // Дуже стара структура - повертаємо як є
    else {
      return rack;
    }
  });
};

/**
 * Розрахувати загальну вартість комплекту стелажів
 * 
 * @param {Array} racksWithPrices - Масив стелажів з цінами
 * @returns {number} Загальна вартість
 */
export const calculateRackSetTotal = (racksWithPrices) => {
  return racksWithPrices.reduce(
    (sum, rack) => sum + ((rack.totalCost || 0) * (rack.quantity || 1)), 0
  );
};

export default {
  calculateRackPrices,
  calculateRackSetPrices,
  calculateRackSetTotal,
};
