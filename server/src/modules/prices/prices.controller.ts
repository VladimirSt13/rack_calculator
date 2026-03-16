import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { PricesService } from './prices.service';
import { CreatePriceDto, UpdatePriceDto, CreatePriceComponentDto, UpdatePriceComponentDto } from './dto';

/**
 * Prices Controller
 * Обробка HTTP запитів для управління прайс-листами
 */
export class PricesController {
  private pricesService: PricesService;

  constructor(pricesService: PricesService) {
    this.pricesService = pricesService;
  }

  // ==========================================
  // PRICE METHODS
  // ==========================================

  /**
   * Отримати поточний прайс
   * GET /api/prices
   */
  getCurrentPrice = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.query;
    const result = await this.pricesService.getCurrentPrice(category as string);
    ApiResponder.success(res, result);
  });

  /**
   * Отримати історію прайсів
   * GET /api/prices/history
   */
  getPriceHistory = asyncHandler(async (req: Request, res: Response) => {
    const { category, limit } = req.query;
    const result = await this.pricesService.getPriceHistory(
      category as string,
      limit ? parseInt(limit as string, 10) : 10,
    );
    ApiResponder.success(res, { prices: result, total: result.length });
  });

  /**
   * Отримати категорії прайсів
   * GET /api/prices/categories
   */
  getPriceCategories = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.pricesService.getPriceCategories();
    ApiResponder.success(res, { categories: result, total: result.length });
  });

  /**
   * Створити новий прайс
   * POST /api/prices
   */
  createPrice = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreatePriceDto = req.body;
    const result = await this.pricesService.createPrice(dto);
    ApiResponder.created(res, result);
  });

  /**
   * Оновити прайс
   * PATCH /api/prices/:id
   */
  updatePrice = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto: UpdatePriceDto = req.body;
    const result = await this.pricesService.updatePrice(id, dto);
    ApiResponder.success(res, result);
  });

  // ==========================================
  // PRICE COMPONENT METHODS
  // ==========================================

  /**
   * Отримати всі компоненти прайсу
   * GET /api/price-components
   */
  getPriceComponents = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.query;
    const result = await this.pricesService.getPriceComponents(category as string);
    ApiResponder.success(res, { components: result, total: result.length });
  });

  /**
   * Отримати компонент за ID
   * GET /api/price-components/:id
   */
  getPriceComponentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.pricesService.getPriceComponentById(id);
    ApiResponder.success(res, result);
  });

  /**
   * Отримати категорії компонентів
   * GET /api/price-components/categories
   */
  getComponentCategories = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.pricesService.getComponentCategories();
    ApiResponder.success(res, { categories: result, total: result.length });
  });

  /**
   * Створити компонент прайсу
   * POST /api/price-components
   */
  createPriceComponent = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreatePriceComponentDto = req.body;
    const result = await this.pricesService.createPriceComponent(dto);
    ApiResponder.created(res, result);
  });

  /**
   * Оновити компонент прайсу
   * PATCH /api/price-components/:id
   */
  updatePriceComponent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto: UpdatePriceComponentDto = req.body;
    const result = await this.pricesService.updatePriceComponent(id, dto);
    ApiResponder.success(res, result);
  });

  /**
   * Видалити компонент прайсу
   * DELETE /api/price-components/:id
   */
  deletePriceComponent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.pricesService.deletePriceComponent(id);
    ApiResponder.success(res, { message: 'Component deleted successfully' });
  });
}

export default PricesController;
