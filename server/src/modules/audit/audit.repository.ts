import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../database/repositories/base.repository';
import { IAuditLogDocument } from '../../database/models/audit-log.model';
import { GetAuditLogsInput, CreateAuditLogInput } from './audit.types';

/**
 * Audit Repository
 * Відповідає за доступ до даних журналу аудиту
 */
export class AuditRepository extends BaseRepository<IAuditLogDocument> {
  private auditModel: Model<IAuditLogDocument>;

  constructor(auditModel: Model<IAuditLogDocument>) {
    super(auditModel);
    this.auditModel = auditModel;
  }

  /**
   * Отримати записи аудиту з фільтрами та пагінацією
   */
  async findAuditLogs(input: GetAuditLogsInput): Promise<{
    logs: IAuditLogDocument[];
    total: number;
  }> {
    const { action, entityType, entityId, userId, startDate, endDate, page = 1, limit = 20 } = input;

    // Формуємо фільтр
    const query: any = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (userId) query.userId = new Types.ObjectId(userId);
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await this.auditModel.countDocuments(query);

    const logs = await this.auditModel
      .find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { logs, total };
  }

  /**
   * Створити запис аудиту
   */
  async createAuditLog(input: CreateAuditLogInput): Promise<IAuditLogDocument> {
    const auditLog = new this.auditModel({
      userId: input.userId ? new Types.ObjectId(input.userId) : null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
      description: input.description,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
    return auditLog.save();
  }

  /**
   * Отримати статистику аудиту
   */
  async getStats(): Promise<any> {
    return (this.auditModel as any).getStats();
  }

  /**
   * Очистити старі записи
   */
  async cleanupOld(days: number): Promise<number> {
    return (this.auditModel as any).cleanupOld(days);
  }

  /**
   * Отримати записи за користувачем
   */
  async findUserLogs(userId: string, limit: number = 50): Promise<IAuditLogDocument[]> {
    return this.auditModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'email')
      .exec();
  }

  /**
   * Отримати записи за сутністю
   */
  async findEntityLogs(entityType: string, entityId: string): Promise<IAuditLogDocument[]> {
    return this.auditModel.find({ entityType, entityId }).sort({ createdAt: -1 }).populate('userId', 'email').exec();
  }
}

export default AuditRepository;
