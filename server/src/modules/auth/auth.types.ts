import { Types } from 'mongoose';

// ==========================================
// REPOSITORY LAYER INPUT TYPES
// ==========================================

/**
 * Вхідні дані для пошуку користувача за email
 */
export interface FindUserByEmailInput {
  email: string;
  includeRole?: boolean;
  includePermissions?: boolean;
  includePassword?: boolean;
}

/**
 * Вхідні дані для створення користувача
 */
export interface CreateUserInput {
  email: string;
  passwordHash: string;
  roleId?: string | Types.ObjectId;
  firstName?: string;
  lastName?: string;
}

/**
 * Вхідні дані для створення refresh токена
 */
export interface CreateRefreshTokenInput {
  userId: string | Types.ObjectId;
  token: string;
  expiresAt: Date;
}

/**
 * Вхідні дані для створення запису підтвердження email
 */
export interface CreateEmailVerificationInput {
  userId: string | Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
}

/**
 * Вхідні дані для створення запису скидання пароля
 */
export interface CreatePasswordResetInput {
  userId: string | Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
}

// ==========================================
// SERVICE LAYER INPUT/OUTPUT TYPES
// ==========================================

/**
 * Вхідні дані для логіну
 */
export interface LoginServiceInput {
  email: string;
  password: string;
}

/**
 * Вхідні дані для реєстрації
 */
export interface RegisterServiceInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Вхідні дані для оновлення токену
 */
export interface RefreshTokenServiceInput {
  refreshToken: string;
}

/**
 * Вхідні дані для відновлення пароля
 */
export interface ForgotPasswordServiceInput {
  email: string;
}

/**
 * Вхідні дані для скидання пароля
 */
export interface ResetPasswordServiceInput {
  token: string;
  password: string;
}

/**
 * Вхідні дані для підтвердження email
 */
export interface VerifyEmailServiceInput {
  token: string;
}

/**
 * Пара токенів (access + refresh)
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Результат авторизації
 */
export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    permissions: string[];
    emailVerified: boolean;
    createdAt?: Date;
  };
  tokens: TokenPair;
}

// ==========================================
// ERROR TYPES
// ==========================================

/**
 * Типи помилок авторизації
 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'USER_EXISTS'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'EMAIL_NOT_VERIFIED'
  | 'PASSWORD_WEAK'
  | 'ROLE_NOT_FOUND'
  | 'ROLE_EXISTS'
  | 'ROLE_DELETE_FORBIDDEN'
  | 'PERMISSION_NOT_FOUND'
  | 'PERMISSION_EXISTS'
  | 'PRICE_NOT_FOUND'
  | 'PRICE_COMPONENT_NOT_FOUND'
  | 'PRICE_COMPONENT_EXISTS'
  | 'CONFIGURATION_NOT_FOUND'
  | 'CONFIGURATION_EXISTS'
  | 'RACKSET_NOT_FOUND'
  | 'RACKSET_EXISTS'
  | 'FORBIDDEN';

/**
 * Помилка авторизації
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ==========================================
// JWT PAYLOAD
// ==========================================

/**
 * JWT Payload для токенів
 */
export interface AuthJwtPayload {
  userId: string;
  email: string;
  roleId?: string;
  permissions?: string[];
}
