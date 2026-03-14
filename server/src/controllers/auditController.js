import * as auditService from "../services/auditService.js";
import { ENTITY_TYPES } from "../helpers/audit.js";

/**
 * GET /api/audit/statistics
 * Получить статистику журнала аудита
 */
export const getAuditStatistics = async (req, res, next) => {
  try {
    const statistics = await auditService.getAuditStatistics();
    res.json(statistics);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/audit/cleanup
 * Очистить записи старше указанного периода
 */
export const cleanupAuditLogs = async (req, res, next) => {
  try {
    const { days = 90 } = req.body;
    const result = await auditService.cleanupAuditLogs(req.user.userId, days);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/audit
 * Получить журнал аудита с фильтрами
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const {
      userId,
      action,
      entityType,
      entityId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = req.query;

    const result = await auditService.getAuditLogs({
      userId,
      action,
      entityType,
      entityId,
      dateFrom,
      dateTo,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/audit/recent
 * Получить последние записи аудита
 */
export const getRecentAuditLogs = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await auditService.getRecentAuditLogs(parseInt(limit));
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/audit/:entityType/:entityId
 * Получить историю аудита для сущности
 */
export const getAuditByEntity = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await auditService.getAuditByEntity(
      entityType,
      entityId,
      parseInt(limit),
    );
    res.json(logs);
  } catch (error) {
    if (error.message === "Invalid entity type") {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * GET /api/audit/user/:userId
 * Получить историю аудита пользователя
 */
export const getAuditByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await auditService.getAuditByUser(userId, parseInt(limit));
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
