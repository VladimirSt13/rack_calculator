import { Router } from 'express';
import { Price } from '../../database/models/price.model';
import { PriceComponent } from '../../database/models/price-component.model';
import { PricesRepository } from './prices.repository';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorizeRole } from '../../common/middleware/auth.middleware';
import { CreatePriceDto, UpdatePriceDto, CreatePriceComponentDto, UpdatePriceComponentDto } from './dto';

/**
 * Prices Routes
 * Маршрути для управління прайс-листами та компонентами
 */
export const pricesRoutes = Router();

// Ініціалізація залежностей
const pricesRepository = new PricesRepository(Price, PriceComponent);
const pricesService = new PricesService(pricesRepository);
const pricesController = new PricesController(pricesService);

// ==========================================
// PRICE ROUTES
// ==========================================

/**
 * @route GET /api/prices
 * @description Get current price
 * @access Public
 */
pricesRoutes.get('/', pricesController.getCurrentPrice);

/**
 * @route GET /api/prices/history
 * @description Get price history
 * @access Private (Admin)
 */
pricesRoutes.get('/history', authenticate, authorizeRole('admin'), pricesController.getPriceHistory);

/**
 * @route GET /api/prices/categories
 * @description Get price categories
 * @access Public
 */
pricesRoutes.get('/categories', pricesController.getPriceCategories);

/**
 * @route POST /api/prices
 * @description Create new price
 * @access Private (Admin)
 */
pricesRoutes.post(
  '/',
  authenticate,
  authorizeRole('admin'),
  validateRequest(CreatePriceDto),
  pricesController.createPrice,
);

/**
 * @route PATCH /api/prices/current
 * @description Update current price
 * @access Private (Admin)
 */
pricesRoutes.patch('/current', authenticate, authorizeRole('admin'), pricesController.updateCurrentPrice);

/**
 * @route PATCH /api/prices/:id
 * @description Update price
 * @access Private (Admin)
 */
pricesRoutes.patch(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  validateRequest(UpdatePriceDto),
  pricesController.updatePrice,
);

// ==========================================
// PRICE COMPONENT ROUTES
// ==========================================

/**
 * @route GET /api/price-components
 * @description Get all price components
 * @access Public
 */
pricesRoutes.get('/components', pricesController.getPriceComponents);

/**
 * @route GET /api/price-components/categories
 * @description Get component categories
 * @access Public
 */
pricesRoutes.get('/components/categories', pricesController.getComponentCategories);

/**
 * @route GET /api/price-components/:id
 * @description Get component by ID
 * @access Public
 */
pricesRoutes.get('/components/:id', pricesController.getPriceComponentById);

/**
 * @route POST /api/price-components
 * @description Create new component
 * @access Private (Admin)
 */
pricesRoutes.post(
  '/components',
  authenticate,
  authorizeRole('admin'),
  validateRequest(CreatePriceComponentDto),
  pricesController.createPriceComponent,
);

/**
 * @route PATCH /api/price-components/:id
 * @description Update component
 * @access Private (Admin)
 */
pricesRoutes.patch(
  '/components/:id',
  authenticate,
  authorizeRole('admin'),
  validateRequest(UpdatePriceComponentDto),
  pricesController.updatePriceComponent,
);

/**
 * @route DELETE /api/price-components/:id
 * @description Delete component
 * @access Private (Admin)
 */
pricesRoutes.delete('/components/:id', authenticate, authorizeRole('admin'), pricesController.deletePriceComponent);

// ==========================================
// RACK COMPONENTS ROUTES
// ==========================================

/**
 * @route GET /api/prices/rack-components
 * @description Get rack components from current price
 * @access Public
 */
pricesRoutes.get('/rack-components', pricesController.getRackComponents);

// ==========================================
// PRICE UPLOAD/EXPORT ROUTES
// ==========================================

/**
 * @route POST /api/prices/parse-excel
 * @description Parse Excel file (preview)
 * @access Private (Admin)
 */
pricesRoutes.post('/parse-excel', authenticate, authorizeRole('admin'), pricesController.parseExcelFile);

/**
 * @route POST /api/prices/upload-excel
 * @description Upload price from Excel file
 * @access Private (Admin)
 */
pricesRoutes.post('/upload-excel', authenticate, authorizeRole('admin'), pricesController.uploadPriceExcel);

/**
 * @route GET /api/prices/history/:id/restore
 * @description Restore price version
 * @access Private (Admin)
 */
pricesRoutes.post('/history/:id/restore', authenticate, authorizeRole('admin'), pricesController.restorePriceVersion);

/**
 * @route GET /api/prices/history/:id
 * @description Get price version by ID
 * @access Public
 */
pricesRoutes.get('/history/:id', pricesController.getPriceVersion);

/**
 * @route PATCH /api/prices/current
 * @description Update current price
 * @access Private (Admin)
 */
pricesRoutes.patch('/current', authenticate, authorizeRole('admin'), pricesController.updateCurrentPrice);

/**
 * @route GET /api/prices/export-excel
 * @description Export current price to Excel
 * @access Public
 */
pricesRoutes.get('/export-excel', pricesController.exportPriceExcel);

export default pricesRoutes;
