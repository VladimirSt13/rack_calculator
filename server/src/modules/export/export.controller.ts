import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { AuthRequest } from '../../common/middleware/auth.middleware';
import { ExportService } from './export.service';
import { ExportRackSetDto, ExportPriceDto } from './dto';

/**
 * Export Controller
 * Обробка HTTP запитів для експорту даних
 */
export class ExportController {
  private exportService: ExportService;

  constructor(exportService: ExportService) {
    this.exportService = exportService;
  }

  /**
   * Експортувати комплект стелажів
   * POST /api/export/rack-sets
   */
  exportRackSet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const dto: ExportRackSetDto = req.body;
    const result = await this.exportService.exportRackSet({
      ...dto,
      userId,
    });

    // Відправка файлу клієнту
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.setHeader('Content-Length', result.fileSize.toString());

    res.send(result.buffer);
  });

  /**
   * Експортувати прайс-лист
   * POST /api/export/prices
   */
  exportPrice = asyncHandler(async (req: Request, res: Response) => {
    const dto: ExportPriceDto = req.body;
    const result = await this.exportService.exportPrice(dto);

    // Відправка файлу клієнту
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.setHeader('Content-Length', result.fileSize.toString());

    res.send(result.buffer);
  });

  /**
   * Експортувати розрахунок
   * POST /api/export/calculations/:id
   */
  exportCalculation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      ApiResponder.unauthorized(res, 'User not authenticated');
      return;
    }

    const { id } = req.params;
    const { includeDetails } = req.body;

    const result = await this.exportService.exportCalculation(id, includeDetails);

    // Відправка файлу клієнту
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.setHeader('Content-Length', result.fileSize.toString());

    res.send(result.buffer);
  });
}

export default ExportController;
