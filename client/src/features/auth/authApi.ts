import api from '@/lib/axios';
import { User } from './types/auth.types';

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  message?: string;
}

/**
 * Преобразует ответ сервера в формат User
 */
const normalizeUser = (serverUser: any): User => {
  return {
    id: String(serverUser.id),
    email: serverUser.email,
    role: serverUser.roleName?.toLowerCase() || serverUser.role?.toLowerCase() || 'user',
    roleName: serverUser.roleName?.toLowerCase() || serverUser.role?.toLowerCase() || 'user',
    permissions: serverUser.permissions || [],
    emailVerified: serverUser.isVerified || serverUser.emailVerified || false,
    firstName: serverUser.firstName,
    lastName: serverUser.lastName,
    createdAt: serverUser.createdAt,
  };
};

export const authApi = {
  /**
   * Реєстрація нового користувача
   * POST /api/auth/register
   */
  register: async (email: string, password: string, nickname?: string): Promise<RegisterResponse> => {
    const { data } = await api.post('/auth/register', { email, password, nickname });
    const responseData = data.data || data;
    return {
      user: normalizeUser(responseData.user),
      tokens: responseData.tokens,
      message: responseData.message,
    };
  },

  /**
   * Вхід користувача (створення сесії)
   * POST /api/auth/login
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    const responseData = data.data || data;
    return {
      user: normalizeUser(responseData.user),
      tokens: responseData.tokens,
    };
  },

  /**
   * Вихід користувача (видалення сесії)
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  /**
   * Вихід з усіх пристроїв
   * POST /api/auth/logout-all
   */
  logoutAll: async (): Promise<void> => {
    await api.post('/auth/logout-all');
  },

  /**
   * Отримати поточного користувача
   * GET /api/users/me
   */
  me: async () => {
    const { data } = await api.get('/users/me');
    return data.data;
  },

  /**
   * Підтвердження email
   * POST /api/auth/verify-email
   */
  verifyEmail: async (token: string): Promise<void> => {
    const { data } = await api.post('/auth/verify-email', { token });
    return data.data;
  },

  /**
   * Повторна відправка підтвердження email
   * @deprecated Сервер не підтримує цей endpoint
   */
  resendVerification: async (email: string): Promise<void> => {
    console.warn('resendVerification is not implemented on server');
    throw new Error('resendVerification is not implemented on server');
  },

  /**
   * Запит на скидання пароля
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<void> => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data.data;
  },

  /**
   * Скидання пароля з токеном
   * POST /api/auth/reset-password
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const { data } = await api.post('/auth/reset-password', { token, password: newPassword });
    return data.data;
  },

  /**
   * Зміна пароля (для авторизованого)
   * POST /api/users/:id/change-password
   */
  changePassword: async (userId: number, currentPassword: string, newPassword: string): Promise<void> => {
    const { data } = await api.post(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
    return data.data;
  },

  /**
   * Оновлення JWT токена
   * POST /api/auth/refresh
   *
   * @param refreshToken - Refresh токен
   * @returns Нові accessToken та refreshToken
   */
  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    // Сервер повертає { success: true, data: { user, tokens } }
    const responseData = data.data || data;
    return {
      accessToken: responseData.tokens?.accessToken || responseData.accessToken,
      refreshToken: responseData.tokens?.refreshToken || responseData.refreshToken,
    };
  },
};

export default authApi;
