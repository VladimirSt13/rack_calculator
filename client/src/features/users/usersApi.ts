import api from '@/features/auth/authApi';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'user';
  permissions?: {
    price_types: string[];
  };
  emailVerified: boolean;
  createdAt: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  /**
   * Отримати список користувачів
   */
  getAll: async (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get('/users', { params });
    return data as UsersResponse;
  },

  /**
   * Отримати користувача
   */
  getById: async (id: number) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  /**
   * Створити користувача
   */
  create: async (userData: {
    email: string;
    password: string;
    role?: string;
    permissions?: object;
    price_types?: string[];
  }) => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  /**
   * Оновити користувача
   */
  update: async (id: number, userData: {
    email?: string;
    role?: string;
    permissions?: object;
    price_types?: string[];
    password?: string;
  }) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  /**
   * Видалити користувача
   */
  delete: async (id: number) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  /**
   * Отримати історію аудиту користувача
   */
  getAudit: async (id: number, limit = 50) => {
    const { data } = await api.get(`/users/${id}/audit`, { params: { limit } });
    return data;
  },
};

export default usersApi;
