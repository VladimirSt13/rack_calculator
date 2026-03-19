import { RackSetsRepository } from '../rack-sets/rack-sets.repository';
import { PricesService } from '../prices/prices.service';
import { PricesRepository } from '../prices/prices.repository';
import { Price } from '../../database/models/price.model';
import { RackSet } from '../../database/models/rack-set.model';
import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateRackName,
  generateComponentsTable,
  type PriceData,
  type RackConfig,
} from '../../../../shared/rackCalculator';
import { RackPricingService } from './rack-pricing.service';

/**
 * Rack Service
 * Бізнес-логіка для розрахунку стелажів
 */
export class RackService {
  private rackSetsRepository: RackSetsRepository;
  private pricesService: PricesService;
  private rackPricingService: RackPricingService;

  constructor() {
    this.rackSetsRepository = new RackSetsRepository(RackSet);
    this.pricesService = new PricesService(new PricesRepository(Price));
    this.rackPricingService = new RackPricingService(this.pricesService);
  }

  /**
   * Розрахунок стелажа
   */
  async calculate(
    config: {
      floors: number;
      rows: number;
      beamsPerRow: number;
      supports?: string;
      verticalSupports?: string;
      spans?: Array<{ item: string; quantity: number }>;
    },
    userRole: string = 'user',
  ) {
    console.log('[RackService] calculate() config:', config);
    console.log('[RackService] userRole:', userRole);

    // Отримати поточний прайс
    const currentPrice = await this.pricesService.getCurrentPrice();

    // Конвертуємо прайс у формат PriceData
    const priceData = this.convertToPriceData(currentPrice);

    // Конвертуємо конфігурацію у формат RackConfig
    const rackConfig: RackConfig = {
      floors: config.floors,
      rows: config.rows,
      beamsPerRow: config.beamsPerRow,
      supports: config.supports,
      verticalSupports: config.verticalSupports,
      spans: config.spans,
    };

    // Розрахунок компонентів за допомогою shared калькулятора
    const components = calculateRackComponents(rackConfig, priceData);
    console.log('[RackService] components:', components);

    // Розрахунок загальної вартості
    const total = calculateTotalCost(components);
    const totalWithoutIsolators = calculateTotalWithoutIsolators(components);

    // Генерація назви стелажа
    const name = generateRackName(rackConfig);

    // Генерація HTML таблиці
    const tableHtml = generateComponentsTable(components, true);

    // Розрахунок цін з урахуванням ролі користувача
    const prices = await this.rackPricingService.calculatePricesForRole(components, userRole);

    return {
      name,
      tableHtml,
      components,
      prices,
      total,
      totalWithoutIsolators,
      zeroBase: total * 1.44,
    };
  }

  /**
   * Конвертація прайсу у формат PriceData
   */
  private convertToPriceData(priceList: any): PriceData {
    console.log(
      '[RackService] convertToPriceData() - priceList.data keys:',
      priceList?.data ? Object.keys(priceList.data) : [],
    );

    // Прайс має структуру { supports, spans, vertical_supports, diagonal_brace, isolator }
    // Це вже готовий PriceData формат!
    const priceData = priceList?.data || {};

    console.log('[RackService] convertToPriceData() - supports:', Object.keys(priceData.supports || {}));
    console.log('[RackService] convertToPriceData() - spans:', Object.keys(priceData.spans || {}));

    return {
      supports: priceData.supports || {},
      spans: priceData.spans || {},
      vertical_supports: priceData.vertical_supports || {},
      diagonal_brace: priceData.diagonal_brace || {},
      isolator: priceData.isolator || {},
    };
  }
}

export default RackService;
