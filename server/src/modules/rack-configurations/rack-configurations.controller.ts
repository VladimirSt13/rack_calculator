import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { RackConfigurationsService } from './rack-configurations.service';
import { CreateRackConfigurationDto, UpdateRackConfigurationDto } from './dto';

/**
 * RackConfigurations Controller
 * Обробка HTTP запитів для управління конфігураціями стелажів
 */
export class RackConfigurationsController {
  private rackConfigurationsService: RackConfigurationsService;

  constructor(rackConfigurationsService: RackConfigurationsService) {
    this.rackConfigurationsService = rackConfigurationsService;
  }

  /**
   * Отримати всі конфігурації
   * GET /api/rack-configurations
   */
  getConfigurations = asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.query;
    const result = await this.rackConfigurationsService.getConfigurations(type as string);
    ApiResponder.success(res, { configurations: result, total: result.length });
  });

  /**
   * Отримати типи конфігурацій
   * GET /api/rack-configurations/types
   */
  getConfigurationTypes = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.rackConfigurationsService.getConfigurationTypes();
    ApiResponder.success(res, { types: result, total: result.length });
  });

  /**
   * Отримати конфігурацію за ID
   * GET /api/rack-configurations/:id
   */
  getConfigurationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.rackConfigurationsService.getConfigurationById(id);
    ApiResponder.success(res, result);
  });

  /**
   * Отримати конфігурації за типом
   * GET /api/rack-configurations/type/:type
   */
  getConfigurationsByType = asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.params;
    const result = await this.rackConfigurationsService.getConfigurationsByType(type);
    ApiResponder.success(res, { configurations: result, total: result.length });
  });

  /**
   * Створити нову конфігурацію
   * POST /api/rack-configurations
   */
  createConfiguration = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreateRackConfigurationDto = req.body;
    const result = await this.rackConfigurationsService.createConfiguration(dto);
    ApiResponder.created(res, result);
  });

  /**
   * Оновити конфігурацію
   * PATCH /api/rack-configurations/:id
   */
  updateConfiguration = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto: UpdateRackConfigurationDto = req.body;
    const result = await this.rackConfigurationsService.updateConfiguration(id, dto);
    ApiResponder.success(res, result);
  });

  /**
   * Видалити конфігурацію
   * DELETE /api/rack-configurations/:id
   */
  deleteConfiguration = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.rackConfigurationsService.deleteConfiguration(id);
    ApiResponder.success(res, { message: 'Configuration deleted successfully' });
  });

  /**
   * Відновити конфігурацію
   * POST /api/rack-configurations/:id/restore
   */
  restoreConfiguration = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.rackConfigurationsService.restoreConfiguration(id);
    ApiResponder.success(res, result);
  });
}

export default RackConfigurationsController;
