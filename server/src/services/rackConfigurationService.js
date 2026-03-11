import { getDb } from '../db/index.js';
import { calculateRackPrices } from './pricingService.js';

/**
 * Сервіс для роботи з конфігураціями стелажів
 */

/**
 * Знайти або створити конфігурацію стелажа
 * @param {Object} config - Дані конфігурації { floors, rows, beamsPerRow, supports, verticalSupports, spans }
 * @returns {Promise<number>} ID конфігурації
 */
export const findOrCreateConfiguration = async (config) => {
  const db = await getDb();

  const supports = config.supports || '';
  const verticalSupports = config.verticalSupports || '';
  const spans = config.spans ? JSON.stringify(config.spans) : '[]';

  const crypto = await import('crypto');
  const spansHash = spans ? crypto.createHash('sha256').update(spans).digest('hex') : '';

  const existing = db.prepare(`
    SELECT id FROM rack_configurations
    WHERE floors = ?
      AND rows = ?
      AND beams_per_row = ?
      AND supports = ?
      AND vertical_supports = ?
      AND spans = ?
      AND spans_hash = ?
  `).get(
    config.floors,
    config.rows,
    config.beamsPerRow,
    supports,
    verticalSupports,
    spans,
    spansHash
  );

  if (existing) {
    console.log(`[RackConfigService] Found existing configuration: ${existing.id}`);
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO rack_configurations (
      floors, rows, beams_per_row, supports, vertical_supports, spans, spans_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    config.floors,
    config.rows,
    config.beamsPerRow,
    supports,
    verticalSupports,
    spans,
    spansHash
  );

  console.log(`[RackConfigService] Created new configuration: ${result.lastInsertRowid}`);
  return result.lastInsertRowid;
};

/**
 * Отримати конфігурацію за ID
 * @param {number} id - ID конфігурації
 * @returns {Promise<Object|null>} Конфігурація або null
 */
export const getConfigurationById = async (id) => {
  const db = await getDb();

  const config = db.prepare(`
    SELECT * FROM rack_configurations WHERE id = ?
  `).get(id);

  if (!config) {
    return null;
  }

  return {
    ...config,
    supports: config.supports ? JSON.parse(config.supports) : null,
    vertical_supports: config.vertical_supports ? JSON.parse(config.vertical_supports) : null,
    spans: config.spans ? JSON.parse(config.spans) : null,
  };
};

/**
 * Розрахувати ціни для конфігурації
 * @param {number} configId - ID конфігурації
 * @param {Object} user - Користувач з правами доступу
 * @param {number} quantity - Кількість стелажів
 * @returns {Promise<Object>} Результат розрахунку
 */
export const calculatePricesForConfiguration = async (configId, user, quantity = 1) => {
  const db = await getDb();

  const config = db.prepare(`
    SELECT * FROM rack_configurations WHERE id = ?
  `).get(configId);

  if (!config) {
    throw new Error('Configuration not found');
  }

  const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();

  if (!priceRecord) {
    throw new Error('Price data not found');
  }

  const priceData = JSON.parse(priceRecord.data);

  const rackConfig = {
    floors: config.floors,
    rows: config.rows,
    beamsPerRow: config.beams_per_row,
    supports: config.supports ? JSON.parse(config.supports) : null,
    verticalSupports: config.vertical_supports ? JSON.parse(config.vertical_supports) : null,
    spans: config.spans ? JSON.parse(config.spans) : null,
  };

  const { components, prices, totalCost } = await calculateRackPrices(rackConfig, user, priceData);

  return {
    rackConfigId: configId,
    quantity,
    components,
    prices,
    totalCost: totalCost * quantity,
  };
};

/**
 * Знайти або створити конфігурацію та розрахувати ціни
 * @param {Object} config - Дані конфігурації
 * @param {Object} user - Користувач з правами доступу
 * @returns {Promise<Object>} Результат з ID та цінами
 */
export const findOrCreateConfigurationWithPrices = async (config, user) => {
  const configId = await findOrCreateConfiguration(config);

  const db = await getDb();
  const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();

  if (!priceRecord) {
    throw new Error('Price data not found');
  }

  const priceData = JSON.parse(priceRecord.data);

  const rackConfig = {
    floors: config.floors,
    rows: config.rows,
    beamsPerRow: config.beamsPerRow,
    supports: config.supports,
    verticalSupports: config.verticalSupports,
    spans: config.spans,
  };

  const { components, prices, totalCost, name } = await calculateRackPrices(rackConfig, user, priceData);

  return {
    rackConfigId: configId,
    name,
    config: rackConfig,
    components,
    prices,
    totalCost,
  };
};

export default {
  findOrCreateConfiguration,
  getConfigurationById,
  calculatePricesForConfiguration,
  findOrCreateConfigurationWithPrices,
};
