import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import * as auditController from "../controllers/auditController.js";

const router = express.Router();

/**
 * GET /api/audit/statistics
 * Отримати статистику журналу аудиту
 */
router.get(
  "/statistics",
  authenticate,
  authorizeRole("admin"),
  auditController.getAuditStatistics,
);

/**
 * POST /api/audit/cleanup
 * Очистити записи старіше вказаного періоду
 */
router.post(
  "/cleanup",
  authenticate,
  authorizeRole("admin"),
  auditController.cleanupAuditLogs,
);

/**
 * GET /api/audit
 * Отримати журнал аудиту з фільтрами
 */
router.get(
  "/",
  authenticate,
  authorizeRole("admin"),
  auditController.getAuditLogs,
);

/**
 * GET /api/audit/recent
 * Отримати останні записи аудиту
 */
router.get(
  "/recent",
  authenticate,
  authorizeRole("admin"),
  auditController.getRecentAuditLogs,
);

/**
 * GET /api/audit/:entityType/:entityId
 * Отримати історію аудиту для сутності
 */
router.get(
  "/:entityType/:entityId",
  authenticate,
  authorizeRole("admin"),
  auditController.getAuditByEntity,
);

/**
 * GET /api/audit/user/:userId
 * Отримати історію аудиту користувача
 */
router.get(
  "/user/:userId",
  authenticate,
  authorizeRole("admin"),
  auditController.getAuditByUser,
);

export default router;
