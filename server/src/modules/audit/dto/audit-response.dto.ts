import { AuditAction, AuditEntityType } from './audit.dto';

/**
 * DTO для відповіді запису аудиту
 */
export class AuditLogResponseDto {
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
 * DTO для списку записів аудиту
 */
export class AuditLogsListDto {
  logs: AuditLogResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO для статистики аудиту
 */
export class AuditStatsDto {
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
