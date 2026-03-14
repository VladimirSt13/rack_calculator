import express from "express";
import { authenticate } from "../middleware/auth.js";
import * as rackConfigurationController from "../controllers/rackConfigurationController.js";

const router = express.Router();

/**
 * POST /api/rack-configurations/find-or-create
 * Знайти або створити конфігурацію стелажа з розрахунком цін
 */
router.post(
  "/find-or-create",
  authenticate,
  rackConfigurationController.findOrCreateConfiguration,
);

/**
 * GET /api/rack-configurations/:id
 * Отримати конфігурацію за ID
 */
router.get(
  "/:id",
  authenticate,
  rackConfigurationController.getConfigurationById,
);

/**
 * POST /api/rack-configurations/:id/calculate-prices
 * Розрахувати ціни для конфігурації
 */
router.post(
  "/:id/calculate-prices",
  authenticate,
  rackConfigurationController.calculatePricesForConfiguration,
);

export default router;
