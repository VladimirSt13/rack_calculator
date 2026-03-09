import { getDb } from '../db/index.js';
import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateBatteryRackName,
} from '../../../shared/rackCalculator.js';
import { getUserPermissions, PRICE_TYPES } from '../helpers/roles.js';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '../helpers/audit.js';
import { calcRackSpans, optimizeRacks } from '../helpers/batteryRackBuilder.js';

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
    const spanObjects = Object.entries(price.spans || {}).map(([length, data]) => ({
      length: Number(length),
      capacity: data.capacity || 1000,
    }));

    if (spanObjects.length === 0) {
      return res.status(400).json({ error: 'No span options available in price data' });
    }

    // Конфігурація стелажа
    const rows = config?.rows || 2;
    const floors = config?.floors || 1;

    // Розрахунок кількості акумуляторів в одному ряду
    const batteriesPerRow = Math.ceil(quantity / (rows * floors));

    // Розрахунок необхідної довжини стелажа
    const batteryLength = batteryDimensions.length;
    const gap = batteryDimensions.gap || 0;
    const requiredLength = (batteriesPerRow * batteryLength) + ((batteriesPerRow - 1) * gap);

    // Генерація всіх можливих комбінацій прольотів
    const spanCombinations = calcRackSpans({
      rackLength: requiredLength,
      accLength: batteryLength,
      accWeight: batteryDimensions.weight,
      gap,
      standardSpans: spanObjects,
    });

    // Оптимізація - вибір TOP-5 варіантів
    const maxSpan = Math.max(...spanObjects.map((s) => s.length));
    const optimizedVariants = optimizeRacks(spanCombinations, requiredLength, maxSpan, 5, price);

    // Розрахунок конфігурації для найкращого варіанту
    const bestVariant = optimizedVariants[0];
    const rackConfig = {
      floors: floors,
      rows: rows,
      beamsPerRow: bestVariant?.beams || 2,
      supports: config?.supports || 'C80',
      verticalSupports: config?.verticalSupports || null,
      spansArray: bestVariant?.combination || [],
    };

    // Розрахунок цін для найкращого варіанту
    const { components: bestComponents, prices: bestPrices, totalCost: bestTotalCost } = calculateRackPricesWithPermissions(rackConfig, price, req.user);

    // Знайти або створити конфігурацію в БД для найкращого варіанту
    const rackConfigId = findOrCreateRackConfiguration(db, rackConfig);

    // Перевірка дозволів на показ компонентів
    const userPermissions = req.user?.permissions || { price_types: [] };
    const showComponents = userPermissions.price_types?.includes('базова');

    // Формування варіантів для відповіді з цінами
    const variantsWithPrices = optimizedVariants.map((v, index) => {
      // Конфігурація для кожного варіанту
      const variantConfig = {
        floors: floors,
        rows: rows,
        beamsPerRow: v.beams,
        supports: config?.supports || 'C80',
        verticalSupports: config?.verticalSupports || null,
        spansArray: v.combination,
      };

      // Розрахунок цін для варіанту
      const variantPrices = calculateRackPricesWithPermissions(variantConfig, price, req.user);

      return {
        span: v.combination[0],
        spansCount: v.combination.length,
        totalLength: v.totalLength,
        combination: v.combination,
        beams: v.beams,
        batteriesPerRow,
        excessLength: Math.round(v.overLength * 100) / 100,
        isBest: index === 0,
        index,
        // Ціни (тільки дозволені)
        prices: variantPrices.prices,
        totalCost: variantPrices.totalCost,
        // Компоненти (тільки якщо є дозвіл на базові ціни)
        components: showComponents ? variantPrices.components : {},
      };
    });

    res.json({
      rackConfigId,
      requiredLength: Math.round(requiredLength),
      batteriesPerRow,
      variants: variantsWithPrices,
      bestMatch: {
        rackConfigId,
        span: bestVariant?.combination?.[0],
        spansCount: bestVariant?.combination?.length,
        totalLength: bestVariant?.totalLength,
        combination: bestVariant?.combination,
        config: rackConfig,
        components: showComponents ? bestComponents : {},
        prices: bestPrices,
        totalCost: bestTotalCost,
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
