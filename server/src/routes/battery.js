import { Router } from 'express';
import * as batteryController from '../controllers/batteryController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/battery/calculate
 * Розрахунок стелажа по батареї
 */
router.post('/calculate', authenticate, batteryController.calculateBatteryRack);

/**
 * POST /api/battery/find-best
 * Підбір найкращого варіанту стелажа по батареї
 */
router.post('/find-best', authenticate, batteryController.findBestRackForBattery);

export default router;
