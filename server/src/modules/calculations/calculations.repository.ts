import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../database/repositories/base.repository';
import { ICalculationDocument } from '../../database/models/calculation.model';
import { GetCalculationsInput } from './calculations.types';

/**
 * Calculations Repository
 * Відповідає за доступ до даних розрахунків
 */
export class CalculationsRepository extends BaseRepository<ICalculationDocument> {
  private calculationModel: Model<ICalculationDocument>;

  constructor(calculationModel: Model<ICalculationDocument>) {
    super(calculationModel);
    this.calculationModel = calculationModel;
  }

  /**
   * Знайти розрахунок за ID з користувачем
   */
  async findCalculationById(id: string | Types.ObjectId): Promise<ICalculationDocument | null> {
    return this.calculationModel.findById(id).populate('userId', 'email').exec();
  }

  /**
   * Отримати розрахунки користувача з пагінацією
   */
  async findCalculations(input: GetCalculationsInput): Promise<{
    calculations: ICalculationDocument[];
    total: number;
  }> {
    const { userId, type, page = 1, limit = 20 } = input;

    const query: any = { userId, deleted: false };
    if (type) {
      query.type = type;
    }

    const total = await this.calculationModel.countDocuments(query);

    const calculations = await this.calculationModel
      .find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { calculations, total };
  }

  /**
   * Створити розрахунок
   */
  async createCalculation(
    userId: string | Types.ObjectId,
    name: string,
    type: 'rack' | 'battery',
    data: any,
    description?: string,
  ): Promise<ICalculationDocument> {
    const calculation = new this.calculationModel({
      userId,
      name,
      type,
      data,
      description,
    });
    return calculation.save();
  }

  /**
   * Отримати всі розрахунки користувача
   */
  async findUserCalculations(userId: string | Types.ObjectId): Promise<ICalculationDocument[]> {
    return this.calculationModel
      .find({ userId, deleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Отримати розрахунки за типом
   */
  async findCalculationsByType(
    userId: string | Types.ObjectId,
    type: 'rack' | 'battery',
  ): Promise<ICalculationDocument[]> {
    return this.calculationModel.find({ userId, type, deleted: false }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Видалити старі розрахунки користувача
   */
  async cleanupOldCalculations(userId: string | Types.ObjectId, limit: number = 100): Promise<number> {
    const oldestCalculations = await this.calculationModel
      .find({ userId, deleted: false })
      .sort({ createdAt: 1 })
      .limit(limit)
      .select('_id');

    if (oldestCalculations.length === 0) return 0;

    const ids = oldestCalculations.map((c) => c._id);
    const result = await this.calculationModel.deleteMany({ _id: { $in: ids } });
    return result.deletedCount;
  }
}

export default CalculationsRepository;
