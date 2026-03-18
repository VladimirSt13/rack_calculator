import { Request, Response } from 'express';
import { asyncHandler, ApiResponder } from '../../common/utils';
import { PricesService } from './prices.service';
import { CreatePriceDto, UpdatePriceDto, CreatePriceComponentDto, UpdatePriceComponentDto } from './dto';
import multer from 'multer';

// Налаштування multer для завантаження файлів
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  },
});

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
      limit ? parseInt(limit as string, 10) : 100,
    );

    console.log('[getPriceHistory] Raw result count:', result.length);
    console.log(
      '[getPriceHistory] First item:',
      result[0]
        ? {
            _id: result[0]._id,
            hasData: !!result[0].data,
            data: result[0].data ? Object.keys(result[0].data) : 'NO DATA',
          }
        : 'NO ITEMS',
    );

    // Форматування відповіді для клієнта
    const versions = result
      .filter((price: any) => {
        // Перевіряємо чи є дані і ID
        const hasId = price.id || price._id;
        const hasData = price.data;
        return hasId && hasData;
      })
      .map((price: any, index: number) => ({
        id: index + 1, // Простий номер версії для клієнта
        createdAt: price.updatedAt,
        createdBy: 'system', // Поки що немає відстеження користувачів
        itemsCount:
          Object.keys(price.data.supports || {}).length +
          Object.keys(price.data.spans || {}).length +
          Object.keys(price.data.vertical_supports || {}).length +
          Object.keys(price.data.diagonal_brace || {}).length +
          Object.keys(price.data.isolator || {}).length,
        // Зберігаємо ID для внутрішніх операцій
        _id: price.id || price._id,
      }));

    console.log('[getPriceHistory] Filtered versions count:', versions.length);
    ApiResponder.success(res, { versions, total: versions.length });
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

  /**
   * Отримати компоненти стелажів з прайсу
   * GET /api/prices/rack-components
   */
  getRackComponents = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.pricesService.getRackComponents();
    ApiResponder.success(res, result);
  });

  // ==========================================
  // PRICE UPLOAD/EXPORT METHODS
  // ==========================================

  /**
   * Парсинг Excel файлу (попередній перегляд)
   * POST /api/prices/parse-excel
   */
  parseExcelFile = asyncHandler(async (req: Request, res: Response) => {
    upload.single('file')(req, res, async (err: any) => {
      if (err) {
        ApiResponder.badRequest(res, err.message);
        return;
      }

      if (!req.file) {
        ApiResponder.badRequest(res, 'No file uploaded');
        return;
      }

      const parsedData = await this.pricesService.parseExcelFile(req.file.buffer);
      ApiResponder.success(res, parsedData);
    });
  });

  /**
   * Завантажити прайс з Excel файлу
   * POST /api/prices/upload-excel
   */
  uploadPriceExcel = asyncHandler(async (req: Request, res: Response) => {
    upload.single('file')(req, res, async (err: any) => {
      if (err) {
        ApiResponder.badRequest(res, err.message);
        return;
      }

      if (!req.file) {
        ApiResponder.badRequest(res, 'No file uploaded');
        return;
      }

      const result = await this.pricesService.uploadPriceFromExcel(req.file.buffer);
      ApiResponder.created(res, result);
    });
  });

  /**
   * Відновити версію прайсу
   * POST /api/prices/history/:id/restore
   */
  restorePriceVersion = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Перевіряємо чи це ObjectId (24 символи)
    if (id.length === 24) {
      const result = await this.pricesService.restorePriceVersion(id);
      ApiResponder.success(res, result);
    } else {
      ApiResponder.badRequest(res, 'Please use version _id instead of version number');
    }
  });

  /**
   * Отримати версію прайсу за ID
   * GET /api/prices/history/:id
   */
  getPriceVersion = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Перевіряємо чи це ObjectId (24 символи)
    if (id.length === 24) {
      const result = await this.pricesService.getPriceVersion(id);
      ApiResponder.success(res, result);
    } else {
      // Якщо це номер версії, повертаємо помилку
      ApiResponder.badRequest(res, 'Please use version _id instead of version number');
    }
  });

  /**
   * Оновити поточний прайс
   * PATCH /api/prices/current
   */
  updateCurrentPrice = asyncHandler(async (req: Request, res: Response) => {
    const { data, category } = req.body;
    const result = await this.pricesService.updateCurrentPrice(data, category);
    ApiResponder.success(res, result);
  });

  /**
   * Експорт поточного прайсу в Excel
   * GET /api/prices/export-excel
   */
  exportPriceExcel = asyncHandler(async (_req: Request, res: Response) => {
    const price = await this.pricesService.getCurrentPrice();

    if (!price) {
      ApiResponder.notFound(res, 'Price not found');
      return;
    }

    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rack Calculator';
    workbook.created = new Date();
    workbook.lastModifiedBy = 'Rack Calculator System';

    const worksheet = workbook.addWorksheet('Прайс');

    // Налаштування стовпців - 6 колонок
    worksheet.columns = [
      { header: 'Код', key: 'code', width: 15 },
      { header: 'Назва', key: 'name', width: 60 },
      { header: 'Ціна без ПДВ', key: 'price', width: 15 },
      { header: 'Категорія', key: 'category', width: 20 },
      { header: 'Вага', key: 'weight', width: 12 },
      { header: 'Опис', key: 'description', width: 50 },
    ];

    // Стиль заголовка таблиці
    worksheet.getRow(1).font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFFFF' },
    };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }, // Синій колір
    };
    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getRow(1).height = 25;

    // Заморожуємо перший рядок
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Додаємо автофільтр
    worksheet.autoFilter = 'A1:F1';

    let rowCount = 2;

    const CATEGORY_ORDER = ['supports', 'spans', 'vertical_supports', 'diagonal_brace', 'isolator'];

    const priceData = price.data;

    CATEGORY_ORDER.forEach((category) => {
      const items = priceData[category as keyof typeof priceData];

      if (!items) {
        return;
      }

      const entries = Object.entries(items);
      if (entries.length === 0) {
        return;
      }

      // Для опор — обробляємо вкладену структуру
      if (category === 'supports') {
        entries.forEach(([code, item]: [string, any]) => {
          // Крайня опора
          if (item.edge) {
            worksheet.addRow({
              code: code,
              name: item.edge.name || 'Опора крайня',
              price: item.edge.price || '',
              category: 'supports',
              weight: item.edge.weight !== null && item.edge.weight !== undefined ? item.edge.weight : '',
              description: item.edge.description || item.description || '',
            });

            // Форматування рядка
            const row = worksheet.getRow(rowCount);
            row.eachCell((cell: any) => {
              cell.border = {
                top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              };
            });
            row.height = 20;
            rowCount++;
          }

          // Проміжна опора
          if (item.intermediate) {
            worksheet.addRow({
              code: code,
              name: item.intermediate.name || 'Проміжна опора',
              price: item.intermediate.price || '',
              category: 'supports',
              weight:
                item.intermediate.weight !== null && item.intermediate.weight !== undefined
                  ? item.intermediate.weight
                  : '',
              description: item.intermediate.description || item.description || '',
            });

            // Форматування рядка
            const row = worksheet.getRow(rowCount);
            row.eachCell((cell: any) => {
              cell.border = {
                top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              };
            });
            row.height = 20;
            rowCount++;
          }
        });
      } else {
        // Для інших категорій
        entries.forEach(([code, item]: [string, any]) => {
          worksheet.addRow({
            code: item.code || code,
            name: item.name || code,
            price: item.price || '',
            category: category,
            weight: item.weight !== null && item.weight !== undefined ? item.weight : '',
            description: item.description || '',
          });

          // Форматування рядка
          const row = worksheet.getRow(rowCount);
          row.eachCell((cell: any) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            };
          });
          row.height = 20;
          rowCount++;
        });
      }
    });

    // Форматування цін і ваги
    for (let i = 2; i < rowCount; i++) {
      const row = worksheet.getRow(i);
      const priceCell = row.getCell(3);
      const weightCell = row.getCell(5);

      // Ціна — формат числа з 2 знаками
      if (priceCell.value && typeof priceCell.value === 'number') {
        priceCell.value = Math.round(priceCell.value * 100) / 100;
        priceCell.numFmt = '#,##0.00';
        priceCell.alignment = { horizontal: 'right' };
      }

      // Вага — формат числа з 2 знаками
      if (weightCell.value && typeof weightCell.value === 'number') {
        weightCell.value = Math.round(weightCell.value * 100) / 100;
        weightCell.numFmt = '#,##0.00';
        weightCell.alignment = { horizontal: 'right' };
      }

      // Категорія — вирівнювання по центру
      const categoryCell = row.getCell(4);
      categoryCell.alignment = { horizontal: 'center' };
    }

    // Додаємо підсумковий рядок
    worksheet.addRow([]);
    const totalRow = worksheet.getRow(rowCount + 1);
    totalRow.getCell(1).value = `Всього позицій: ${rowCount - 2}`;
    totalRow.getCell(1).font = { bold: true, size: 11 };
    totalRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' },
    };
    totalRow.height = 25;
    worksheet.mergeCells(rowCount + 1, 1, rowCount + 1, 6);

    // Відправка файлу
    const fileName = `price_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  });
}

export default PricesController;
