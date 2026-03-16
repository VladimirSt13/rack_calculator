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

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Маппінг документу прайсу в результат
   */
  private mapPriceToResult(price: any): PriceResult {
    return {
      id: price._id.toHexString(),
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
