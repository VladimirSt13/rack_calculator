import { Router } from 'express';
import * as rackSetController from '../controllers/rackSetController.js';
import * as exportController from '../controllers/exportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/rack-sets
 * Отримати список комплектів стелажів для поточного користувача
 */
router.get('/', authenticate, rackSetController.getRackSets);

/**
 * GET /api/rack-sets/:id
 * Отримати конкретний комплект з деталями
 */
router.get('/:id', authenticate, rackSetController.getRackSet);

/**
 * GET /api/rack-sets/:id/export
 * Експорт комплекту стелажів в Excel
 */
router.get('/:id/export', authenticate, exportController.exportRackSet);

/**
 * POST /api/rack-sets
 * Створити новий комплект стелажів
 */
router.post('/', authenticate, rackSetController.createRackSet);

/**
 * PUT /api/rack-sets/:id
 * Оновити існуючий комплект
 */
router.put('/:id', authenticate, rackSetController.updateRackSet);

/**
 * DELETE /api/rack-sets/:id
 * Видалити комплект стелажів
 */
router.delete('/:id', authenticate, rackSetController.deleteRackSet);

/**
 * POST /api/rack-sets/:id/revision
 * Створити ревізію комплекту
 */
router.post('/:id/revision', authenticate, rackSetController.createRackSetRevision);

/**
 * GET /api/rack-sets/:id/revisions
 * Отримати історію ревізій
 */
router.get('/:id/revisions', authenticate, rackSetController.getRackSetRevisions);

/**
 * POST /api/rack-sets/export
 * Експорт нового комплекту стелажів (ще не збереженого)
 */
router.post('/export', authenticate, exportController.exportNewRackSet);

export default router;
