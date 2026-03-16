import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../database/repositories/base.repository';
import { IRackSetDocument } from '../../database/models/rack-set.model';
import { IRackSetRevisionDocument } from '../../database/models/rack-set-revision.model';
import { GetRackSetsInput } from './rack-sets.types';

/**
 * RackSets Repository
 * Відповідає за доступ до даних комплектів стелажів та ревізій
 */
export class RackSetsRepository extends BaseRepository<IRackSetDocument> {
  private rackSetModel: Model<IRackSetDocument>;
  private rackSetRevisionModel: Model<IRackSetRevisionDocument>;

  constructor(rackSetModel: Model<IRackSetDocument>, rackSetRevisionModel: Model<IRackSetRevisionDocument>) {
    super(rackSetModel);
    this.rackSetModel = rackSetModel;
    this.rackSetRevisionModel = rackSetRevisionModel;
  }

  // ==========================================
  // RACKSET METHODS
  // ==========================================

  /**
   * Знайти комплект за ID з користувачем
   */
  async findRackSetById(id: string | Types.ObjectId): Promise<IRackSetDocument | null> {
    return this.rackSetModel.findById(id).populate('userId', 'email').exec();
  }

  /**
   * Отримати комплекти користувача з пагінацією
   */
  async findRackSets(input: GetRackSetsInput): Promise<{
    rackSets: IRackSetDocument[];
    total: number;
  }> {
    const { userId, page = 1, limit = 20, includeDeleted = false } = input;

    const query: any = { deleted: false };
    if (!includeDeleted) {
      query.deleted = false;
    }
    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const total = await this.rackSetModel.countDocuments(query);

    const rackSets = await this.rackSetModel
      .find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { rackSets, total };
  }

  /**
   * Створити комплект стелажів
   */
  async createRackSet(userId: string | Types.ObjectId, name: string, description?: string): Promise<IRackSetDocument> {
    const rackSet = new this.rackSetModel({
      userId,
      name,
      description,
      currentRevision: 1,
    });
    return rackSet.save();
  }

  /**
   * Оновити комплект стелажів
   */
  async updateRackSet(id: string | Types.ObjectId, data: Partial<IRackSetDocument>): Promise<IRackSetDocument | null> {
    return this.rackSetModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  /**
   * Збільшити ревізію комплекту
   */
  async incrementRevision(id: string | Types.ObjectId): Promise<IRackSetDocument | null> {
    return this.rackSetModel.findByIdAndUpdate(id, { $inc: { currentRevision: 1 } }, { new: true }).exec();
  }

  /**
   * Отримати всі комплекти користувача
   */
  async findUserRackSets(userId: string | Types.ObjectId): Promise<IRackSetDocument[]> {
    return this.rackSetModel.find({ userId, deleted: false }).sort({ createdAt: -1 }).exec();
  }

  // ==========================================
  // RACKSET REVISION METHODS
  // ==========================================

  /**
   * Створити ревізію комплекту
   */
  async createRevision(
    rackSetId: string | Types.ObjectId,
    revisionNumber: number,
    racks: any[],
    createdBy: string | Types.ObjectId,
  ): Promise<IRackSetRevisionDocument> {
    const revision = new this.rackSetRevisionModel({
      rackSetId,
      revisionNumber,
      racks,
      createdBy,
    });
    return revision.save();
  }

  /**
   * Отримати ревізії комплекту
   */
  async getRevisions(rackSetId: string | Types.ObjectId): Promise<IRackSetRevisionDocument[]> {
    return this.rackSetRevisionModel
      .find({ rackSetId })
      .sort({ revisionNumber: -1 })
      .populate('createdBy', 'email')
      .exec();
  }

  /**
   * Отримати останню ревізію
   */
  async getLatestRevision(rackSetId: string | Types.ObjectId): Promise<IRackSetRevisionDocument | null> {
    return this.rackSetRevisionModel
      .findOne({ rackSetId })
      .sort({ revisionNumber: -1 })
      .populate('createdBy', 'email')
      .exec();
  }

  /**
   * Отримати ревізію за номером
   */
  async getRevisionByNumber(
    rackSetId: string | Types.ObjectId,
    revisionNumber: number,
  ): Promise<IRackSetRevisionDocument | null> {
    return this.rackSetRevisionModel.findOne({ rackSetId, revisionNumber }).populate('createdBy', 'email').exec();
  }

  /**
   * Видалити ревізію
   */
  async deleteRevision(id: string | Types.ObjectId): Promise<IRackSetRevisionDocument | null> {
    return this.rackSetRevisionModel.findByIdAndDelete(id).exec();
  }
}

export default RackSetsRepository;
