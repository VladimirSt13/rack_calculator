import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { RackService } from './rack.service';

/**
 * Rack Controller
 * Обробка HTTP запитів для розрахунку стелажів
 */
export class RackController {
  private rackService: RackService;

  constructor(rackService: RackService) {
    this.rackService = rackService;
  }

  /**
   * Розрахунок стелажа
   * POST /api/rack/calculate
   */
  calculate = asyncHandler(async (req: Request, res: Response) => {
    console.log('[RackController] calculate() called');
    console.log('[RackController] req.user:', (req as any).user);

    const config = req.body;
    // Отримуємо роль користувача з запиту (додається middleware authenticate)
    const userRole = (req as any).user?.roleName || 'user';
    console.log('[RackController] userRole:', userRole);

    const result = await this.rackService.calculate(config, userRole);
    ApiResponder.success(res, result);
  });
}

export default RackController;
