import { Types } from 'mongoose';

/**
 * Вхідні дані для пошуку користувача
 */
export interface FindUserInput {
  id: string | Types.ObjectId;
  includeRole?: boolean;
  includePermissions?: boolean;
}

/**
 * Вхідні дані для пошуку користувачів з фільтрами
 */
export interface FindUsersInput {
  search?: string;
  roleId?: string;
  emailVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Вхідні дані для створення користувача
 */
export interface CreateUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
}

/**
 * Вхідні дані для оновлення користувача
 */
export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  emailVerified?: boolean;
}

/**
 * Вхідні дані для зміни пароля
 */
export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * Результат операцій з користувачем
 */
export interface UserResult {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: {
    id: string;
    name: string;
  } | null;
  emailVerified: boolean;
  createdAt: Date;
  deleted?: boolean;
}
