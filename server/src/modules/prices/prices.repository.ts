import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../database/repositories/base.repository';
import { IPriceDocument } from '../../database/models/price.model';
import { IPriceComponentDocument } from '../../database/models/price-component.model';

/**
 * Prices Repository
 * Відповідає за доступ до даних прайс-листів та компонентів
 */
export class PricesRepository extends BaseRepository<IPriceDocument> {
  private priceModel: Model<IPriceDocument>;
  private priceComponentModel: Model<IPriceComponentDocument>;

  constructor(
    priceModel: Model<IPriceDocument>,
    priceComponentModel: Model<IPriceComponentDocument>,
  ) {
    super(priceModel);
    this.priceModel = priceModel;
    this.priceComponentModel = priceComponentModel;
  }

  // ==========================================
  // PRICE METHODS
  // ==========================================

  /**
   * Отримати поточний прайс
   */
  async getCurrentPrice(category?: string): Promise<IPriceDocument | null> {
    const query: any = { deleted: false };
    if (category) {
      query.category = category;
    }
    return this.priceModel.findOne(query).sort({ updatedAt: -1 }).exec();
  }

  /**
   * Отримати історію прайсів
   */
  async getPriceHistory(category?: string, limit: number = 10): Promise<IPriceDocument[]> {
    const query: any = { deleted: false };
    if (category) {
      query.category = category;
    }
    return this.priceModel.find(query).sort({ updatedAt: -1 }).limit(limit).exec();
  }

  /**
   * Створити новий прайс
   */
  async createPrice(data: any, category?: string): Promise<IPriceDocument> {
    const price = new this.priceModel({ data, category });
    return price.save();
  }

  /**
   * Отримати всі категорії прайсів
   */
  async getPriceCategories(): Promise<{ name: string; count: number }[]> {
    const result = await this.priceModel.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return result.map((item: any) => ({
      name: item._id || 'default',
      count: item.count,
    }));
  }

  // ==========================================
  // PRICE COMPONENT METHODS
  // ==========================================

  /**
   * Отримати всі компоненти прайсу
   */
  async findAllComponents(category?: string): Promise<IPriceComponentDocument[]> {
    const query: any = { deleted: false };
    if (category) {
      query.category = category;
    }
    return this.priceComponentModel.find(query).sort({ category: 1, name: 1 }).exec();
  }

  /**
   * Отримати компонент за ID
   */
  async findComponentById(id: string | Types.ObjectId): Promise<IPriceComponentDocument | null> {
    return this.priceComponentModel.findById(id).exec();
  }

  /**
   * Отримати компоненти за категорією
   */
  async findComponentsByCategory(category: string): Promise<IPriceComponentDocument[]> {
    return this.priceComponentModel.find({ category, deleted: false }).sort({ name: 1 }).exec();
  }

  /**
   * Створити компонент прайсу
   */
  async createComponent(
    name: string,
    category: string,
    price: number,
    unit?: string,
    metadata?: any,
  ): Promise<IPriceComponentDocument> {
    const component = new this.priceComponentModel({
      name,
      category,
      price,
      unit,
      metadata,
    });
    return component.save();
  }

  /**
   * Оновити компонент прайсу
   */
  async updateComponent(
    id: string | Types.ObjectId,
    data: Partial<IPriceComponentDocument>,
  ): Promise<IPriceComponentDocument | null> {
    return this.priceComponentModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
  }

  /**
   * Видалити компонент прайсу
   */
  async deleteComponent(id: string | Types.ObjectId): Promise<IPriceComponentDocument | null> {
    return this.priceComponentModel.findByIdAndDelete(id).exec();
  }

  /**
   * Отримати всі категорії компонентів
   */
  async getComponentCategories(): Promise<string[]> {
    const result = await this.priceComponentModel.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: '$category' } },
      { $sort: { _id: 1 } },
    ]);
    return result.map((item: any) => item._id).filter(Boolean);
  }
}

export default PricesRepository;
