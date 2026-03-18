import { PricesRepository } from './prices.repository';
import {
  CreatePriceInput,
  UpdatePriceInput,
  CreatePriceComponentInput,
  UpdatePriceComponentInput,
  PriceResult,
  PriceComponentResult,
} from './prices.types';
import { AuthError } from '../auth/auth.types';
import { parsePriceExcel, type ParsedPriceData } from '../../common/utils/priceExcelParser';

/**
 * Prices Service
 * Відповідає за бізнес-логіку управління прайс-листами
 */
export class PricesService {
  private pricesRepository: PricesRepository;

  constructor(pricesRepository: PricesRepository) {
    this.pricesRepository = pricesRepository;
  }

  // ==========================================
  // PRICE METHODS
  // ==========================================

  /**
   * Отримати поточний прайс
   */
  async getCurrentPrice(category?: string): Promise<PriceResult> {
    const price = await this.pricesRepository.getCurrentPrice(category);

    if (!price) {
      throw new AuthError('Price not found', 'PRICE_NOT_FOUND');
    }

    return this.mapPriceToResult(price);
  }

  /**
   * Отримати історію прайсів
   */
  async getPriceHistory(category?: string, limit: number = 10): Promise<PriceResult[]> {
    const prices = await this.pricesRepository.getPriceHistory(category, limit);
    return prices.map((price) => this.mapPriceToResult(price));
  }

  /**
   * Створити новий прайс
   */
  async createPrice(input: CreatePriceInput): Promise<PriceResult> {
    const price = await this.pricesRepository.createPrice(input.data, input.category);
    return this.mapPriceToResult(price);
  }

  /**
   * Оновити прайс
   */
  async updatePrice(id: string, input: UpdatePriceInput): Promise<PriceResult> {
    const price = await this.pricesRepository.findById(id);

    if (!price) {
      throw new AuthError('Price not found', 'PRICE_NOT_FOUND');
    }

    const updateData: any = {};
    if (input.data) updateData.data = input.data;
    if (input.category) updateData.category = input.category;

    const updatedPrice = await this.pricesRepository.update(id, updateData);

    if (!updatedPrice) {
      throw new AuthError('Failed to update price', 'PRICE_NOT_FOUND');
    }

    return this.mapPriceToResult(updatedPrice);
  }

  /**
   * Отримати категорії прайсів
   */
  async getPriceCategories(): Promise<{ name: string; count: number }[]> {
    return await this.pricesRepository.getPriceCategories();
  }

  // ==========================================
  // PRICE COMPONENT METHODS
  // ==========================================

  /**
   * Отримати всі компоненти прайсу
   */
  async getPriceComponents(category?: string): Promise<PriceComponentResult[]> {
    const components = await this.pricesRepository.findAllComponents(category);
    return components.map((component) => this.mapComponentToResult(component));
  }

  /**
   * Отримати компонент за ID
   */
  async getPriceComponentById(id: string): Promise<PriceComponentResult> {
    const component = await this.pricesRepository.findComponentById(id);

    if (!component) {
      throw new AuthError('Price component not found', 'PRICE_COMPONENT_NOT_FOUND');
    }

    return this.mapComponentToResult(component);
  }

  /**
   * Створити компонент прайсу
   */
  async createPriceComponent(input: CreatePriceComponentInput): Promise<PriceComponentResult> {
    // Перевірка чи компонент вже існує
    const existingComponents = await this.pricesRepository.findComponentsByCategory(input.category);
    const exists = existingComponents.some((c) => c.name.toLowerCase() === input.name.toLowerCase());

    if (exists) {
      throw new AuthError('Component already exists in this category', 'PRICE_COMPONENT_EXISTS');
    }

    const component = await this.pricesRepository.createComponent(
      input.name,
      input.category,
      input.price,
      input.unit,
      input.metadata,
    );

    return this.mapComponentToResult(component);
  }

  /**
   * Оновити компонент прайсу
   */
  async updatePriceComponent(id: string, input: UpdatePriceComponentInput): Promise<PriceComponentResult> {
    const component = await this.pricesRepository.findComponentById(id);

    if (!component) {
      throw new AuthError('Price component not found', 'PRICE_COMPONENT_NOT_FOUND');
    }

    const updatedComponent = await this.pricesRepository.updateComponent(id, input);

    if (!updatedComponent) {
      throw new AuthError('Failed to update component', 'PRICE_COMPONENT_NOT_FOUND');
    }

    return this.mapComponentToResult(updatedComponent);
  }

  /**
   * Видалити компонент прайсу
   */
  async deletePriceComponent(id: string): Promise<void> {
    const component = await this.pricesRepository.findComponentById(id);

    if (!component) {
      throw new AuthError('Price component not found', 'PRICE_COMPONENT_NOT_FOUND');
    }

    await this.pricesRepository.deleteComponent(id);
  }

  /**
   * Отримати категорії компонентів
   */
  async getComponentCategories(): Promise<string[]> {
    return await this.pricesRepository.getComponentCategories();
  }

  /**
   * Отримати компоненти стелажів з поточного прайсу
   * Конвертує структуру прайсу в формат для клієнта
   */
  async getRackComponents(): Promise<{
    components: {
      supports: Array<{ code: string; name: string }>;
      spans: Array<{ code: string; name: string }>;
      verticalSupports: Array<{ code: string; name: string }>;
    };
    updatedAt: string;
  }> {
    // Спочатку пробуємо отримати прайс категорії 'rack'
    let price = await this.pricesRepository.getCurrentPrice('rack');

    // Якщо не знайдено, пробуємо отримати прайс без категорії (default)
    if (!price) {
      price = await this.pricesRepository.getCurrentPrice();
    }

    if (!price) {
      throw new Error('Price not found');
    }

    const priceData = price.data;

    // Трансформація об'єктів в масиви
    const supports = Object.entries(priceData.supports || {}).map(([code, item]: [string, any]) => ({
      code: item.code || code,
      name: item.name || code,
    }));

    const spans = Object.entries(priceData.spans || {}).map(([code, item]: [string, any]) => ({
      code: item.code || code,
      name: item.name || code,
    }));

    const verticalSupports = Object.entries(priceData.vertical_supports || {}).map(([code, item]: [string, any]) => ({
      code: item.code || code,
      name: item.name || code,
    }));

    return {
      components: {
        supports,
        spans,
        verticalSupports,
      },
      updatedAt: price.updatedAt.toISOString(),
    };
  }

  // ==========================================
  // PRICE UPLOAD/EXPORT METHODS
  // ==========================================

  /**
   * Розпарсити Excel файл з прайсом
   */
  async parseExcelFile(buffer: Buffer): Promise<ParsedPriceData> {
    return await parsePriceExcel(buffer);
  }

  /**
   * Завантажити прайс з Excel файлу
   */
  async uploadPriceFromExcel(buffer: Buffer): Promise<PriceResult> {
    const parsedData = await parsePriceExcel(buffer);

    // Перевірка на помилки парсингу
    if (parsedData.errors.length > 0) {
      throw new Error('Parsing errors: ' + JSON.stringify(parsedData.errors));
    }

    // Перевірка чи є дані
    const totalItems =
      Object.keys(parsedData.supports || {}).length +
      Object.keys(parsedData.spans || {}).length +
      Object.keys(parsedData.vertical_supports || {}).length +
      Object.keys(parsedData.diagonal_brace || {}).length +
      Object.keys(parsedData.isolator || {}).length;

    if (totalItems === 0) {
      throw new Error('No valid data found in file');
    }

    // Збереження прайсу
    const price = await this.pricesRepository.createPrice(parsedData, 'rack');
    return this.mapPriceToResult(price);
  }

  /**
   * Відновити версію прайсу
   */
  async restorePriceVersion(id: string): Promise<PriceResult> {
    const restored = await this.pricesRepository.restorePriceVersionById(id);
    return this.mapPriceToResult(restored);
  }

  /**
   * Отримати версію прайсу за ID
   */
  async getPriceVersion(id: string): Promise<PriceResult> {
    const version = await this.pricesRepository.getPriceVersionById(id);

    if (!version) {
      throw new Error('Version not found');
    }

    return this.mapPriceToResult(version);
  }

  /**
   * Оновити поточний прайс
   */
  async updateCurrentPrice(data: any, category?: string): Promise<PriceResult> {
    const updated = await this.pricesRepository.updateCurrentPrice(data, category);
    return this.mapPriceToResult(updated);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Маппінг документу прайсу в результат
   */
  private mapPriceToResult(price: any): PriceResult {
    return {
      id: price._id?.toHexString() || price.id || price._id,
      data: price.data,
      category: price.category,
      updatedAt: price.updatedAt,
    };
  }

  /**
   * Маппінг документу компонента в результат
   */
  private mapComponentToResult(component: any): PriceComponentResult {
    return {
      id: component._id.toHexString(),
      name: component.name,
      category: component.category,
      price: component.price,
      unit: component.unit,
      metadata: component.metadata,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
    };
  }
}

export default PricesService;
