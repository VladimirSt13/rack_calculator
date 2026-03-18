import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from './authApi';
import { User } from './types/auth.types';

/**
 * Стан та дії для управління аутентифікацією
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;

  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isAdmin: () => boolean;
}

/**
 * Permission helpers для перевірки дозволів
 */
const createPermissionHelpers = (user: User | null) => ({
  /**
   * Перевірити чи має користувач конкретний дозвіл
   * Адмін завжди має всі дозволи
   */
  hasPermission: (permission: string): boolean => {
    if (!user) return false;
    // Адмін має всі дозволи автоматично
    if (user.roleName?.toUpperCase() === 'ADMIN') return true;
    return user.permissions?.includes(permission) ?? false;
  },

  /**
   * Перевірити чи має хоча б один дозвіл зі списку
   */
  hasAnyPermission: (permissions: string[]): boolean => {
    if (!user) return false;
    // Адмін має всі дозволи автоматично
    if (user.roleName?.toUpperCase() === 'ADMIN') return true;
    return permissions.some((p) => user.permissions?.includes(p) ?? false);
  },

  /**
   * Перевірити чи має всі дозволи зі списку
   */
  hasAllPermissions: (permissions: string[]): boolean => {
    if (!user) return false;
    // Адмін має всі дозволи автоматично
    if (user.roleName?.toUpperCase() === 'ADMIN') return true;
    return permissions.every((p) => user.permissions?.includes(p) ?? false);
  },

  /**
   * Перевірити чи є адміном
   */
  isAdmin: (): boolean => {
    return user?.roleName?.toUpperCase() === 'ADMIN';
  },
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          // Сервер повертає { user, tokens: { accessToken, refreshToken, expiresIn } }
          const newUser = response.user;
          const newAccessToken = response.tokens.accessToken;
          const newRefreshToken = response.tokens.refreshToken;

          // Нормалізуємо roleName до нижнього регістру для зручності
          const normalizedUser: User = {
            ...newUser,
            roleName: newUser.roleName?.toLowerCase() || newUser.role?.toLowerCase() || 'user',
          };

          // Явне збереження в localStorage для надійності
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          set({
            user: normalizedUser,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            isLoading: false,
          });
        } catch (error) {
          const errorData = (error as any).response?.data;
          const errorMessage =
            typeof errorData?.error === 'string'
              ? errorData.error
              : errorData?.error?.message || errorData?.message || 'Помилка входу';

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(email, password);
          const newAccessToken = response.tokens.accessToken;
          const newRefreshToken = response.tokens.refreshToken;

          // Явне збереження в localStorage для надійності
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          const normalizedUser: User = {
            ...response.user,
            roleName: response.user.roleName?.toLowerCase() || response.user.role?.toLowerCase() || 'user',
          };

          set({
            user: normalizedUser,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            isLoading: false,
          });
        } catch (error) {
          const errorData = (error as any).response?.data;
          const errorMessage =
            typeof errorData?.error === 'string'
              ? errorData.error
              : errorData?.error?.message || errorData?.message || 'Помилка реєстрації';

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ігноруємо помилки logout
        } finally {
          // Явне очищення localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            error: null,
          });
        }
      },

      verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.verifyEmail(token);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              (error as unknown as { response?: { data?: { error?: string } } }).response?.data?.error ||
              'Помилка підтвердження',
            isLoading: false,
          });
          throw error;
        }
      },

      resendVerification: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resendVerification(email);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              (error as unknown as { response?: { data?: { error?: string } } }).response?.data?.error ||
              'Помилка відправки',
            isLoading: false,
          });
          throw error;
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.forgotPassword(email);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              (error as unknown as { response?: { data?: { error?: string } } }).response?.data?.error ||
              'Помилка відправки',
            isLoading: false,
          });
          throw error;
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resetPassword(token, newPassword);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              (error as unknown as { response?: { data?: { error?: string } } }).response?.data?.error ||
              'Помилка скидання пароля',
            isLoading: false,
          });
          throw error;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.changePassword(currentPassword, newPassword);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              (error as unknown as { response?: { data?: { error?: string } } }).response?.data?.error ||
              'Помилка зміни пароля',
            isLoading: false,
          });
          throw error;
        }
      },

      refreshAuth: async () => {
        try {
          const response = await authApi.me();
          // Сервер повертає просто користувача
          set({ user: response });
        } catch {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
          });
        }
      },

      checkAuth: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const response = await authApi.me();
          // Сервер повертає просто користувача
          set({ user: response });
        } catch {
          // Помилка обробляється автоматично через axios interceptor
        }
      },

      clearError: () => set({ error: null }),

      // Permission helpers
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.roleName?.toUpperCase() === 'ADMIN') return true;
        return user.permissions?.includes(permission) ?? false;
      },

      hasAnyPermission: (permissions: string[]) => {
        const { user } = get();
        if (!user) return false;
        if (user.roleName?.toUpperCase() === 'ADMIN') return true;
        return permissions.some((p) => user.permissions?.includes(p) ?? false);
      },

      hasAllPermissions: (permissions: string[]) => {
        const { user } = get();
        if (!user) return false;
        if (user.roleName?.toUpperCase() === 'ADMIN') return true;
        return permissions.every((p) => user.permissions?.includes(p) ?? false);
      },

      isAdmin: () => {
        const { user } = get();
        return user?.roleName?.toUpperCase() === 'ADMIN';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
