import { Router } from 'express';
import * as rackController from '../controllers/rackController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/rack/calculate
 * Розрахунок стелажа
 */
router.post('/calculate', authenticate, rackController.calculateRack);

/**
 * POST /api/rack/calculate-batch
 * Масовий розрахунок стелажів
 */
router.post('/calculate-batch', authenticate, rackController.calculateRackBatch);

export default router;
