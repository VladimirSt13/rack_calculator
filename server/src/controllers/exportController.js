import ExcelJS from 'exceljs';
import { getDb } from '../db/index.js';

/**
 * Форматування числа з комою як розділовим знаком
 */
const formatNumber = (num) => {
  return num.toString().replace('.', ',');
};

/**
 * Створити Excel worksheet з даними комплекту стелажів
 */
const createRackSetWorksheet = (workbook, title, racks, showPrices, additionalInfo = {}) => {
  const worksheet = workbook.addWorksheet('Комплект стелажів', {
    properties: { 
      defaultRowHeight: 18,
      defaultColWidth: 12
    }
  });

  // Налаштування сторінки
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3
    }
  };

  // Заголовок (рядок 1)
  worksheet.mergeCells('A1:F1');
  worksheet.getCell('A1').value = title;
  worksheet.getCell('A1').font = { bold: true, size: 16, name: 'Arial' };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 25;

  // Дата (рядок 2)
  if (additionalInfo.date) {
    worksheet.getCell('A2').value = 'Дата:';
    worksheet.getCell('A2').font = { italic: true };
    worksheet.getCell('B2').value = typeof additionalInfo.date === 'string' 
      ? additionalInfo.date 
      : new Date(additionalInfo.date).toLocaleDateString('uk-UA');
    worksheet.getRow(2).height = 20;
  }

  // Пустий рядок 3
  worksheet.getRow(3).height = 5;

  // Заголовок таблиці специфікації (рядок 4)
  const headerColumns = ['№', 'Назва стелажа', 'Кількість'];
  if (showPrices) {
    headerColumns.push('Ціна без\nізоляторів', 'Нульова\nціна', 'Загальна\nнульова ціна');
  }

  const headerRow = worksheet.getRow(4);
  headerRow.values = headerColumns;
  headerRow.font = { bold: true, size: 11, name: 'Arial' };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  
  // Сірий фон заголовка
  for (let col = 1; col <= headerColumns.length; col++) {
    headerRow.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    };
    headerRow.getCell(col).border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  }
  headerRow.height = 35;

  let currentRow = 5;
  let totalWithoutIsolators = 0;
  let totalZero = 0;

  // Дані по стелажах
  racks.forEach((rack, index) => {
    const quantity = rack.quantity || 1;
    const noIsolatorsPrice = rack.prices?.find((p) => p.type === 'без_ізоляторів' || p.type === 'no_isolators')?.value || 0;
    const zeroPrice = rack.prices?.find((p) => p.type === 'нульова' || p.type === 'zero')?.value || 0;
    const totalZeroPrice = zeroPrice * quantity;

    totalWithoutIsolators += noIsolatorsPrice * quantity;
    totalZero += totalZeroPrice;

    // Основний рядок стелажа
    const rowData = [index + 1, rack.name, quantity];
    if (showPrices) {
      rowData.push(
        formatNumber(noIsolatorsPrice.toFixed(2)),
        formatNumber(zeroPrice.toFixed(2)),
        formatNumber(totalZeroPrice.toFixed(2))
      );
    }

    const row = worksheet.getRow(currentRow);
    row.values = rowData;
    row.alignment = { vertical: 'middle' };
    row.getCell(2).alignment = { wrapText: true, vertical: 'middle' };
    row.getCell(2).font = { bold: true };
    
    // Межі для основного рядка
    for (let col = 1; col <= (showPrices ? 6 : 3); col++) {
      row.getCell(col).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    }
    row.height = 40;
    currentRow++;

    // Додати комплектацію стелажа
    if (rack.components && Object.keys(rack.components).length > 0) {
      // Рядок "Комплектація:"
      worksheet.getCell(`A${currentRow}`).value = 'Комплектація:';
      worksheet.getCell(`A${currentRow}`).font = { italic: true, size: 10 };
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      // Заголовок таблиці комплектації
      const compHeader = ['№', 'Назва компонента', 'К-сть\nна 1 од', 'Всього', 'Ціна', 'Сума'];
      const compHeaderRow = worksheet.getRow(currentRow);
      compHeaderRow.values = compHeader;
      compHeaderRow.font = { bold: true, size: 10, name: 'Arial' };
      compHeaderRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      
      // Сірий фон заголовка комплектації
      for (let col = 1; col <= 6; col++) {
        compHeaderRow.getCell(col).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
        compHeaderRow.getCell(col).border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      }
      compHeaderRow.height = 25;
      currentRow++;

      // Компоненти
      let compIndex = 1;
      Object.entries(rack.components).forEach(([category, items]) => {
        if (Array.isArray(items)) {
          items.forEach((item) => {
            const totalAmount = item.amount * quantity;
            const totalSum = item.total * quantity;

            const compRow = worksheet.getRow(currentRow);
            compRow.values = [
              compIndex++,
              item.name,
              item.amount,
              totalAmount,
              formatNumber(item.price.toFixed(2)),
              formatNumber(totalSum.toFixed(2))
            ];
            compRow.alignment = { vertical: 'middle' };
            compRow.getCell(2).alignment = { wrapText: true };
            
            // Межі для компонентів
            for (let col = 1; col <= 6; col++) {
              compRow.getCell(col).border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };
            }
            compRow.height = 20;
            currentRow++;
          });
        }
      });

      // Товста лінія після комплектації (відділення стелажів)
      const separatorRow = worksheet.getRow(currentRow);
      for (let col = 1; col <= 6; col++) {
        separatorRow.getCell(col).value = '';
        separatorRow.getCell(col).border = {
          bottom: { style: 'thick', color: { argb: 'FF000000' } }
        };
      }
      separatorRow.height = 5;
      currentRow++;
    }
  });

  // Підсумковий рядок "РАЗОМ:"
  const totalRow = worksheet.getRow(currentRow);
  totalRow.values = ['', 'РАЗОМ:', racks.reduce((sum, r) => sum + (r.quantity || 1), 0)];
  if (showPrices) {
    totalRow.values = [
      '',
      'РАЗОМ:',
      racks.reduce((sum, r) => sum + (r.quantity || 1), 0),
      formatNumber(totalWithoutIsolators.toFixed(2)),
      '',
      formatNumber(totalZero.toFixed(2))
    ];
  }
  totalRow.font = { bold: true, size: 11 };
  totalRow.alignment = { vertical: 'middle' };
  
  // Сірий фон для підсумкового рядка
  for (let col = 1; col <= (showPrices ? 6 : 3); col++) {
    totalRow.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }
    };
    totalRow.getCell(col).border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  }
  totalRow.height = 25;

  // Форматування стовпців
  worksheet.getColumn('A').width = 5;   // №
  worksheet.getColumn('B').width = 45;  // Назва стелажа
  worksheet.getColumn('C').width = 12;  // Кількість
  if (showPrices) {
    worksheet.getColumn('D').width = 18;  // Ціна без ізоляторів
    worksheet.getColumn('E').width = 18;  // Нульова ціна
    worksheet.getColumn('F').width = 20;  // Загальна нульова ціна
  }

  return { worksheet, totals: { totalWithoutIsolators, totalZero } };
};

/**
 * GET /api/rack-sets/:id/export
 * Експорт комплекту стелажів в Excel
 */
export const exportRackSet = async (req, res, next) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const userId = req.user.userId;
    const { includePrices } = req.query;
    const showPrices = includePrices === 'true';

    // Отримати комплект з БД
    const rackSet = db.prepare(`
      SELECT id, name, object_name, description, racks, total_cost, created_at
      FROM rack_sets
      WHERE id = ? AND user_id = ?
    `).get(id, userId);

    if (!rackSet) {
      return res.status(404).json({ error: 'Rack set not found' });
    }

    const racks = JSON.parse(rackSet.racks);

    // Створити новий workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rack Calculator';
    workbook.created = new Date();
    workbook.lastModifiedBy = 'Rack Calculator';
    workbook.modified = new Date();

    // Створити worksheet з даними
    createRackSetWorksheet(workbook, rackSet.name, racks, showPrices, {
      date: rackSet.created_at,
      total_quantity: racks.reduce((sum, r) => sum + (r.quantity || 1), 0),
      total_cost: rackSet.total_cost
    });

    // Генерация файла и отправка клиенту
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const filename = showPrices ? `${rackSet.name}_з_цінами.xlsx` : `${rackSet.name}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export default {
  exportRackSet,
};

/**
 * POST /api/rack-sets/export
 * Експорт нового комплекту стелажів в Excel
 */
export const exportNewRackSet = async (req, res, next) => {
  try {
    const { racks, includePrices = false } = req.body;
    const showPrices = includePrices === true;

    if (!racks || !Array.isArray(racks) || racks.length === 0) {
      return res.status(400).json({ error: 'Racks array is required' });
    }

    // Створити новий workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rack Calculator';
    workbook.created = new Date();
    workbook.lastModifiedBy = 'Rack Calculator';
    workbook.modified = new Date();

    // Створити worksheet з даними
    createRackSetWorksheet(workbook, 'Новий комплект стелажів', racks, showPrices, {
      date: new Date(),
      total_quantity: racks.reduce((sum, r) => sum + (r.quantity || 1), 0)
    });

    // Генерация файла и отправка клиенту
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const filename = showPrices ? 'новий_комплект_з_цінами.xlsx' : 'новий_комплект.xlsx';
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
