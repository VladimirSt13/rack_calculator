import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as calculationsController from '../controllers/calculationsController.js';

const router = Router();

/**
 * GET /api/calculations
 * Отримати список розрахунків користувача
 */
router.get('/', authenticate, calculationsController.getCalculations);

/**
 * POST /api/calculations
 * Зберегти новий розрахунок
 */
router.post('/', authenticate, calculationsController.createCalculation);

/**
 * GET /api/calculations/:id
 * Отримати конкретний розрахунок
 */
router.get('/:id', authenticate, calculationsController.getCalculation);

/**
 * DELETE /api/calculations/:id
 * Видалити розрахунок
 */
router.delete('/:id', authenticate, calculationsController.deleteCalculation);

export default router;
