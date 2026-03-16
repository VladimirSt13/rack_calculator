import { AuditRepository } from './audit.repository';
import {
  CreateAuditLogInput,
  GetAuditLogsInput,
  AuditLogResult,
  AuditStats,
} from './audit.types';
import { AuditAction, AuditEntityType } from './dto/audit.dto';

/**
 * Audit Service
 * Відповідає за бізнес-логіку журналу аудиту
 */
export class AuditService {
  private auditRepository: AuditRepository;

  constructor(auditRepository: AuditRepository) {
    this.auditRepository = auditRepository;
  }

  // ==========================================
  // CREATE AUDIT LOG
  // ==========================================

  /**
   * Створити запис аудиту
   */
  async createAuditLog(input: CreateAuditLogInput): Promise<AuditLogResult> {
    const auditLog = await this.auditRepository.createAuditLog(input);
    return this.mapToResult(auditLog);
  }

  /**
   * Швидкий метод для логування дії
   */
  async log(
    userId: string,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    metadata?: any,
    description?: string,
  ): Promise<AuditLogResult> {
    return this.createAuditLog({
      userId,
      action,
      entityType,
      entityId,
      metadata,
      description,
    });
  }

  // ==========================================
  // GET AUDIT LOGS
  // ==========================================

  /**
   * Отримати записи аудиту з фільтрами
   */
  async getAuditLogs(input: GetAuditLogsInput): Promise<{
    logs: AuditLogResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = input;

    const { logs, total } = await this.auditRepository.findAuditLogs(input);

    return {
      logs: logs.map((log) => this.mapToResult(log)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Отримати статистику аудиту
   */
  async getAuditStats(): Promise<AuditStats> {
    return await this.auditRepository.getStats();
  }

  /**
   * Отримати записи користувача
   */
  async getUserLogs(userId: string, limit: number = 50): Promise<AuditLogResult[]> {
    const logs = await this.auditRepository.findUserLogs(userId, limit);
    return logs.map((log) => this.mapToResult(log));
  }

  /**
   * Отримати записи за сутністю
   */
  async getEntityLogs(entityType: string, entityId: string): Promise<AuditLogResult[]> {
    const logs = await this.auditRepository.findEntityLogs(entityType, entityId);
    return logs.map((log) => this.mapToResult(log));
  }

  // ==========================================
  // CLEANUP
  // ==========================================

  /**
   * Очистити старі записи
   */
  async cleanupOldLogs(days: number = 90): Promise<number> {
    return await this.auditRepository.cleanupOld(days);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Маппінг документу в результат
   */
  private mapToResult(log: any): AuditLogResult {
    return {
      id: log._id.toHexString(),
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      user: log.userId
        ? {
            id: log.userId._id?.toHexString() || log.userId,
            email: log.userId.email || '',
          }
        : null,
      metadata: log.metadata,
      description: log.description,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    };
  }
}

export default AuditService;
