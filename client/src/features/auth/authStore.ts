import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from './authApi';

/**
 * Інтерфейс користувача
 *
 * @property id - Унікальний ID користувача
 * @property email - Email адреса
 * @property role - Роль користувача (admin, manager, user)
 * @property permissions - Дозволи користувача
 * @property permissions.price_types - Доступні типи цін
 * @property emailVerified - Чи підтверджено email
 */
export interface User {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'user';
  permissions?: {
    price_types: string[];
  };
  emailVerified: boolean;
}

/**
 * Стан та дії для управління аутентифікацією
 *
 * @property user - Поточний користувач або null
 * @property accessToken - JWT access token
 * @property refreshToken - JWT refresh token
 * @property isLoading - Чи триває завантаження
 * @property error - Остання помилка
 *
 * @example
 * ```typescript
 * const { login, logout, user } = useAuthStore();
 *
 * // Логін
 * await login('user@accu-energo.com.ua', 'password');
 *
 * // Перевірка авторизації
 * if (user?.role === 'admin') { ... }
 *
 * // Логаут
 * await logout();
 * ```
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
}

/**
 * Zustand store для управління аутентифікацією
 *
 * @features
 * - Persist middleware для збереження токенів в localStorage
 * - Повний набір auth actions (login, register, logout, etc.)
 * - Обробка помилок та loading states
 * - Email verification
 * - Password reset
 *
 * @example
 * ```typescript
 * import { useAuthStore } from '@/features/auth/authStore';
 *
 * // Отримання даних
 * const { user, accessToken, isLoading } = useAuthStore();
 *
 * // Використання actions
 * const { login, logout, checkAuth } = useAuthStore();
 *
 * // Перевірка прав
 * if (user?.role === 'admin') { ... }
 *
 * // Перевірка дозволів
 * if (user?.permissions?.price_types?.includes('нульова')) { ... }
 * ```
 *
 * @see {@link https://zustand-demo.pmnd.rs/ Zustand Documentation}
 */
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
          // authApi повертає { user, accessToken, refreshToken, emailVerified }
          const newUser = response.user;
          const newAccessToken = response.accessToken;
          const newRefreshToken = response.refreshToken;

          // Явне збереження в localStorage для надійності
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          set({
            user: newUser,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              (error as unknown as { response?: { data?: { error?: string } } }).response?.data?.error ||
              'Помилка входу',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(email, password);
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              (error as unknown as { response?: { data?: { error?: string } } }).response?.data?.error ||
              'Помилка реєстрації',
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
        // Refresh token обробляється автоматично через axios interceptor
        try {
          const response = await authApi.me();
          set({ user: response.user });
        } catch {
          // Якщо не вдалося отримати користувача - очищаємо стан
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
          set({ user: response.user });
        } catch {
          // Помилка обробляється автоматично через axios interceptor
        }
      },

      clearError: () => set({ error: null }),
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
