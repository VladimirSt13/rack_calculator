import api from '@/features/auth/authApi';

export interface AuditLog {
  id: number;
  user_id: number;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditFilters {
  userId?: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AuditStatistics {
  total: number;
  last7days: number;
  last30days: number;
  databaseSize: number;
  topActions: { action: string; count: number }[];
  byDate: { date: string; count: number }[];
}

export const auditApi = {
  /**
   * Отримати останні записи аудиту (для адміна)
   */
  getRecent: async (limit = 100) => {
    const { data } = await api.get('/audit/recent', { params: { limit } });
    return data as AuditLog[];
  },

  /**
   * Отримати історію аудиту для сутності
   */
  getByEntity: async (entityType: string, entityId: number, limit = 50) => {
    const { data } = await api.get(`/audit/${entityType}/${entityId}`, { params: { limit } });
    return data as AuditLog[];
  },

  /**
   * Отримати історію аудиту користувача
   */
  getByUser: async (userId: number, limit = 50) => {
    const { data } = await api.get(`/audit/user/${userId}`, { params: { limit } });
    return data as AuditLog[];
  },

  /**
   * Отримати аудит з фільтрами
   */
  getAll: async (filters?: AuditFilters) => {
    const { data } = await api.get('/audit', { params: filters });
    return data as { logs: AuditLog[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
  },

  /**
   * Отримати статистику аудиту
   */
  getStatistics: async () => {
    const { data } = await api.get('/audit/statistics');
    return data as AuditStatistics;
  },

  /**
   * Очистити записи старіше вказаного періоду
   */
  cleanup: async (days: number) => {
    const { data } = await api.post('/audit/cleanup', { days });
    return data as { message: string; deleted: number; days: number };
  },
};

export default auditApi;
