import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from './authApi';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'user';
  permissions?: {
    price_types: string[];
  };
  emailVerified: boolean;
}

interface AuthState {
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
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Помилка входу',
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
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Помилка реєстрації',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
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
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Помилка підтвердження',
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
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Помилка відправки',
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
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Помилка відправки',
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
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Помилка скидання пароля',
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
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Помилка зміни пароля',
            isLoading: false,
          });
          throw error;
        }
      },

      refreshAuth: async () => {
        try {
          const { refreshToken: currentRefreshToken } = get();
          if (!currentRefreshToken) return;

          const response = await authApi.refreshToken(currentRefreshToken);
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        } catch (error) {
          console.error('Token refresh error:', error);
          // Якщо refresh token не валідний - виходимо
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
          });
        }
      },

      checkAuth: async () => {
        try {
          const { accessToken } = get();
          if (!accessToken) return;

          const response = await authApi.me();
          set({ user: response.user });
        } catch (error) {
          console.error('Check auth error:', error);
          // Спробуємо оновити токен
          await get().refreshAuth();
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
    }
  )
);
