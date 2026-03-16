import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../database/repositories/base.repository';
import { IRackConfigurationDocument } from '../../database/models/rack-configuration.model';

/**
 * RackConfigurations Repository
 * Відповідає за доступ до даних конфігурацій стелажів
 */
export class RackConfigurationsRepository extends BaseRepository<IRackConfigurationDocument> {
  private rackConfigurationModel: Model<IRackConfigurationDocument>;

  constructor(rackConfigurationModel: Model<IRackConfigurationDocument>) {
    super(rackConfigurationModel);
    this.rackConfigurationModel = rackConfigurationModel;
  }

  /**
   * Знайти конфігурацію за ID
   */
  async findConfigurationById(id: string | Types.ObjectId): Promise<IRackConfigurationDocument | null> {
    return this.rackConfigurationModel.findById(id).exec();
  }

  /**
   * Знайти конфігурацію за назвою
   */
  async findConfigurationByName(name: string): Promise<IRackConfigurationDocument | null> {
    return this.rackConfigurationModel.findOne({ name, deleted: false }).exec();
  }

  /**
   * Отримати всі конфігурації
   */
  async findAllConfigurations(type?: string): Promise<IRackConfigurationDocument[]> {
    const query: any = { deleted: false };
    if (type) {
      query.type = type;
    }
    return this.rackConfigurationModel.find(query).sort({ name: 1 }).exec();
  }

  /**
   * Отримати конфігурації за типом
   */
  async findConfigurationsByType(type: string): Promise<IRackConfigurationDocument[]> {
    return this.rackConfigurationModel.find({ type, deleted: false }).sort({ name: 1 }).exec();
  }

  /**
   * Створити конфігурацію стелажа
   */
  async createConfiguration(
    name: string,
    type: string,
    rows: number,
    columns: number,
    levels: number,
    components: any[],
    braceCount?: number,
    description?: string,
    metadata?: any,
  ): Promise<IRackConfigurationDocument> {
    const configuration = new this.rackConfigurationModel({
      name,
      type,
      rows,
      columns,
      levels,
      braceCount,
      components,
      description,
      metadata,
    });
    return configuration.save();
  }

  /**
   * Оновити конфігурацію стелажа
   */
  async updateConfiguration(
    id: string | Types.ObjectId,
    data: Partial<IRackConfigurationDocument>,
  ): Promise<IRackConfigurationDocument | null> {
    return this.rackConfigurationModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
  }

  /**
   * Отримати всі типи конфігурацій
   */
  async getConfigurationTypes(): Promise<string[]> {
    const result = await this.rackConfigurationModel.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: '$type' } },
      { $sort: { _id: 1 } },
    ]);
    return result.map((item: any) => item._id).filter(Boolean);
  }

  /**
   * Перевірити чи існує конфігурація з такою назвою
   */
  async configurationExists(name: string, excludeId?: string): Promise<boolean> {
    const query: any = { name, deleted: false };
    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }
    const config = await this.rackConfigurationModel.findOne(query);
    return config !== null;
  }
}

export default RackConfigurationsRepository;
