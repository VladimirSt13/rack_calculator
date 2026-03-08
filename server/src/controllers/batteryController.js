import { getDb } from '../db/index.js';
import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateBatteryRackName,
} from '../../../shared/rackCalculator.js';
import { getUserPermissions, PRICE_TYPES } from '../helpers/roles.js';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '../helpers/audit.js';

/**
 * Отримати або створити конфігурацію стелажа в БД
 */
const findOrCreateRackConfiguration = (db, config) => {
  const { floors, rows, beamsPerRow, supports, verticalSupports, spans } = config;
  
  // Серіалізація для порівняння
  const supportsStr = supports || null;
  const verticalSupportsStr = verticalSupports || null;
  const spansJson = spans ? JSON.stringify(spans) : null;
  
  // Спроба знайти існуючу конфігурацію
  const existing = db.prepare(`
    SELECT id FROM rack_configurations
    WHERE floors = ?
      AND rows = ?
      AND beams_per_row = ?
      AND (supports IS ? OR supports = ?)
      AND (vertical_supports IS ? OR vertical_supports = ?)
      AND (spans IS ? OR spans = ?)
  `).get(
    floors,
    rows,
    beamsPerRow,
    supportsStr === null ? 'NULL' : supportsStr,
    supportsStr,
    verticalSupportsStr === null ? 'NULL' : verticalSupportsStr,
    verticalSupportsStr,
    spansJson === null ? 'NULL' : spansJson,
    spansJson
  );
  
  if (existing) {
    return existing.id;
  }
  
  // Створити нову конфігурацію
  const result = db.prepare(`
    INSERT INTO rack_configurations (floors, rows, beams_per_row, supports, vertical_supports, spans)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    floors,
    rows,
    beamsPerRow,
    supportsStr,
    verticalSupportsStr,
    spansJson
  );
  
  return result.lastInsertRowid;
};

/**
 * Розрахунок цін з урахуванням дозволів користувача
 */
const calculateRackPricesWithPermissions = (rackConfig, priceData, user) => {
  const components = calculateRackComponents(rackConfig, priceData);
  const totalCost = calculateTotalCost(components);
  const totalWithoutIsolators = calculateTotalWithoutIsolators(components);
  const zeroPrice = totalCost * 1.44;
  
  const permissions = user?.permissions || { price_types: [] };
  const prices = [];
  
  if (permissions.price_types?.includes('базова')) {
    prices.push({ type: 'базова', label: 'Базова ціна', value: Math.round(totalCost * 100) / 100 });
  }
  if (permissions.price_types?.includes('без_ізоляторів')) {
    prices.push({ type: 'без_ізоляторів', label: 'Без ізоляторів', value: Math.round(totalWithoutIsolators * 100) / 100 });
  }
  if (permissions.price_types?.includes('нульова')) {
    prices.push({ type: 'нульова', label: 'Нульова ціна', value: Math.round(zeroPrice * 100) / 100 });
  }
  
  // Визначаємо основну ціну для totalCost
  let mainTotalCost = 0;
  if (permissions.price_types?.includes('нульова')) {
    mainTotalCost = zeroPrice;
  } else if (permissions.price_types?.includes('без_ізоляторів')) {
    mainTotalCost = totalWithoutIsolators;
  } else if (permissions.price_types?.includes('базова')) {
    mainTotalCost = totalCost;
  }
  
  return {
    components,
    prices,
    totalCost: mainTotalCost,
  };
};

/**
 * POST /api/battery/calculate
 * Розрахунок стелажа по батареї зі збереженням конфігурації в БД
 */
export const calculateBatteryRack = async (req, res, next) => {
  try {
    const { batteryDimensions, weight, quantity, config } = req.body;
    const db = await getDb();

    // Отримати актуальний прайс
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    if (!priceRecord) {
      return res.status(404).json({ error: 'Price data not found' });
    }
    const price = JSON.parse(priceRecord.data);

    // Розрахунок компонентів та цін
    const { components, prices, totalCost } = calculateRackPricesWithPermissions(config, price, req.user);

    // Знайти або створити конфігурацію в БД
    const rackConfigId = findOrCreateRackConfiguration(db, {
      floors: config.floors,
      rows: config.rows,
      beamsPerRow: config.beamsPerRow,
      supports: config.supports,
      verticalSupports: config.verticalSupports,
      spans: config.spansArray || [],
    });

    // Audit log
    if (req.user) {
      await logAudit({
        userId: req.user.userId,
        action: AUDIT_ACTIONS.CREATE,
        entityType: ENTITY_TYPES.CALCULATION,
        newValue: { batteryDimensions, weight, quantity, totalCost, rackConfigId },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.json({
      rackConfigId,
      name: generateBatteryRackName({
        floors: config.floors,
        rows: config.rows,
        supportType: config.supports?.includes('C') ? 'step' : 'edge',
        rackWidth: config.spansArray?.[0] || 0,
        rackLength: batteryDimensions?.length || 0,
        spans: config.spansArray || [],
      }),
      components,
      prices,
      totalCost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/battery/find-best
 * Підбір найкращого варіанту стелажа по батареї з розрахунком варіантів балок
 */
export const findBestRackForBattery = async (req, res, next) => {
  try {
    const { batteryDimensions, weight, quantity, config } = req.body;
    const db = await getDb();

    // Валідація
    if (!batteryDimensions || !batteryDimensions.length || !batteryDimensions.width) {
      return res.status(400).json({ error: 'Battery dimensions are required' });
    }

    // Отримати актуальний прайс
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    if (!priceRecord) {
      return res.status(404).json({ error: 'Price data not found' });
    }
    const price = JSON.parse(priceRecord.data);

    // Отримати доступні прольоти з прайсу
    const spanOptions = Object.keys(price.spans || {}).map(Number).sort((a, b) => a - b);

    if (spanOptions.length === 0) {
      return res.status(400).json({ error: 'No span options available in price data' });
    }

    // Розрахунок необхідної довжини стелажа
    const batteryLength = batteryDimensions.length;
    const gap = batteryDimensions.gap || 0;
    const batteriesPerRow = quantity || 1;

    // Загальна довжина, яку потрібно покрити
    const requiredLength = (batteryLength + gap) * batteriesPerRow;

    // Генерація варіантів розподілу по стандартним балкам
    const variants = spanOptions.map((span) => {
      const spansCount = Math.ceil(requiredLength / span);
      const totalLength = span * spansCount;
      const excessLength = totalLength - requiredLength;
      
      // Комбінація балок
      const combination = Array(spansCount).fill(span);

      return {
        span,
        spansCount,
        totalLength,
        combination,
        excessLength: Math.round(excessLength * 100) / 100,
      };
    });

    // Вибір найкращого варіанту (мінімальна довжина, але >= requiredLength)
    const bestMatch = variants.reduce((min, v) => 
      (v.totalLength >= requiredLength && v.totalLength < min.totalLength) ? v : min
    , variants[0]);

    // Розрахунок конфігурації для найкращого варіанту
    const rackConfig = {
      floors: config?.floors || 1,
      rows: config?.rows || 2,
      beamsPerRow: config?.beamsPerRow || 2,
      supports: config?.supports || 'C80',
      verticalSupports: config?.verticalSupports || null,
      spansArray: bestMatch.combination,
    };

    // Розрахунок цін для найкращого варіанту
    const { components, prices, totalCost } = calculateRackPricesWithPermissions(rackConfig, price, req.user);

    // Знайти або створити конфігурацію в БД
    const rackConfigId = findOrCreateRackConfiguration(db, rackConfig);

    res.json({
      rackConfigId,
      requiredLength,
      variants: variants.map((v, index) => ({
        ...v,
        isBest: v.span === bestMatch.span,
        index,
      })),
      bestMatch: {
        rackConfigId,
        span: bestMatch.span,
        spansCount: bestMatch.spansCount,
        totalLength: bestMatch.totalLength,
        combination: bestMatch.combination,
        config: rackConfig,
        components,
        prices,
        totalCost,
        name: generateBatteryRackName({
          floors: rackConfig.floors,
          rows: rackConfig.rows,
          supportType: rackConfig.supports?.includes('C') ? 'step' : 'edge',
          rackWidth: batteryDimensions.width,
          rackLength: batteryLength,
          spans: rackConfig.spansArray,
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  calculateBatteryRack,
  findBestRackForBattery,
};
