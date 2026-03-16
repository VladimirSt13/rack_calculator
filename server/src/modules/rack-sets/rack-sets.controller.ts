import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { AuthRequest } from '../../common/middleware/auth.middleware';
import { RackSetsService } from './rack-sets.service';
import { CreateRackSetDto, UpdateRackSetDto } from './dto';

/**
 * RackSets Controller
 * Обробка HTTP запитів для управління комплектами стелажів
 */
export class RackSetsController {
  private rackSetsService: RackSetsService;

  constructor(rackSetsService: RackSetsService) {
    this.rackSetsService = rackSetsService;
  }

  /**
   * Отримати списк комплектів
   * GET /api/rack-sets
   */
  getRackSets = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, includeDeleted } = req.query;

    const result = await this.rackSetsService.getRackSets({
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      includeDeleted: includeDeleted === 'true',
    });

    ApiResponder.success(res, result);
  });

  /**
   * Отримати комплект за ID
   * GET /api/rack-sets/:id
   */
  getRackSetById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.rackSetsService.getRackSetById(id);
    ApiResponder.success(res, result);
  });

  /**
   * Отримати ревізії комплекту
   * GET /api/rack-sets/:id/revisions
   */
  getRackSetRevisions = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.rackSetsService.getRackSetRevisions(id);
    ApiResponder.success(res, { revisions: result, total: result.length });
  });

  /**
   * Створити новий комплект
   * POST /api/rack-sets
   */
  createRackSet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const dto: CreateRackSetDto = req.body;
    const result = await this.rackSetsService.createRackSet({
      ...dto,
      userId,
    });

    ApiResponder.created(res, result);
  });

  /**
   * Оновити комплект
   * PATCH /api/rack-sets/:id
   */
  updateRackSet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const { id } = req.params;
    const dto: UpdateRackSetDto = req.body;
    const result = await this.rackSetsService.updateRackSet(id, dto, userId);
    ApiResponder.success(res, result);
  });

  /**
   * Видалити комплект
   * DELETE /api/rack-sets/:id
   */
  deleteRackSet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const { id } = req.params;
    await this.rackSetsService.deleteRackSet(id, userId);
    ApiResponder.success(res, { message: 'RackSet deleted successfully' });
  });

  /**
   * Відновити комплект
   * POST /api/rack-sets/:id/restore
   */
  restoreRackSet = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.rackSetsService.restoreRackSet(id);
    ApiResponder.success(res, result);
  });
}

export default RackSetsController;
