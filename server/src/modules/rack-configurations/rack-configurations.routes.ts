import { Router } from 'express';
import { RackConfiguration } from '../../database/models/rack-configuration.model';
import { RackConfigurationsRepository } from './rack-configurations.repository';
import { RackConfigurationsService } from './rack-configurations.service';
import { RackConfigurationsController } from './rack-configurations.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorizeRole } from '../../common/middleware/auth.middleware';
import { CreateRackConfigurationDto, UpdateRackConfigurationDto } from './dto';

/**
 * RackConfigurations Routes
 * Маршрути для управління конфігураціями стелажів
 */
export const rackConfigurationsRoutes = Router();

// Ініціалізація залежностей
const rackConfigurationsRepository = new RackConfigurationsRepository(RackConfiguration);
const rackConfigurationsService = new RackConfigurationsService(rackConfigurationsRepository);
const rackConfigurationsController = new RackConfigurationsController(rackConfigurationsService);

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @route GET /api/rack-configurations
 * @description Get all rack configurations
 * @access Public
 */
rackConfigurationsRoutes.get('/', rackConfigurationsController.getConfigurations);

/**
 * @route GET /api/rack-configurations/types
 * @description Get all configuration types
 * @access Public
 */
rackConfigurationsRoutes.get('/types', rackConfigurationsController.getConfigurationTypes);

/**
 * @route GET /api/rack-configurations/:id
 * @description Get configuration by ID
 * @access Public
 */
rackConfigurationsRoutes.get('/:id', rackConfigurationsController.getConfigurationById);

/**
 * @route GET /api/rack-configurations/type/:type
 * @description Get configurations by type
 * @access Public
 */
rackConfigurationsRoutes.get('/type/:type', rackConfigurationsController.getConfigurationsByType);

// ==========================================
// PROTECTED ROUTES (Admin)
// ==========================================

/**
 * @route POST /api/rack-configurations
 * @description Create new rack configuration
 * @access Private (Admin)
 */
rackConfigurationsRoutes.post(
  '/',
  authenticate,
  authorizeRole('admin'),
  validateRequest(CreateRackConfigurationDto),
  rackConfigurationsController.createConfiguration,
);

/**
 * @route PATCH /api/rack-configurations/:id
 * @description Update rack configuration
 * @access Private (Admin)
 */
rackConfigurationsRoutes.patch(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  validateRequest(UpdateRackConfigurationDto),
  rackConfigurationsController.updateConfiguration,
);

/**
 * @route DELETE /api/rack-configurations/:id
 * @description Delete rack configuration (soft delete)
 * @access Private (Admin)
 */
rackConfigurationsRoutes.delete(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  rackConfigurationsController.deleteConfiguration,
);

/**
 * @route POST /api/rack-configurations/:id/restore
 * @description Restore deleted rack configuration
 * @access Private (Admin)
 */
rackConfigurationsRoutes.post(
  '/:id/restore',
  authenticate,
  authorizeRole('admin'),
  rackConfigurationsController.restoreConfiguration,
);

export default rackConfigurationsRoutes;
