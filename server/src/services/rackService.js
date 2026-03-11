import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateRackName,
} from '../../../shared/rackCalculator.js';
import { getUserPermissions, PRICE_TYPES } from '../helpers/roles.js';
import { getCurrentPriceData } from './priceService.js';

/**
 * Сервіс для розрахунку стелажів
 */

/**
 * Форматування результату з урахуванням дозволів користувача
 */
const formatResultWithPermissions = (components, totalCost, totalWithoutIsolators, permissions) => {
  const result = {
    components: {},
    prices: [],
  };

  for (const [type, items] of Object.entries(components)) {
    const itemsArray = Array.isArray(items) ? items : [items];
    result.components[type] = itemsArray.map((item) => ({
      name: item.name,
      amount: item.amount,
      price: permissions.price_types?.includes(PRICE_TYPES.BASE) ? item.price : null,
      total: permissions.price_types?.includes(PRICE_TYPES.BASE) ? item.total : null,
    }));
  }

  const zeroPrice = totalCost * 1.44;

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
 * Розрахунок стелажа
 */
export const calculateRack = async (config, user) => {
  const price = await getCurrentPriceData();

  const components = calculateRackComponents(config, price);
  const totalCost = calculateTotalCost(components);
  const totalWithoutIsolators = calculateTotalWithoutIsolators(components);

  const permissions = await getUserPermissions(user);

  const formattedResult = formatResultWithPermissions(components, totalCost, totalWithoutIsolators, permissions);

  return {
    name: generateRackName(config),
    total: Math.round(totalCost * 100) / 100,
    totalWithoutIsolators: Math.round(totalWithoutIsolators * 100) / 100,
    zeroBase: Math.round((totalCost * 1.44) * 100) / 100,
    ...formattedResult,
  };
};

/**
 * Масовий розрахунок стелажів
 */
export const calculateRackBatch = async (racks, user) => {
  if (!Array.isArray(racks) || racks.length === 0) {
    throw new Error('Racks array is required and cannot be empty');
  }

  const price = await getCurrentPriceData();
  const permissions = getUserPermissions(user);

  return racks.map((config, index) => {
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
};

export default {
  calculateRack,
  calculateRackBatch,
};
