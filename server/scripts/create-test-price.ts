import ExcelJS from 'exceljs';

/**
 * Скрипт для створення тестового Excel файлу з прайсом
 * Використання: npx tsx scripts/create-test-price.ts
 */

const priceData = [
  // Заголовок
  ['Код', 'Назва', 'Ціна без ПДВ', 'Категорія', 'Вага', 'Опис'],
  
  // Опори (supports)
  ['215', '215 кр', 600.00, 'supports', 2.00, 'Крайня опора 1-рядного стелажа, 215мм'],
  ['215', '215 пром', 620.00, 'supports', 2.05, 'Проміжна опора 1-рядного стелажа, 215мм'],
  ['290', '290 кр', 780.00, 'supports', 2.60, 'Крайня опора 1-рядного стелажа, 290мм'],
  ['290', '290 пром', 800.00, 'supports', 2.65, 'Проміжна опора 1-рядного стелажа, 290мм'],
  ['430', '430 кр', 930.00, 'supports', 3.27, 'Крайня опора 2-рядного стелажа, 430мм'],
  ['430', '430 пром', 980.00, 'supports', 3.33, 'Проміжна опора 2-рядного стелажа, 430мм'],
  ['580', '580 кр', 1020.00, 'supports', 3.90, 'Крайня опора 2-рядного стелажа, 580мм'],
  ['580', '580 пром', 1070.00, 'supports', 3.95, 'Проміжна опора 2-рядного стелажа, 580мм'],
  ['645', '645 кр', 1240.00, 'supports', 4.30, 'Крайня опора 2-рядного стелажа, 645мм'],
  ['645', '645 пром', 1290.00, 'supports', 4.35, 'Проміжна опора 2-рядного стелажа, 645мм'],
  ['860', '860 кр', 1230.00, 'supports', 5.70, 'Крайня опора 3-рядного стелажа, 860мм'],
  ['860', '860 пром', 1270.00, 'supports', 5.75, 'Проміжна опора 3-рядного стелажа, 860мм'],
  ['1190', '1190 кр', 1400.00, 'supports', null, 'Крайня опора 3-рядного стелажа, 1190мм'],
  ['1190', '1190 пром', 1440.00, 'supports', null, 'Проміжна опора 3-рядного стелажа, 1190мм'],
  ['430C', '430C кр', 1140.00, 'supports', 3.90, 'Крайня опора 2-рядного ступінчатого стелажа, 430мм'],
  ['430C', '430C пром', 1190.00, 'supports', 3.95, 'Проміжна опора 2-рядного ступінчатого стелажа, 430мм'],
  ['580C', '580C кр', 1380.00, 'supports', 4.65, 'Крайня опора 2-рядного ступінчатого стелажа, 580мм'],
  ['580C', '580C пром', 1420.00, 'supports', 4.70, 'Проміжна опора 2-рядного ступінчатого стелажа, 580мм'],
  ['645C', '645C кр', 1730.00, 'supports', null, 'Крайня опора 2-рядного ступінчатого стелажа, 645мм'],
  ['645C', '645C пром', 1980.00, 'supports', null, 'Проміжна опора 2-рядного ступінчатого стелажа, 645мм'],
  
  // Балки (spans)
  ['600', '600', 500.00, 'spans', 1.60, 'Траверса, h/с-профіль, 600мм'],
  ['750', '750', 630.00, 'spans', 2.10, 'Траверса, h/с-профіль, 750мм'],
  ['900', '900', 730.00, 'spans', 2.56, 'Траверса, h/с-профіль, 900мм'],
  ['950', '950', 750.00, 'spans', 2.70, 'Траверса, h/с-профіль, 950мм'],
  ['1000', '1000', 790.00, 'spans', 2.83, 'Траверса, h/с-профіль, 1000мм'],
  ['1050', '1050', 810.00, 'spans', null, 'Траверса, h/с-профіль, 1050мм'],
  ['1200', '1200', 870.00, 'spans', 3.40, 'Траверса, h/с-профіль, 1200мм'],
  ['1500', '1500', 980.00, 'spans', 4.28, 'Траверса, h/с-профіль, 1500мм'],
  
  // Вертикальні опори (vertical_supports)
  ['632', '632', 630.00, 'vertical_supports', 1.80, 'Вертикальна опора, 632мм'],
  ['1190', '1190', 1150.00, 'vertical_supports', 3.40, 'Вертикальна опора, 1190мм'],
  ['1500', '1500', 1450.00, 'vertical_supports', 4.30, 'Траверса, h/с-профіль, 1500мм'],
  ['2000', '2000', 1930.00, 'vertical_supports', 5.70, 'Траверса, h/с-профіль, 2000мм'],
  
  // Розкоси (diagonal_brace)
  ['diagonal_brace', 'Розкос', 380.00, 'diagonal_brace', 1.00, 'Розкос багатоповерхового стелажа'],
  
  // Ізолятори (isolator)
  ['isolator', 'Ізолятор', 69.00, 'isolator', 0.10, 'Ізолятор опори одноповерхового стелажа'],
];

async function createTestPriceExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Rack Calculator';
  workbook.created = new Date();
  workbook.lastModifiedBy = 'Rack Calculator System';

  const worksheet = workbook.addWorksheet('Прайс');

  // Налаштування стовпців
  worksheet.columns = [
    { header: 'Код', key: 'code', width: 15 },
    { header: 'Назва', key: 'name', width: 60 },
    { header: 'Ціна без ПДВ', key: 'price', width: 15 },
    { header: 'Категорія', key: 'category', width: 20 },
    { header: 'Вага', key: 'weight', width: 12 },
    { header: 'Опис', key: 'description', width: 50 },
  ];

  // Стиль заголовка
  worksheet.getRow(1).font = {
    bold: true,
    size: 12,
    color: { argb: 'FFFFFFFF' },
  };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
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

  // Додаємо дані
  priceData.forEach((row, index) => {
    if (index === 0) return; // Пропускаємо заголовок
    
    const worksheetRow = worksheet.addRow(row);
    worksheetRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      };
    });
    worksheetRow.height = 20;
  });

  // Форматування цін і ваги
  const rowCount = priceData.length;
  for (let i = 2; i <= rowCount; i++) {
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
  const totalRowNum = rowCount + 1;
  worksheet.addRow([]);
  const totalRow = worksheet.getRow(totalRowNum);
  totalRow.getCell(1).value = `Всього позицій: ${rowCount - 1}`;
  totalRow.getCell(1).font = { bold: true, size: 11 };
  totalRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0F0F0' },
  };
  totalRow.height = 25;
  worksheet.mergeCells(totalRowNum, 1, totalRowNum, 6);

  // Збереження файлу
  const fileName = 'test_price.xlsx';
  await workbook.xlsx.writeFile(fileName);
  
  console.log(`✅ Тестовий прайс створено: ${fileName}`);
  console.log(`📊 Всього позицій: ${rowCount - 1}`);
}

createTestPriceExcel().catch(console.error);
