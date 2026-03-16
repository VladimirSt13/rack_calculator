import { Model, Document, FilterQuery, UpdateQuery, Types, PopulateOptions } from 'mongoose';

/**
 * Базовий інтерфейс для всіх сутностей
 */
export interface BaseEntity extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  deleted?: boolean;
  deletedAt?: Date | null;
}

/**
 * Базовий репозиторій з CRUD операціями
 * @template T - Тип сутності що розширює BaseEntity
 */
export class BaseRepository<T extends BaseEntity> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Знайти запис за ID
   */
  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id).exec() as Promise<T | null>;
  }

  /**
   * Знайти всі записи з фільтрацією та опціями
   */
  async findAll(
    filter?: FilterQuery<T>,
    options?: {
      populate?: PopulateOptions | PopulateOptions[];
      sort?: Record<string, 1 | -1>;
      limit?: number;
      offset?: number;
    },
  ): Promise<T[]> {
    const query = this.model.find(filter || {});

    if (options?.populate) {
      query.populate(options.populate);
    }
    if (options?.sort) {
      query.sort(options.sort);
    }
    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.offset) {
      query.skip(options.offset);
    }

    return query.exec() as Promise<T[]>;
  }

  /**
   * Створити новий запис
   */
  async create(data: Partial<T>): Promise<T> {
    const entity = new this.model(data);
    return entity.save() as Promise<T>;
  }

  /**
   * Оновити запис за ID
   */
  async update(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec() as Promise<T | null>;
  }

  /**
   * Видалити запис за ID (hard delete)
   */
  async delete(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec() as Promise<T | null>;
  }

  /**
   * М'яке видалення (soft delete)
   */
  async softDelete(id: string | Types.ObjectId): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() } as unknown as UpdateQuery<T>, { new: true })
      .exec() as Promise<T | null>;
  }

  /**
   * Відновити видалений запис
   */
  async restore(id: string | Types.ObjectId): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, { deleted: false, deletedAt: null } as unknown as UpdateQuery<T>, { new: true })
      .exec() as Promise<T | null>;
  }

  /**
   * Знайти одну запис за умовами
   */
  async findOne(
    filter: FilterQuery<T>,
    options?: {
      populate?: PopulateOptions | PopulateOptions[];
      select?: string;
    },
  ): Promise<T | null> {
    const query = this.model.findOne(filter);

    if (options?.populate) {
      query.populate(options.populate);
    }
    if (options?.select) {
      query.select(options.select);
    }

    return query.exec() as Promise<T | null>;
  }

  /**
   * Порахувати кількість записів
   */
  async count(filter?: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  /**
   * Перевірити чи існує запис
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.exists(filter);
    return doc !== null;
  }
}
