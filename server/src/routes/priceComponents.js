import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as priceComponentsController from '../controllers/priceComponentsController.js';

const router = Router();

/**
 * GET /api/price/components
 * Отримати список комплектуючих з прайсу
 */
router.get('/components', authenticate, priceComponentsController.getPriceComponents);

export default router;
