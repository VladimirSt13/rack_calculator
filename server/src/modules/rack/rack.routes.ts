import { Router } from 'express';
import { RackService } from './rack.service';
import { RackController } from './rack.controller';
import { authenticate } from '../../common/middleware/auth.middleware';

/**
 * Rack Routes
 * Маршрути для розрахунку стелажів
 */
export const rackRoutes = Router();

// Ініціалізація залежностей
const rackService = new RackService();
const rackController = new RackController(rackService);

// ==========================================
// PROTECTED ROUTES
// ==========================================

/**
 * @route POST /api/rack/calculate
 * @description Calculate rack configuration
 * @access Private
 */
rackRoutes.post('/calculate', authenticate, rackController.calculate);

export default rackRoutes;
