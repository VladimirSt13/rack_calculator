import { Router } from 'express';
import { Price } from '../../database/models/price.model';
import { PriceComponent } from '../../database/models/price-component.model';
import { PricesRepository } from './prices.repository';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorizeRole } from '../../common/middleware/auth.middleware';
import {
  CreatePriceDto,
  UpdatePriceDto,
  CreatePriceComponentDto,
  UpdatePriceComponentDto,
} from './dto';

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
pricesRoutes.get(
  '/history',
  authenticate,
  authorizeRole('admin'),
  pricesController.getPriceHistory,
);

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
pricesRoutes.delete(
  '/components/:id',
  authenticate,
  authorizeRole('admin'),
  pricesController.deletePriceComponent,
);

export default pricesRoutes;
