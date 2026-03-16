import { Model, Types, PopulateOptions } from 'mongoose';
import { BaseRepository } from '../../database/repositories/base.repository';
import { IUserDocument } from '../../database/models/user.model';
import { FindUserInput, FindUsersInput } from './users.types';

/**
 * Users Repository
 * Відповідає за доступ до даних користувачів
 */
export class UsersRepository extends BaseRepository<IUserDocument> {
  private userModel: Model<IUserDocument>;

  constructor(userModel: Model<IUserDocument>) {
    super(userModel);
    this.userModel = userModel;
  }

  /**
   * Знайти користувача за ID з роллю та дозволами
   */
  async findByIdWithRole(input: FindUserInput): Promise<IUserDocument | null> {
    const query = this.userModel.findById(input.id);

    if (input.includeRole) {
      const populateOptions: PopulateOptions = { path: 'roleId' };
      query.populate(populateOptions);
    }

    if (input.includePermissions) {
      query.populate({
        path: 'roleId',
        populate: { path: 'permissions' },
      });
    }

    return query.exec();
  }

  /**
   * Знайти користувачів з фільтрами та пагінацією
   */
  async findUsers(input: FindUsersInput): Promise<{
    users: IUserDocument[];
    total: number;
  }> {
    const {
      search,
      roleId,
      emailVerified,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = input;

    // Формуємо фільтр
    const filter: any = { deleted: false };

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    if (roleId) {
      filter.roleId = new Types.ObjectId(roleId);
    }

    if (emailVerified !== undefined) {
      filter.emailVerified = emailVerified;
    }

    // Сортування
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    // Отримуємо загальну кількість
    const total = await this.userModel.countDocuments(filter);

    // Отримуємо користувачів з пагінацією
    const users = await this.userModel
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('roleId')
      .exec();

    return { users, total };
  }

  /**
   * Знайти користувача за email
   */
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.userModel.findOne({ email, deleted: false }).exec();
  }

  /**
   * Оновити пароль користувача
   */
  async updatePassword(
    userId: string | Types.ObjectId,
    passwordHash: string,
  ): Promise<IUserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { passwordHash }, { new: true })
      .exec();
  }

  /**
   * Оновити email верифікацію
   */
  async updateEmailVerified(
    userId: string | Types.ObjectId,
    verified: boolean,
  ): Promise<IUserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { emailVerified: verified }, { new: true })
      .exec();
  }

  /**
   * Перевірити чи email вже зайнятий
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const query: any = { email, deleted: false };
    if (excludeUserId) {
      query._id = { $ne: new Types.ObjectId(excludeUserId) };
    }
    const user = await this.userModel.findOne(query);
    return user !== null;
  }

  /**
   * Отримати статистику користувачів
   */
  async getUsersStats(): Promise<{
    total: number;
    verified: number;
    notVerified: number;
  }> {
    const total = await this.userModel.countDocuments({ deleted: false });
    const verified = await this.userModel.countDocuments({
      deleted: false,
      emailVerified: true,
    });
    const notVerified = await this.userModel.countDocuments({
      deleted: false,
      emailVerified: false,
    });

    return { total, verified, notVerified };
  }
}

export default UsersRepository;
