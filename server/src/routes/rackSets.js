import { Router } from 'express';
import * as rackSetController from '../controllers/rackSetController.js';
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

export default router;
