import { Router } from 'express';
import { Calculation } from '../../database/models/calculation.model';
import { CalculationsRepository } from './calculations.repository';
import { CalculationsService } from './calculations.service';
import { CalculationsController } from './calculations.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate } from '../../common/middleware/auth.middleware';
import { CreateCalculationDto, UpdateCalculationDto } from './dto';

/**
 * Calculations Routes
 * Маршрути для управління розрахунками
 */
export const calculationsRoutes = Router();

// Ініціалізація залежностей
const calculationsRepository = new CalculationsRepository(Calculation);
const calculationsService = new CalculationsService(calculationsRepository);
const calculationsController = new CalculationsController(calculationsService);

// ==========================================
// PROTECTED ROUTES
// ==========================================

/**
 * @route GET /api/calculations
 * @description Get all calculations for current user
 * @access Private
 */
calculationsRoutes.get('/', authenticate, calculationsController.getCalculations);

/**
 * @route GET /api/calculations/:id
 * @description Get calculation by ID
 * @access Private (Owner)
 */
calculationsRoutes.get('/:id', authenticate, calculationsController.getCalculationById);

/**
 * @route POST /api/calculations
 * @description Create new calculation
 * @access Private
 */
calculationsRoutes.post(
  '/',
  authenticate,
  validateRequest(CreateCalculationDto),
  calculationsController.createCalculation,
);

/**
 * @route PATCH /api/calculations/:id
 * @description Update calculation
 * @access Private (Owner)
 */
calculationsRoutes.patch(
  '/:id',
  authenticate,
  validateRequest(UpdateCalculationDto),
  calculationsController.updateCalculation,
);

/**
 * @route DELETE /api/calculations/:id
 * @description Delete calculation
 * @access Private (Owner)
 */
calculationsRoutes.delete('/:id', authenticate, calculationsController.deleteCalculation);

export default calculationsRoutes;
