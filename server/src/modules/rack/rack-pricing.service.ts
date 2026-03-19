import { PricesService } from '../prices/prices.service';
import {
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  type RackComponents,
} from '../../../../shared/rackCalculator';

/**
 * Типи цін
 */
export type PriceType = 'базова' | 'без_ізоляторів' | 'нульова';

/**
 * Інформація про ціну
 */
export interface PriceInfo {
  type: PriceType;
  label: string;
  value: number;
}

/**
 * Дозволи для ролей
 */
const ROLE_PRICE_PERMISSIONS: Record<string, PriceType[]> = {
  admin: ['базова', 'без_ізоляторів', 'нульова'],
  manager: ['нульова'],
  user: [],
};

/**
 * Rack Pricing Service
 * Розрахунок цін для стелажів з урахуванням RBAC
 */
export class RackPricingService {
  private pricesService: PricesService;

  constructor(pricesService: PricesService) {
    this.pricesService = pricesService;
  }

  /**
   * Розрахувати ціни для стелажа з урахуванням ролі користувача
   */
  async calculatePricesForRole(components: RackComponents, userRole: string): Promise<PriceInfo[]> {
    // Отримати дозволи для ролі
    const allowedTypes = ROLE_PRICE_PERMISSIONS[userRole] || [];

    // Якщо немає дозволів - повертаємо пустий масив
    if (allowedTypes.length === 0) {
      return [];
    }

    // Отримати поточний прайс
    const currentPrice = await this.pricesService.getCurrentPrice();

    // Розрахувати всі типи цін
    const allPrices = this.calculateAllPrices(components, currentPrice);

    // Фільтруємо за дозволами
    return allPrices.filter((price) => allowedTypes.includes(price.type));
  }

  /**
   * Розрахувати всі типи цін
   */
  private calculateAllPrices(components: RackComponents, priceList: any): PriceInfo[] {
    const prices: PriceInfo[] = [];

    // 1. Базова ціна (сума всіх компонентів)
    const baseTotal = calculateTotalCost(components);
    prices.push({
      type: 'базова',
      label: 'Базова ціна',
      value: baseTotal,
    });

    // 2. Ціна без ізоляторів
    const withoutIsolators = calculateTotalWithoutIsolators(components);
    prices.push({
      type: 'без_ізоляторів',
      label: 'Без ізоляторів',
      value: withoutIsolators,
    });

    // 3. Нульова ціна (базова * 1.44)
    const zeroBase = baseTotal * 1.44;
    prices.push({
      type: 'нульова',
      label: 'Нульова ціна',
      value: zeroBase,
    });

    return prices;
  }

  /**
   * Отримати загальну вартість з урахуванням ролі
   */
  async getTotalCostForRole(components: RackComponents, userRole: string): Promise<number> {
    const prices = await this.calculatePricesForRole(components, userRole);

    // Повертаємо першу доступну ціну або 0
    return prices[0]?.value || 0;
  }
}

export default RackPricingService;
