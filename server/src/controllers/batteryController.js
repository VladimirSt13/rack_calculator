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
 * Форматування результату з урахуванням дозволів користувача
 */
const formatResultWithPermissions = (components, totalCost, totalWithoutIsolators, permissions) => {
  const result = {
    components: {},
    prices: [],
  };

  // Формуємо компоненти з фільтрацією цін
  for (const [type, items] of Object.entries(components)) {
    const itemsArray = Array.isArray(items) ? items : [items];
    result.components[type] = itemsArray.map((item) => ({
      name: item.name,
      amount: item.amount,
      price: permissions.price_types?.includes(PRICE_TYPES.BASE) ? item.price : null,
      total: permissions.price_types?.includes(PRICE_TYPES.BASE) ? item.total : null,
    }));
  }

  // Розрахунок нульової ціни: базова * 1,2 * 1,2 = базова * 1,44
  const zeroPrice = totalCost * 1.44;

  // Додаємо дозволені типи цін (тільки 3 типи)
  if (permissions.price_types?.includes(PRICE_TYPES.BASE)) {
    result.prices.push({
      type: 'базова',
      label: 'Базова ціна',
      value: Math.round(totalCost * 100) / 100,
    });
  }

  if (permissions.price_types?.includes(PRICE_TYPES.NO_ISOLATORS)) {
    result.prices.push({
      type: 'без_ізоляторів',
      label: 'Без ізоляторів',
      value: Math.round(totalWithoutIsolators * 100) / 100,
    });
  }

  if (permissions.price_types?.includes(PRICE_TYPES.ZERO)) {
    result.prices.push({
      type: 'нульова',
      label: 'Нульова ціна',
      value: Math.round(zeroPrice * 100) / 100,
    });
  }

  return result;
};

/**
 * POST /api/battery/calculate
 * Розрахунок стелажа по батареї
 */
export const calculateBatteryRack = async (req, res, next) => {
  try {
    const { batteryDimensions, weight, quantity, config } = req.body;
    const db = await getDb();

    // Отримати актуальний прайс
    const priceRecord = db.prepare(
      'SELECT data FROM prices ORDER BY id DESC LIMIT 1'
    ).get();

    if (!priceRecord) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    const price = JSON.parse(priceRecord.data);

    // Розрахунок компонентів
    const components = calculateRackComponents(config, price);
    const totalCost = calculateTotalCost(components);
    const totalWithoutIsolators = calculateTotalWithoutIsolators(components);

    // Отримати permissions користувача
    const user = req.user;
    const permissions = await getUserPermissions(user);

    // Форматування результату з урахуванням дозволів
    const formattedResult = formatResultWithPermissions(
      components,
      totalCost,
      totalWithoutIsolators,
      permissions
    );

    // Audit log
    if (user) {
      await logAudit({
        userId: user.userId,
        action: AUDIT_ACTIONS.RACK_SET_CREATE,
        entityType: ENTITY_TYPES.CALCULATION,
        newValue: { batteryDimensions, weight, quantity, totalCost },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.json({
      name: generateBatteryRackName({
        floors: config.floors,
        rows: config.rows,
        supportType: config.supports?.includes('C') ? 'step' : 'edge',
        rackWidth: config.spansArray?.[0] || 0,
        rackLength: batteryDimensions?.length || 0,
        spans: config.spansArray || [],
      }),
      ...formattedResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/battery/find-best
 * Підбір найкращого варіанту стелажа по батареї
 */
export const findBestRackForBattery = async (req, res, next) => {
  try {
    const { batteryDimensions, weight, quantity } = req.body;
    const db = await getDb();

    // Валідація
    if (!batteryDimensions || !batteryDimensions.length || !batteryDimensions.width) {
      return res.status(400).json({ error: 'Battery dimensions are required' });
    }

    // Отримати актуальний прайс
    const priceRecord = db.prepare(
      'SELECT data FROM prices ORDER BY id DESC LIMIT 1'
    ).get();

    if (!priceRecord) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    const price = JSON.parse(priceRecord.data);
    const user = req.user;
    const permissions = getUserPermissions(user);

    // Генерація варіантів прольотів
    const spanOptions = Object.keys(price.spans || {}).map(Number).sort((a, b) => a - b);

    // Розрахунок необхідної довжини стелажа
    const batteryLength = batteryDimensions.length;
    const batteryWidth = batteryDimensions.width;
    const batteriesPerRow = Math.max(1, Math.floor(1500 / batteryLength)); // 1500mm - стандартна глибина

    // Генерація варіантів
    const variants = spanOptions.map((span) => {
      const spansNeeded = Math.ceil(batteryLength / span);
      const totalLength = span * spansNeeded;
      const batteriesPerBeam = Math.floor(totalLength / batteryLength);

      // Перевірка навантаження
      const maxLoadPerBeam = 500; // кг
      const totalWeightOnBeam = batteriesPerBeam * weight;
      const isOverloaded = totalWeightOnBeam > maxLoadPerBeam;

      return {
        span,
        spansCount: spansNeeded,
        totalLength,
        batteriesPerBeam,
        totalBatteries: batteriesPerBeam * 2, // 2 ряди
        isOverloaded,
        loadPercent: ((totalWeightOnBeam / maxLoadPerBeam) * 100).toFixed(1),
      };
    });

    // Вибір найкращого варіанту (не перевантажений, мінімальна довжина)
    const safeVariants = variants.filter((v) => !v.isOverloaded);
    const bestMatch = safeVariants.length > 0
      ? safeVariants.reduce((min, v) => (v.totalLength < min.totalLength ? v : min))
      : variants.reduce((min, v) => (v.totalLength < min.totalLength ? v : min));

    // Розрахунок конфігурації для найкращого варіанту
    const bestConfig = {
      floors: 1,
      rows: 2,
      beamsPerRow: 2,
      supports: 'C80',
      spansArray: Array(bestMatch.spansCount).fill(bestMatch.span),
      beams: 2,
    };

    const components = calculateRackComponents(bestConfig, price);
    const totalCost = calculateTotalCost(components);

    res.json({
      variants: variants.map((v) => ({
        ...v,
        isBest: v.span === bestMatch.span,
      })),
      bestMatch: {
        ...bestMatch,
        config: bestConfig,
        components: Object.fromEntries(
          Object.entries(components).map(([type, items]) => {
            const itemsArray = Array.isArray(items) ? items : [items];
            return [
              type,
              itemsArray.map((item) => ({
                ...item,
                price: permissions.price_types?.includes(PRICE_TYPES.RETAIL) ? item.price : null,
                total: permissions.price_types?.includes(PRICE_TYPES.RETAIL) ? item.total : null,
              })),
            ];
          })
        ),
        totalCost: permissions.price_types?.includes(PRICE_TYPES.RETAIL) ? totalCost : null,
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
