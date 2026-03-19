import api from '@/features/auth/authApi';

export interface User {
  id: number;
  email: string;
  nickname: string | null;
  role: 'admin' | 'manager' | 'user';
  roleName: string;
  permissions?: {
    price_types: string[];
  };
  priceTypes?: number[];
  emailVerified: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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

export interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  usersByRole: {
    admin: number;
    manager: number;
    user: number;
  };
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  nickname?: string;
  roleId?: number;
  priceTypes?: number[];
}

export interface UpdateUserDto {
  email?: string;
  nickname?: string;
  roleId?: number;
  role?: string;
  permissions?: object;
  priceTypes?: number[];
  password?: string;
}

export const usersApi = {
  /**
   * Отримати список користувачів з пагінацією
   * GET /api/users
   */
  getAll: async (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UsersResponse> => {
    const { data } = await api.get('/users', { params });
    return data.data || { users: [], pagination: { page: 0, limit: 0, total: 0, totalPages: 0 } };
  },

  /**
   * Отримати користувача за ID
   * GET /api/users/:id
   */
  getById: async (id: number): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data.data;
  },

  /**
   * Отримати поточного користувача
   * GET /api/users/me
   */
  getMe: async (): Promise<User> => {
    const { data } = await api.get('/users/me');
    return data.data;
  },

  /**
   * Оновити поточного користувача
   * PATCH /api/users/me
   */
  updateMe: async (userData: { nickname?: string; priceTypes?: number[] }): Promise<User> => {
    const { data } = await api.patch('/users/me', userData);
    return data.data;
  },

  /**
   * Створити нового користувача
   * POST /api/users
   */
  create: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await api.post('/users', userData);
    return data.data;
  },

  /**
   * Оновити користувача
   * PATCH /api/users/:id
   */
  update: async (id: number, userData: UpdateUserDto): Promise<User> => {
    const { data } = await api.patch(`/users/${id}`, userData);
    return data.data;
  },

  /**
   * Видалити користувача (soft delete)
   * DELETE /api/users/:id
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  /**
   * Відновити видаленого користувача
   * POST /api/users/:id/restore
   */
  restore: async (id: number): Promise<User> => {
    const { data } = await api.post(`/users/${id}/restore`);
    return data.data;
  },

  /**
   * Отримати статистику користувачів
   * GET /api/users/stats
   */
  getStats: async (): Promise<UserStats> => {
    const { data } = await api.get('/users/stats');
    return data.data;
  },

  /**
   * Змінити пароль користувача
   * POST /api/users/:id/change-password
   */
  changePassword: async (id: number, currentPassword: string, newPassword: string): Promise<void> => {
    const { data } = await api.post(`/users/${id}/change-password`, {
      currentPassword,
      newPassword,
    });
    return data.data;
  },

  /**
   * Отримати історію аудиту користувача
   * GET /api/audit/user/:userId
   */
  getAudit: async (id: number, limit = 50) => {
    const { data } = await api.get(`/audit/user/${id}`, { params: { limit } });
    return data.data?.auditLogs || [];
  },
};

export default usersApi;
