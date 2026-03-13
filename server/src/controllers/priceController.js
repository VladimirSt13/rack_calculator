import multer from 'multer';
import ExcelJS from 'exceljs';
import * as priceService from '../services/priceService.js';
import { parsePriceExcel } from '../services/priceExcelParser.js';

// Налаштування multer для завантаження файлів
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
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
 * Middleware для завантаження Excel файлів
 */
export const uploadExcel = upload.single('file');

/**
 * GET /api/price
 * Отримати поточний прайс-лист
 */
export const getPrice = async (req, res, next) => {
  try {
    const price = await priceService.getPrice();

    if (!price) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    res.json(price);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/price/history
 * Отримати історію змін прайсу
 */
export const getPriceHistory = async (req, res, next) => {
  try {
    const versions = await priceService.getPriceHistory();
    res.json({ versions });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/price/history/:id
 * Отримати конкретну версію прайсу
 */
export const getPriceVersion = async (req, res, next) => {
  try {
    const versionId = parseInt(req.params.id);
    const version = await priceService.getPriceVersion(versionId);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json(version);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/price/history/:id/restore
 * Відновити попередню версію прайсу
 */
export const restorePriceVersion = async (req, res, next) => {
  try {
    const versionId = parseInt(req.params.id);
    const price = await priceService.restorePriceVersion(versionId);

    res.json({
      success: true,
      data: JSON.parse(price.data),
      updatedAt: price.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/price
 * Оновити прайс-лист (auth required)
 */
export const updatePrice = async (req, res, next) => {
  try {
    const { data } = req.body;

    const validationError = priceService.validatePriceData(data);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const price = await priceService.updatePrice(data);

    res.json({
      data: JSON.parse(price.data),
      updatedAt: price.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/price/upload
 * Завантажити прайс з JSON даних (auth required)
 */
export const uploadPrice = async (req, res, next) => {
  try {
    const { data } = req.body;

    const validationError = priceService.validatePriceData(data);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const price = await priceService.uploadPrice(data);

    res.status(201).json({
      data: JSON.parse(price.data),
      updatedAt: price.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/price/parse-excel
 * Парсинг Excel файлу (попередній перегляд)
 */
export const parseExcelFile = async (req, res, next) => {
  try {
    // Використовуємо middleware напряму
    uploadExcel(req, res, async function (err) {
      if (err) {
        console.error('[Multer Error]', err);
        return res.status(400).json({ error: err.message });
      }

      console.log('[Parse Excel] File received:', req.file ? req.file.originalname : 'NO FILE');
      console.log('[Parse Excel] File size:', req.file?.size, 'bytes');
      console.log('[Parse Excel] File mimetype:', req.file?.mimetype);

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Парсинг Excel файлу
      const parsedData = await parsePriceExcel(req.file.buffer);

      console.log('[Parse Excel] Parsed data:', JSON.stringify(parsedData, null, 2));

      res.json(parsedData);
    });
  } catch (error) {
    console.error('[Parse Excel Error]', error);
    next(error);
  }
};

/**
 * POST /api/price/upload-excel
 * Завантажити прайс з Excel файлу (auth required)
 */
export const uploadPriceExcel = async (req, res, next) => {
  try {
    uploadExcel(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Парсинг Excel файлу
      const parsedData = await parsePriceExcel(req.file.buffer);

      console.log('[Upload] Parsed data:', JSON.stringify(parsedData, null, 2));

      // Перевірка на помилки парсингу
      if (parsedData.errors.length > 0) {
        return res.status(400).json({
          error: 'Parsing errors',
          details: parsedData.errors,
        });
      }

      // Перевірка чи є дані
      const totalItems =
        Object.keys(parsedData.supports || {}).length +
        Object.keys(parsedData.spans || {}).length +
        Object.keys(parsedData.vertical_supports || {}).length +
        Object.keys(parsedData.diagonal_brace || {}).length +
        Object.keys(parsedData.isolator || {}).length;

      if (totalItems === 0) {
        return res.status(400).json({
          error: 'No valid data found in file',
          details: 'File contains no valid price items',
        });
      }

      // Парсер вже повертає об'єкт з вкладеною структурою, тому просто використовуємо його
      const priceData = parsedData;

      console.log('[Upload] Saving price data with', totalItems, 'items');

      // Збереження прайсу
      const price = await priceService.uploadPrice(priceData);

      res.status(201).json({
        success: true,
        data: JSON.parse(price.data),
        updatedAt: price.updated_at,
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/price/export-excel
 * Експорт поточного прайсу в Excel (для завантаження та оновлення)
 * Формат: Код;Назва;Ціна без ПДВ;Категорія;Вага;Опис
 */
export const exportPriceExcel = async (req, res, next) => {
  try {
    const price = await priceService.getPrice();

    if (!price) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rack Calculator';
    workbook.created = new Date();
    workbook.lastModifiedBy = 'Rack Calculator System';

    const worksheet = workbook.addWorksheet('Прайс');

    // Налаштування стовпців - 6 колонок (як для імпорту)
    worksheet.columns = [
      { header: 'Код', key: 'code', width: 15 },
      { header: 'Назва', key: 'name', width: 60 },
      { header: 'Ціна без ПДВ', key: 'price', width: 15 },
      { header: 'Категорія', key: 'category', width: 20 },
      { header: 'Вага', key: 'weight', width: 12 },
      { header: 'Опис', key: 'description', width: 50 },
    ];

    // Стиль заголовка таблиці
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }, // Синій колір як в Excel
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Заморожуємо перший рядок
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Додаємо автофільтр
    worksheet.autoFilter = 'A1:F1';

    let rowCount = 2;

    const CATEGORY_ORDER = ['supports', 'spans', 'vertical_supports', 'diagonal_brace', 'isolator'];

    CATEGORY_ORDER.forEach((category) => {
      const items = price.data[category];

      if (!items) {
        return;
      }

      const entries = Object.entries(items);
      if (entries.length === 0) {
        return;
      }

      // Для опор — обробляємо вкладену структуру
      if (category === 'supports') {
        entries.forEach(([code, item]) => {
          const anyItem = item;

          // Крайня опора
          if (anyItem.edge) {
            worksheet.addRow({
              code: code,
              name: anyItem.edge.name || 'Опора крайня',
              price: anyItem.edge.price || '',
              category: 'supports',
              weight: anyItem.edge.weight !== null && anyItem.edge.weight !== undefined ? anyItem.edge.weight : '',
              description: anyItem.edge.description || anyItem.description || '',
            });

            // Форматування рядка
            const row = worksheet.getRow(rowCount);
            row.eachCell((cell) => {
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
          if (anyItem.intermediate) {
            worksheet.addRow({
              code: code,
              name: anyItem.intermediate.name || 'Проміжна опора',
              price: anyItem.intermediate.price || '',
              category: 'supports',
              weight:
                anyItem.intermediate.weight !== null && anyItem.intermediate.weight !== undefined
                  ? anyItem.intermediate.weight
                  : '',
              description: anyItem.intermediate.description || anyItem.description || '',
            });

            // Форматування рядка
            const row = worksheet.getRow(rowCount);
            row.eachCell((cell) => {
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
        entries.forEach(([code, item]) => {
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
          row.eachCell((cell) => {
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
  } catch (error) {
    next(error);
  }
};
