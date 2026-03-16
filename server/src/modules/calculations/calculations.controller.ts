import { Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { AuthRequest } from '../../common/middleware/auth.middleware';
import { CalculationsService } from './calculations.service';
import { CreateCalculationDto, UpdateCalculationDto } from './dto';

/**
 * Calculations Controller
 * Обробка HTTP запитів для управління розрахунками
 */
export class CalculationsController {
  private calculationsService: CalculationsService;

  constructor(calculationsService: CalculationsService) {
    this.calculationsService = calculationsService;
  }

  /**
   * Отримати списк розрахунків
   * GET /api/calculations
   */
  getCalculations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const { type, page, limit } = req.query;

    const result = await this.calculationsService.getCalculations({
      userId,
      type: type as 'rack' | 'battery',
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    ApiResponder.success(res, result);
  });

  /**
   * Отримати розрахунок за ID
   * GET /api/calculations/:id
   */
  getCalculationById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const { id } = req.params;
    const result = await this.calculationsService.getCalculationById(id, userId);
    ApiResponder.success(res, result);
  });

  /**
   * Створити новий розрахунок
   * POST /api/calculations
   */
  createCalculation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const dto: CreateCalculationDto = req.body;
    const result = await this.calculationsService.createCalculation({
      ...dto,
      userId,
    });

    ApiResponder.created(res, result);
  });

  /**
   * Оновити розрахунок
   * PATCH /api/calculations/:id
   */
  updateCalculation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const { id } = req.params;
    const dto: UpdateCalculationDto = req.body;
    const result = await this.calculationsService.updateCalculation(id, dto, userId);
    ApiResponder.success(res, result);
  });

  /**
   * Видалити розрахунок
   * DELETE /api/calculations/:id
   */
  deleteCalculation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const { id } = req.params;
    await this.calculationsService.deleteCalculation(id, userId);
    ApiResponder.success(res, { message: 'Calculation deleted successfully' });
  });
}

export default CalculationsController;
