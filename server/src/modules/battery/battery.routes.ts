import { Router } from 'express';
import { BatteryService } from './battery.service';
import { BatteryController } from './battery.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { BatteryCalculationDto } from './dto';

/**
 * Battery Routes
 * Маршрути для розрахунку стелажів для акумуляторів
 */
export const batteryRoutes = Router();

// Ініціалізація залежностей
const batteryService = new BatteryService();
const batteryController = new BatteryController(batteryService);

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @route POST /api/battery/calculate
 * @description Calculate rack for batteries
 * @access Public
 */
batteryRoutes.post(
  '/calculate',
  validateRequest(BatteryCalculationDto),
  batteryController.calculateRack,
);

/**
 * @route GET /api/battery/list
 * @description Get list of batteries
 * @access Public
 */
batteryRoutes.get('/list', batteryController.getBatteries);

/**
 * @route GET /api/battery/:model
 * @description Get battery by model
 * @access Public
 */
batteryRoutes.get('/:model', batteryController.getBatteryByModel);

export default batteryRoutes;
