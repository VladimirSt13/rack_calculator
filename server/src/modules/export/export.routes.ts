import { Router } from 'express';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorizeRole } from '../../common/middleware/auth.middleware';
import { ExportRackSetDto, ExportPriceDto } from './dto';

/**
 * Export Routes
 * Маршрути для експорту даних
 */
export const exportRoutes = Router();

// Ініціалізація залежностей
const exportService = new ExportService();
const exportController = new ExportController(exportService);

// ==========================================
// PROTECTED ROUTES
// ==========================================

/**
 * @route POST /api/export/rack-sets
 * @description Export rack set to Excel
 * @access Private (Authenticated users)
 */
exportRoutes.post(
  '/rack-sets',
  authenticate,
  validateRequest(ExportRackSetDto),
  exportController.exportRackSet,
);

/**
 * @route POST /api/export/prices
 * @description Export price list to Excel
 * @access Private (Admin/Manager)
 */
exportRoutes.post(
  '/prices',
  authenticate,
  authorizeRole('admin'),
  validateRequest(ExportPriceDto),
  exportController.exportPrice,
);

/**
 * @route POST /api/export/calculations/:id
 * @description Export calculation to Excel
 * @access Private (Owner)
 */
exportRoutes.post(
  '/calculations/:id',
  authenticate,
  exportController.exportCalculation,
);

export default exportRoutes;
