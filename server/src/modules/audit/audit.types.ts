import { AuditAction, AuditEntityType } from './dto/audit.dto';

/**
 * Вхідні дані для створення запису аудиту
 */
export interface CreateAuditLogInput {
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Вхідні дані для отримання записів аудиту
 */
export interface GetAuditLogsInput {
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Результат операцій з записом аудиту
 */
export interface AuditLogResult {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  user: {
    id: string;
    email: string;
  } | null;
  metadata?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * Статистика аудиту
 */
export interface AuditStats {
  totalLogs: number;
  logsByAction: Record<string, number>;
  logsByEntityType: Record<string, number>;
  topUsers: Array<{
    userId: string;
    email: string;
    count: number;
  }>;
  lastCleanupDate?: Date;
}
