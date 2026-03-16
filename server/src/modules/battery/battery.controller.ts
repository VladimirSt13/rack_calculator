import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { BatteryService } from './battery.service';
import { BatteryCalculationDto } from './dto';

/**
 * Battery Controller
 * Обробка HTTP запитів для розрахунку стелажів для акумуляторів
 */
export class BatteryController {
  private batteryService: BatteryService;

  constructor(batteryService: BatteryService) {
    this.batteryService = batteryService;
  }

  /**
   * Розрахувати стелаж для акумуляторів
   * POST /api/battery/calculate
   */
  calculateRack = asyncHandler(async (req: Request, res: Response) => {
    const dto: BatteryCalculationDto = req.body;
    const result = await this.batteryService.calculateBatteryRack(dto);
    ApiResponder.success(res, result);
  });

  /**
   * Отримати список акумуляторів
   * GET /api/battery/list
   */
  getBatteries = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.batteryService.getBatteries();
    ApiResponder.success(res, { batteries: result, total: result.length });
  });

  /**
   * Отримати акумулятор за моделлю
   * GET /api/battery/:model
   */
  getBatteryByModel = asyncHandler(async (req: Request, res: Response) => {
    const { model } = req.params;
    const result = await this.batteryService.getBatteryByModel(model);

    if (!result) {
      ApiResponder.notFound(res, 'Battery not found');
      return;
    }

    ApiResponder.success(res, result);
  });
}

export default BatteryController;
