/**
 * Порядок сортування
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Вхідні дані для пагінації
 */
export interface PaginationInput {
  page: number;
  limit: number;
}

/**
 * Вхідні дані для сортування
 */
export interface SortInput {
  sortBy: string;
  sortOrder: SortOrder;
}

/**
 * Вхідні дані для запиту з пагінацією та сортуванням
 */
export interface QueryInput extends PaginationInput, SortInput {
  [key: string]: any;
}

/**
 * Користувацькі дані з токеном
 */
export interface JwtPayload {
  userId: string;
  email: string;
  roleId?: string;
  permissions?: string[];
}

/**
 * Пара токенів
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
