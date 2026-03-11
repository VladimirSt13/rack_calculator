import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as priceController from '../controllers/priceController.js';

const router = Router();

/**
 * GET /api/price
 * Отримати поточний прайс-лист
 */
router.get('/', priceController.getPrice);

/**
 * PUT /api/price
 * Оновити прайс-лист (auth required)
 */
router.put('/', authenticate, priceController.updatePrice);

/**
 * POST /api/price/upload
 * Завантажити прайс з файлу (auth required)
 */
router.post('/upload', authenticate, priceController.uploadPrice);

export default router;
