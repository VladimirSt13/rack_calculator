import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { UsersRepository } from './users.repository';
import { IUserDocument } from '../../database/models/user.model';
import { CreateUserInput, UpdateUserInput, ChangePasswordInput, UserResult, FindUsersInput } from './users.types';
import { AuthError } from '../auth/auth.types';

/**
 * Users Service
 * Відповідає за бізнес-логіку управління користувачами
 */
export class UsersService {
  private usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  // ==========================================
  // GET USERS
  // ==========================================

  /**
   * Отримати список користувачів з пагінацією
   */
  async getUsers(input: FindUsersInput): Promise<{
    users: UserResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = input;

    const { users, total } = await this.usersRepository.findUsers(input);

    return {
      users: users.map((user) => this.mapToResult(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Отримати користувача за ID
   */
  async getUserById(id: string, includeRole: boolean = true): Promise<UserResult> {
    const user = await this.usersRepository.findByIdWithRole({
      id,
      includeRole,
    });

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    return this.mapToResult(user);
  }

  /**
   * Отримати статистику користувачів
   */
  async getUsersStats(): Promise<{
    total: number;
    verified: number;
    notVerified: number;
  }> {
    return await this.usersRepository.getUsersStats();
  }

  // ==========================================
  // CREATE USER
  // ==========================================

  /**
   * Створити нового користувача
   */
  async createUser(input: CreateUserInput): Promise<UserResult> {
    // Перевірка чи email вже зайнятий
    const isEmailTaken = await this.usersRepository.isEmailTaken(input.email);
    if (isEmailTaken) {
      throw new AuthError('Email already exists', 'USER_EXISTS');
    }

    // Хешування пароля
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Створення користувача
    const user = await this.usersRepository.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      roleId: input.roleId ? new Types.ObjectId(input.roleId) : null,
    });

    return this.mapToResult(user);
  }

  // ==========================================
  // UPDATE USER
  // ==========================================

  /**
   * Оновити користувача
   */
  async updateUser(id: string, input: UpdateUserInput): Promise<UserResult> {
    // Перевірка чи користувач існує
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // Перевірка чи email вже зайнятий іншим користувачем
    if (input.email && input.email !== existingUser.email) {
      const isEmailTaken = await this.usersRepository.isEmailTaken(input.email, id);
      if (isEmailTaken) {
        throw new AuthError('Email already exists', 'USER_EXISTS');
      }
    }

    // Оновлення даних
    const updateData: any = { ...input };
    if (input.roleId) {
      updateData.roleId = new Types.ObjectId(input.roleId);
    }

    const updatedUser = await this.usersRepository.update(id, updateData);

    if (!updatedUser) {
      throw new AuthError('Failed to update user', 'USER_NOT_FOUND');
    }

    return this.mapToResult(updatedUser);
  }

  /**
   * Змінити пароль користувача
   */
  async changePassword(input: ChangePasswordInput): Promise<void> {
    // Знайти користувача з паролем
    const user = await this.usersRepository.findByIdWithRole({
      id: input.userId,
      includeRole: false,
    });

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // Перевірка поточного пароля
    const isPasswordValid = await bcrypt.compare(input.currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthError('Invalid current password', 'INVALID_CREDENTIALS');
    }

    // Хешування нового пароля
    const newPasswordHash = await bcrypt.hash(input.newPassword, 12);

    // Оновлення пароля
    await this.usersRepository.updatePassword(input.userId, newPasswordHash);
  }

  // ==========================================
  // DELETE USER
  // ==========================================

  /**
   * Видалити користувача (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // Soft delete
    await this.usersRepository.softDelete(id);
  }

  /**
   * Відновити користувача
   */
  async restoreUser(id: string): Promise<UserResult> {
    const restoredUser = await this.usersRepository.restore(id);
    if (!restoredUser) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    return this.mapToResult(restoredUser);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Маппінг документу в результат
   */
  private mapToResult(user: IUserDocument): UserResult {
    const roleDoc = user.roleId as any;

    return {
      id: user._id.toHexString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: roleDoc
        ? {
            id: roleDoc._id.toHexString(),
            name: roleDoc.name,
          }
        : null,
      roleName: roleDoc?.name || 'user',
      permissions: roleDoc?.permissions?.map((p: any) => p.name) || [],
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      deleted: user.deleted,
    };
  }
}

export default UsersService;
