import { create } from 'zustand';
import axios from '../lib/axios';

export interface User {
  id: number;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  register: (email: string, password: string) => Promise<{ user: User; token: string }>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<{ user: User }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: (error as any).response?.data?.error || 'Помилка входу',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post('/auth/register', { email, password });
      localStorage.setItem('accessToken', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: (error as any).response?.data?.error || 'Помилка реєстрації',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('accessToken');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get('/auth/me');
      set({ user: data.user, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: (error as any).response?.data?.error || 'Помилка завантаження користувача',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
