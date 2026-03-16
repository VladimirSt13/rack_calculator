import { Model, Types, PopulateOptions } from 'mongoose';
import { BaseRepository } from '../../database/repositories/base.repository';
import { IUserDocument } from '../../database/models/user.model';
import { IRefreshTokenDocument } from '../../database/models/refresh-token.model';
import { IEmailVerificationDocument } from '../../database/models/email-verification.model';
import { IPasswordResetDocument } from '../../database/models/password-reset.model';
import {
  FindUserByEmailInput,
  CreateUserInput,
  CreateRefreshTokenInput,
  CreateEmailVerificationInput,
  CreatePasswordResetInput,
} from './auth.types';

/**
 * Auth Repository
 * Відповідає за доступ до даних для авторизації
 */
export class AuthRepository extends BaseRepository<IUserDocument> {
  private userModel: Model<IUserDocument>;
  private refreshTokenModel: Model<IRefreshTokenDocument>;
  private emailVerificationModel: Model<IEmailVerificationDocument>;
  private passwordResetModel: Model<IPasswordResetDocument>;

  constructor(
    userModel: Model<IUserDocument>,
    refreshTokenModel: Model<IRefreshTokenDocument>,
    emailVerificationModel: Model<IEmailVerificationDocument>,
    passwordResetModel: Model<IPasswordResetDocument>,
  ) {
    super(userModel);
    this.userModel = userModel;
    this.refreshTokenModel = refreshTokenModel;
    this.emailVerificationModel = emailVerificationModel;
    this.passwordResetModel = passwordResetModel;
  }

  // ==========================================
  // USER METHODS
  // ==========================================

  /**
   * Знайти користувача за email
   */
  async findByEmail(input: FindUserByEmailInput): Promise<IUserDocument | null> {
    const query = this.userModel.findOne({ email: input.email, deleted: false });

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

    if (input.includePassword) {
      query.select('+passwordHash +verificationToken');
    }

    return query.exec();
  }

  /**
   * Знайти користувача за ID (перевизначення з правильним типом)
   */
  async findById(id: string | Types.ObjectId): Promise<IUserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Створити нового користувача
   */
  async createUser(input: CreateUserInput): Promise<IUserDocument> {
    const user = new this.userModel({
      email: input.email,
      passwordHash: input.passwordHash,
      roleId: input.roleId,
      firstName: input.firstName,
      lastName: input.lastName,
    });
    return user.save() as Promise<IUserDocument>;
  }

  /**
   * Оновити користувача
   */
  async update(id: string | Types.ObjectId, data: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  /**
   * Оновити email верифікацію
   */
  async markEmailAsVerified(id: string | Types.ObjectId): Promise<IUserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, {
        emailVerified: true,
        verificationToken: null,
      })
      .exec();
  }

  // ==========================================
  // REFRESH TOKEN METHODS
  // ==========================================

  /**
   * Створити refresh token
   */
  async createRefreshToken(input: CreateRefreshTokenInput): Promise<IRefreshTokenDocument> {
    const refreshToken = new this.refreshTokenModel({
      userId: input.userId,
      token: input.token,
      expiresAt: input.expiresAt,
    });
    return refreshToken.save();
  }

  /**
   * Знайти refresh token
   */
  async findRefreshToken(token: string): Promise<IRefreshTokenDocument | null> {
    return this.refreshTokenModel.findOne({ token, revoked: false }).exec();
  }

  /**
   * Видалити refresh token
   */
  async deleteRefreshToken(token: string): Promise<number> {
    const result = await this.refreshTokenModel.deleteMany({ token });
    return result.deletedCount;
  }

  /**
   * Відкликати refresh token
   */
  async revokeRefreshToken(token: string): Promise<IRefreshTokenDocument | null> {
    return this.refreshTokenModel
      .findOneAndUpdate({ token }, { revoked: true, revokedAt: new Date() }, { new: true })
      .exec();
  }

  /**
   * Видалити всі токени користувача
   */
  async deleteUserTokens(userId: string | Types.ObjectId): Promise<number> {
    const result = await this.refreshTokenModel.deleteMany({ userId });
    return result.deletedCount;
  }

  // ==========================================
  // EMAIL VERIFICATION METHODS
  // ==========================================

  /**
   * Створити запис підтвердження email
   */
  async createEmailVerification(input: CreateEmailVerificationInput): Promise<IEmailVerificationDocument> {
    const verification = new this.emailVerificationModel({
      userId: input.userId,
      email: input.email,
      token: input.token,
      expiresAt: input.expiresAt,
    });
    return verification.save();
  }

  /**
   * Знайти запис підтвердження email за токеном
   */
  async findEmailVerification(token: string): Promise<IEmailVerificationDocument | null> {
    return this.emailVerificationModel.findOne({ token, verified: false }).exec();
  }

  /**
   * Видалити записи підтвердження email користувача
   */
  async deleteUserEmailVerifications(userId: string | Types.ObjectId): Promise<number> {
    const result = await this.emailVerificationModel.deleteMany({ userId });
    return result.deletedCount;
  }

  // ==========================================
  // PASSWORD RESET METHODS
  // ==========================================

  /**
   * Створити запис скидання пароля
   */
  async createPasswordReset(input: CreatePasswordResetInput): Promise<IPasswordResetDocument> {
    const reset = new this.passwordResetModel({
      userId: input.userId,
      email: input.email,
      token: input.token,
      expiresAt: input.expiresAt,
    });
    return reset.save();
  }

  /**
   * Знайти запис скидання пароля за токеном
   */
  async findPasswordReset(token: string): Promise<IPasswordResetDocument | null> {
    return this.passwordResetModel.findOne({ token, used: false }).exec();
  }

  /**
   * Позначити токен як використаний
   */
  async markPasswordResetAsUsed(token: string): Promise<IPasswordResetDocument | null> {
    return this.passwordResetModel
      .findOneAndUpdate({ token }, { used: true, usedAt: new Date() }, { new: true })
      .exec();
  }

  /**
   * Видалити записи скидання пароля користувача
   */
  async deleteUserPasswordResets(userId: string | Types.ObjectId): Promise<number> {
    const result = await this.passwordResetModel.deleteMany({ userId });
    return result.deletedCount;
  }
}

export default AuthRepository;
