import { getDb } from '../db/index.js';
import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateRackName,
} from '../../../shared/rackCalculator.js';
import { getUserPermissions, hasPricePermission, PRICE_TYPES } from '../helpers/roles.js';
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
 * POST /api/rack/calculate
 * Розрахунок стелажа
 */
export const calculateRack = async (req, res, next) => {
  try {
    const config = req.body;
    const db = await getDb();

    // Отримати актуальний прайс
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();

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
    const formattedResult = formatResultWithPermissions(components, totalCost, totalWithoutIsolators, permissions);

    // Audit log
    if (user) {
      await logAudit({
        userId: user.userId,
        action: AUDIT_ACTIONS.RACK_SET_CREATE,
        entityType: ENTITY_TYPES.CALCULATION,
        newValue: { config, totalCost },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    console.log({
      name: generateRackName(config),
      ...formattedResult,
    });

    res.json({
      name: generateRackName(config),
      ...formattedResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rack/calculate-batch
 * Масовий розрахунок стелажів
 */
export const calculateRackBatch = async (req, res, next) => {
  try {
    const { racks } = req.body;
    const db = await getDb();

    if (!Array.isArray(racks) || racks.length === 0) {
      return res.status(400).json({ error: 'Racks array is required' });
    }

    // Отримати актуальний прайс
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();

    if (!priceRecord) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    const price = JSON.parse(priceRecord.data);
    const user = req.user;
    const permissions = getUserPermissions(user);

    const results = racks.map((config, index) => {
      const components = calculateRackComponents(config, price);
      const totalCost = calculateTotalCost(components);
      const totalWithoutIsolators = calculateTotalWithoutIsolators(components);

      return {
        index,
        name: generateRackName(config),
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
          }),
        ),
        totalCost: permissions.price_types?.includes(PRICE_TYPES.RETAIL) ? totalCost : null,
        totalWithoutIsolators: permissions.price_types?.includes(PRICE_TYPES.NO_ISOLATORS)
          ? totalWithoutIsolators
          : null,
        totalZero: permissions.price_types?.includes(PRICE_TYPES.ZERO) ? 0 : null,
      };
    });

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

export default {
  calculateRack,
  calculateRackBatch,
};
