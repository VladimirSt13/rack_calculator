import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { AuthRequest } from '../../common/middleware/auth.middleware';
import { AuditService } from './audit.service';

/**
 * Audit Controller
 * Обробка HTTP запитів для журналу аудиту
 */
export class AuditController {
  private auditService: AuditService;

  constructor(auditService: AuditService) {
    this.auditService = auditService;
  }

  /**
   * Отримати записи аудиту
   * GET /api/audit
   */
  getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    const { action, entityType, entityId, startDate, endDate, page, limit } = req.query as any;

    const result = await this.auditService.getAuditLogs({
      action,
      entityType,
      entityId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });

    ApiResponder.success(res, result);
  });

  /**
   * Отримати статистику аудиту
   * GET /api/audit/stats
   */
  getAuditStats = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.auditService.getAuditStats();
    ApiResponder.success(res, result);
  });

  /**
   * Отримати записи користувача
   * GET /api/audit/user/:userId
   */
  getUserLogs = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { limit } = req.query as any;

    const result = await this.auditService.getUserLogs(userId, limit ? parseInt(limit, 10) : 50);

    ApiResponder.success(res, { logs: result, total: result.length });
  });

  /**
   * Отримати записи за сутністю
   * GET /api/audit/entity/:entityType/:entityId
   */
  getEntityLogs = asyncHandler(async (req: Request, res: Response) => {
    const { entityType, entityId } = req.params;
    const result = await this.auditService.getEntityLogs(entityType, entityId);
    ApiResponder.success(res, { logs: result, total: result.length });
  });

  /**
   * Очистити старі записи
   * DELETE /api/audit/cleanup
   */
  cleanupOldLogs = asyncHandler(async (req: Request, res: Response) => {
    const { days } = req.query as any;
    const deletedCount = await this.auditService.cleanupOldLogs(days ? parseInt(days, 10) : 90);

    ApiResponder.success(res, {
      message: `Deleted ${deletedCount} old audit logs`,
      deletedCount,
    });
  });

  /**
   * Створити запис аудиту (для внутрішнього використання)
   * POST /api/audit
   */
  createAuditLog = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const { action, entityType, entityId, metadata, description } = req.body;

    const result = await this.auditService.createAuditLog({
      userId,
      action,
      entityType,
      entityId,
      metadata,
      description,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    ApiResponder.created(res, result);
  });
}

export default AuditController;
