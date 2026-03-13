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
 * GET /api/price/history
 * Отримати історію змін прайсу
 */
router.get('/history', priceController.getPriceHistory);

/**
 * GET /api/price/history/:id
 * Отримати конкретну версію прайсу
 */
router.get('/history/:id', priceController.getPriceVersion);

/**
 * POST /api/price/history/:id/restore
 * Відновити попередню версію прайсу
 */
router.post('/history/:id/restore', authenticate, priceController.restorePriceVersion);

/**
 * PUT /api/price
 * Оновити прайс-лист (auth required)
 */
router.put('/', authenticate, priceController.updatePrice);

/**
 * POST /api/price/upload
 * Завантажити прайс з JSON даних (auth required)
 */
router.post('/upload', authenticate, priceController.uploadPrice);

/**
 * POST /api/price/upload-excel
 * Завантажити прайс з Excel файлу (auth required)
 */
router.post('/upload-excel', authenticate, priceController.uploadPriceExcel);

/**
 * POST /api/price/parse-excel
 * Парсинг Excel файлу (попередній перегляд)
 */
router.post('/parse-excel', authenticate, priceController.parseExcelFile);

/**
 * GET /api/price/export-excel
 * Експорт поточного прайсу в Excel
 */
router.get('/export-excel', authenticate, priceController.exportPriceExcel);

export default router;
