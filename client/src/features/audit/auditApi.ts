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

export interface AuditCleanupResponse {
  message: string;
  deletedCount: number;
}

export const auditApi = {
  /**
   * Отримати останні записи аудиту (для адміна)
   * @deprecated Використовуйте getAll() з limit
   */
  getRecent: async (limit = 100) => {
    console.warn('getRecent deprecated - use getAll() with limit instead');
    const { data } = await api.get('/audit', { params: { limit } });
    return data.data?.auditLogs || [];
  },

  /**
   * Отримати історію аудиту для сутності
   * GET /api/audit/entity/:entityType/:entityId
   */
  getByEntity: async (entityType: string, entityId: number, limit = 50) => {
    const { data } = await api.get(`/audit/entity/${entityType}/${entityId}`, {
      params: { limit },
    });
    return data.data?.auditLogs || [];
  },

  /**
   * Отримати історію аудиту користувача
   * GET /api/audit/user/:userId
   */
  getByUser: async (userId: number, limit = 50) => {
    const { data } = await api.get(`/audit/user/${userId}`, {
      params: { limit },
    });
    return data.data?.auditLogs || [];
  },

  /**
   * Отримати аудит з фільтрами
   * GET /api/audit
   */
  getAll: async (filters?: AuditFilters) => {
    const { data } = await api.get('/audit', { params: filters });
    return {
      logs: data.data?.auditLogs || [],
      pagination: data.data?.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    };
  },

  /**
   * Отримати статистику аудиту
   * GET /api/audit/stats
   */
  getStatistics: async () => {
    const { data } = await api.get('/audit/stats');
    return data.data || {};
  },

  /**
   * Очистити записи старіше вказаного періоду
   * DELETE /api/audit/cleanup
   * @param days - Видалити записи старіше N днів
   */
  cleanup: async (days: number) => {
    const { data } = await api.delete('/audit/cleanup', {
      params: { olderThanDays: days },
    });
    return {
      message: data.data?.message || 'Cleanup completed',
      deletedCount: data.data?.deletedCount || 0,
    };
  },
};

export default auditApi;
