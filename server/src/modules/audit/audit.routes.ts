import { Router } from 'express';
import { AuditLog } from '../../database/models/audit-log.model';
import { AuditRepository } from './audit.repository';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorizeRole } from '../../common/middleware/auth.middleware';
import { AuditQueryDto } from './dto/audit.dto';

/**
 * Audit Routes
 * Маршрути для журналу аудиту
 */
export const auditRoutes = Router();

// Ініціалізація залежностей
const auditRepository = new AuditRepository(AuditLog);
const auditService = new AuditService(auditRepository);
const auditController = new AuditController(auditService);

// ==========================================
// PROTECTED ROUTES (Admin)
// ==========================================

/**
 * @route GET /api/audit
 * @description Get audit logs with filters
 * @access Private (Admin)
 */
auditRoutes.get(
  '/',
  authenticate,
  authorizeRole('admin'),
  validateRequest(AuditQueryDto),
  auditController.getAuditLogs,
);

/**
 * @route GET /api/audit/stats
 * @description Get audit statistics
 * @access Private (Admin)
 */
auditRoutes.get(
  '/stats',
  authenticate,
  authorizeRole('admin'),
  auditController.getAuditStats,
);

/**
 * @route GET /api/audit/user/:userId
 * @description Get user audit logs
 * @access Private (Admin)
 */
auditRoutes.get(
  '/user/:userId',
  authenticate,
  authorizeRole('admin'),
  auditController.getUserLogs,
);

/**
 * @route GET /api/audit/entity/:entityType/:entityId
 * @description Get entity audit logs
 * @access Private (Admin)
 */
auditRoutes.get(
  '/entity/:entityType/:entityId',
  authenticate,
  authorizeRole('admin'),
  auditController.getEntityLogs,
);

/**
 * @route DELETE /api/audit/cleanup
 * @description Cleanup old audit logs
 * @access Private (Admin)
 */
auditRoutes.delete(
  '/cleanup',
  authenticate,
  authorizeRole('admin'),
  auditController.cleanupOldLogs,
);

// ==========================================
// INTERNAL ROUTE (for logging)
// ==========================================

/**
 * @route POST /api/audit
 * @description Create audit log entry
 * @access Private (Internal)
 */
auditRoutes.post(
  '/',
  authenticate,
  auditController.createAuditLog,
);

export default auditRoutes;
