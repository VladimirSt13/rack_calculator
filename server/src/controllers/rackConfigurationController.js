import { getDb } from '../db/index.js';
import { calculateRackComponents, calculateTotalCost } from '../../../shared/rackCalculator.js';
import { filterPricesByPermissions, getUserPricePermissions } from '../helpers/roles.js';

/**
 * GET /api/rack-configurations/find-or-create
 * Знайти або створити конфігурацію стелажа
 */
export const findOrCreateConfiguration = async (req, res, next) => {
  try {
    const db = await getDb();
    const config = req.body;

    // Серіалізація для порівняння JSON
    const supports = config.supports ? JSON.stringify(config.supports) : null;
    const verticalSupports = config.verticalSupports ? JSON.stringify(config.verticalSupports) : null;
    const spans = config.spans ? JSON.stringify(config.spans) : null;

    // 1. Спроба знайти існуючу конфігурацію
    const existing = db.prepare(`
      SELECT id FROM rack_configurations
      WHERE floors = ? 
        AND rows = ? 
        AND beams_per_row = ?
        AND (supports IS ? OR supports = ?)
        AND (vertical_supports IS ? OR vertical_supports = ?)
        AND (spans IS ? OR spans = ?)
    `).get(
      config.floors,
      config.rows,
      config.beamsPerRow,
      supports === null ? 'NULL' : supports,
      supports,
      verticalSupports === null ? 'NULL' : verticalSupports,
      verticalSupports,
      spans === null ? 'NULL' : spans,
      spans
    );

    let configId;
    
    if (existing) {
      // Знайдено існуючу
      configId = existing.id;
      console.log(`[RackConfig] Found existing configuration: ${configId}`);
    } else {
      // Створити нову
      const result = db.prepare(`
        INSERT INTO rack_configurations (
          floors, rows, beams_per_row, supports, vertical_supports, spans
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        config.floors,
        config.rows,
        config.beamsPerRow,
        supports,
        verticalSupports,
        spans
      );
      
      configId = result.lastInsertRowid;
      console.log(`[RackConfig] Created new configuration: ${configId}`);
    }

    // 2. Отримати актуальний прайс для розрахунку
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    
    if (!priceRecord) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    const priceData = JSON.parse(priceRecord.data);
    const userPermissions = getUserPricePermissions(req.user);

    // 3. Розрахувати компоненти та ціни
    const components = calculateRackComponents(config, priceData);
    const totalCost = calculateTotalCost(components);

    // Формуємо масив цін
    const prices = [
      { type: 'базова', label: 'Базова', value: totalCost },
      { type: 'без_ізоляторів', label: 'Без ізоляторів', value: totalCost * 0.9 },
      { type: 'нульова', label: 'Нульова', value: totalCost * 1.44 },
    ];

    const filteredPrices = filterPricesByPermissions(prices, userPermissions);

    // 4. Відповідь
    res.json({
      rackConfigId: configId,
      name: `Стелаж ${config.floors}х${config.rows}х${config.beamsPerRow}`,
      config: {
        floors: config.floors,
        rows: config.rows,
        beamsPerRow: config.beamsPerRow,
        supports: config.supports,
        verticalSupports: config.verticalSupports,
        spans: config.spans,
      },
      components,
      prices: filteredPrices,
      totalCost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rack-configurations/:id
 * Отримати конфігурацію за ID
 */
export const getConfigurationById = async (req, res, next) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const config = db.prepare(`
      SELECT * FROM rack_configurations WHERE id = ?
    `).get(id);

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // Парсинг JSON полів
    config.supports = config.supports ? JSON.parse(config.supports) : null;
    config.vertical_supports = config.vertical_supports ? JSON.parse(config.vertical_supports) : null;
    config.spans = config.spans ? JSON.parse(config.spans) : null;

    res.json({ configuration: config });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rack-configurations/:id/calculate-prices
 * Розрахувати ціни для конфігурації з актуального прайсу
 */
export const calculatePricesForConfiguration = async (req, res, next) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const config = db.prepare(`
      SELECT * FROM rack_configurations WHERE id = ?
    `).get(id);

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // Отримати актуальний прайс
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    
    if (!priceRecord) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    const priceData = JSON.parse(priceRecord.data);
    const userPermissions = getUserPricePermissions(req.user);

    // Підготувати конфігурацію для розрахунку
    const rackConfig = {
      floors: config.floors,
      rows: config.rows,
      beamsPerRow: config.beams_per_row,
      supports: config.supports ? JSON.parse(config.supports) : null,
      verticalSupports: config.vertical_supports ? JSON.parse(config.vertical_supports) : null,
      spans: config.spans ? JSON.parse(config.spans) : null,
    };

    // Розрахувати компоненти та ціни
    const components = calculateRackComponents(rackConfig, priceData);
    const totalCost = calculateTotalCost(components) * quantity;

    const prices = [
      { type: 'базова', label: 'Базова', value: totalCost },
      { type: 'без_ізоляторів', label: 'Без ізоляторів', value: totalCost * 0.9 },
      { type: 'нульова', label: 'Нульова', value: totalCost * 1.44 },
    ];

    const filteredPrices = filterPricesByPermissions(prices, userPermissions);

    res.json({
      rackConfigId: id,
      quantity,
      components,
      prices: filteredPrices,
      totalCost: totalCost,
      calculated_at: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  findOrCreateConfiguration,
  getConfigurationById,
  calculatePricesForConfiguration,
};
