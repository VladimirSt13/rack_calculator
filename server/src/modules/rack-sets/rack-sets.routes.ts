import { Router } from 'express';
import { RackSet } from '../../database/models/rack-set.model';
import { RackSetRevision } from '../../database/models/rack-set-revision.model';
import { RackSetsRepository } from './rack-sets.repository';
import { RackSetsService } from './rack-sets.service';
import { RackSetsController } from './rack-sets.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate } from '../../common/middleware/auth.middleware';
import { CreateRackSetDto, UpdateRackSetDto } from './dto';

/**
 * RackSets Routes
 * Маршрути для управління комплектами стелажів
 */
export const rackSetsRoutes = Router();

// Ініціалізація залежностей
const rackSetsRepository = new RackSetsRepository(RackSet, RackSetRevision);
const rackSetsService = new RackSetsService(rackSetsRepository);
const rackSetsController = new RackSetsController(rackSetsService);

// ==========================================
// PUBLIC/PROTECTED ROUTES
// ==========================================

/**
 * @route GET /api/rack-sets
 * @description Get all rack sets with pagination
 * @access Private
 */
rackSetsRoutes.get('/', authenticate, rackSetsController.getRackSets);

/**
 * @route GET /api/rack-sets/:id
 * @description Get rack set by ID
 * @access Private
 */
rackSetsRoutes.get('/:id', authenticate, rackSetsController.getRackSetById);

/**
 * @route GET /api/rack-sets/:id/revisions
 * @description Get rack set revisions
 * @access Private
 */
rackSetsRoutes.get('/:id/revisions', authenticate, rackSetsController.getRackSetRevisions);

// ==========================================
// PROTECTED ROUTES (Authenticated users)
// ==========================================

/**
 * @route POST /api/rack-sets
 * @description Create new rack set
 * @access Private (Authenticated users)
 */
rackSetsRoutes.post(
  '/',
  authenticate,
  validateRequest(CreateRackSetDto),
  rackSetsController.createRackSet,
);

/**
 * @route PATCH /api/rack-sets/:id
 * @description Update rack set
 * @access Private (Owner or Admin)
 */
rackSetsRoutes.patch(
  '/:id',
  authenticate,
  validateRequest(UpdateRackSetDto),
  rackSetsController.updateRackSet,
);

/**
 * @route DELETE /api/rack-sets/:id
 * @description Delete rack set (soft delete)
 * @access Private (Owner or Admin)
 */
rackSetsRoutes.delete('/:id', authenticate, rackSetsController.deleteRackSet);

/**
 * @route POST /api/rack-sets/:id/restore
 * @description Restore deleted rack set
 * @access Private (Owner or Admin)
 */
rackSetsRoutes.post('/:id/restore', authenticate, rackSetsController.restoreRackSet);

export default rackSetsRoutes;
