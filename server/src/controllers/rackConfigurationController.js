import { getDb } from '../db/index.js';
import { calculateRackPrices } from '../services/pricingService.js';

/**
 * GET /api/rack-configurations/find-or-create
 * Знайти або створити конфігурацію стелажа
 */
export const findOrCreateConfiguration = async (req, res, next) => {
  try {
    const db = await getDb();
    const config = req.body;

    // Серіалізація для порівняння JSON
    const supports = config.supports || null;  // Простий рядок, не JSON
    const verticalSupports = config.verticalSupports || null;  // Простий рядок, не JSON
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

    // 3. Підготувати конфігурацію для розрахунку
    const rackConfig = {
      floors: config.floors,
      rows: config.rows,
      beamsPerRow: config.beamsPerRow,
      supports: config.supports,
      verticalSupports: config.verticalSupports,
      spans: config.spans,
    };

    // 4. Розрахувати ціни з урахуванням дозволів
    const { components, prices, totalCost, name } = await calculateRackPrices(rackConfig, req.user, priceData);

    // 5. Відповідь
    res.json({
      rackConfigId: configId,
      name,
      config: rackConfig,
      components,
      prices,
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

    // Підготувати конфігурацію для розрахунку
    const rackConfig = {
      floors: config.floors,
      rows: config.rows,
      beamsPerRow: config.beams_per_row,
      supports: config.supports ? JSON.parse(config.supports) : null,
      verticalSupports: config.vertical_supports ? JSON.parse(config.vertical_supports) : null,
      spans: config.spans ? JSON.parse(config.spans) : null,
    };

    // Розрахувати ціни з урахуванням дозволів
    const { components, prices, totalCost } = await calculateRackPrices(rackConfig, req.user, priceData);

    res.json({
      rackConfigId: id,
      quantity,
      components,
      prices,
      totalCost: totalCost * quantity,
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
