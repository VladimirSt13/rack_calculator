import { Types } from 'mongoose';

/**
 * Вхідні дані для пошуку ролі
 */
export interface FindRoleInput {
  id: string | Types.ObjectId;
  includePermissions?: boolean;
}

/**
 * Вхідні дані для створення ролі
 */
export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds?: string[];
}

/**
 * Вхідні дані для оновлення ролі
 */
export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

/**
 * Вхідні дані для створення дозволу
 */
export interface CreatePermissionInput {
  name: string;
  description?: string;
  resource: string;
  action: string;
}

/**
 * Результат операцій з роллю
 */
export interface RoleResult {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionResult[];
  createdAt: Date;
  deleted?: boolean;
}

/**
 * Результат операцій з дозволом
 */
export interface PermissionResult {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}
