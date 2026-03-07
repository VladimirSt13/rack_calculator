import ExcelJS from 'exceljs';
import { getDb } from '../db/index.js';

/**
 * GET /api/rack-sets/:id/export
 * Експорт комплекту стелажів в Excel
 */
export const exportRackSet = async (req, res, next) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const userId = req.user.userId;

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

    // === Аркуш 1: Загальна інформація ===
    const summarySheet = workbook.addWorksheet('Загальна інформація');
    
    // Заголовок
    summarySheet.mergeCells('A1:F1');
    summarySheet.getCell('A1').value = rackSet.name;
    summarySheet.getCell('A1').font = { bold: true, size: 16 };
    summarySheet.getCell('A1').alignment = { horizontal: 'center' };

    // Інформація про об'єкт
    if (rackSet.object_name) {
      summarySheet.addRow(['Об\'єкт:', rackSet.object_name]);
    }
    if (rackSet.description) {
      summarySheet.addRow(['Опис:', rackSet.description]);
    }
    summarySheet.addRow(['Дата створення:', new Date(rackSet.created_at).toLocaleDateString('uk-UA')]);
    summarySheet.addRow(['Кількість стелажів:', racks.reduce((sum, r) => sum + (r.quantity || 1), 0)]);
    summarySheet.addRow(['Загальна вартість:', `${rackSet.total_cost.toFixed(2)} ₴`]);

    // Форматування
    summarySheet.getColumn('A').width = 25;
    summarySheet.getColumn('B').width = 40;
    summarySheet.getRow(1).height = 30;

    // === Аркуш 2: Специфікація ===
    const specsSheet = workbook.addWorksheet('Специфікація');

    // Заголовок таблиці
    specsSheet.addRow(['№', 'Назва стелажа', 'Кількість', 'Ціна без ізоляторів', 'Нульова ціна', 'Загальна нульова ціна']);
    const headerRow = specsSheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    let totalWithoutIsolators = 0;
    let totalZero = 0;

    // Дані по стелажах
    racks.forEach((rack, index) => {
      const quantity = rack.quantity || 1;
      
      // Отримати ціни з prices масиву
      const noIsolatorsPrice = rack.prices?.find((p) => p.type === 'без_ізоляторів' || p.type === 'no_isolators')?.value || 0;
      const zeroPrice = rack.prices?.find((p) => p.type === 'нульова' || p.type === 'zero')?.value || 0;
      const totalZeroPrice = zeroPrice * quantity;

      totalWithoutIsolators += noIsolatorsPrice * quantity;
      totalZero += totalZeroPrice;

      specsSheet.addRow([
        index + 1,
        rack.name,
        quantity,
        noIsolatorsPrice.toFixed(2),
        zeroPrice.toFixed(2),
        totalZeroPrice.toFixed(2)
      ]);
    });

    // Підсумковий рядок
    const totalRow = specsSheet.addRow([
      '',
      'РАЗОМ:',
      racks.reduce((sum, r) => sum + (r.quantity || 1), 0),
      totalWithoutIsolators.toFixed(2),
      '',
      totalZero.toFixed(2)
    ]);
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }
    };

    // Форматування стовпців
    specsSheet.getColumn('A').width = 5;
    specsSheet.getColumn('B').width = 50;
    specsSheet.getColumn('C').width = 12;
    specsSheet.getColumn('D').width = 20;
    specsSheet.getColumn('E').width = 20;
    specsSheet.getColumn('F').width = 22;

    // === Аркуш 3: Деталізація по стелажах ===
    racks.forEach((rack, rackIndex) => {
      const rackSheet = workbook.addWorksheet(`Стелаж ${rackIndex + 1}`);
      const quantity = rack.quantity || 1;

      // Назва стелажа
      rackSheet.mergeCells('A1:D1');
      rackSheet.getCell('A1').value = `${rack.name} (к-сть: ${quantity})`;
      rackSheet.getCell('A1').font = { bold: true, size: 14 };

      // Отримати ціни
      const basePrice = rack.prices?.find((p) => p.type === 'базова' || p.type === 'base')?.value || 0;
      const noIsolatorsPrice = rack.prices?.find((p) => p.type === 'без_ізоляторів' || p.type === 'no_isolators')?.value || 0;
      const zeroPrice = rack.prices?.find((p) => p.type === 'нульова' || p.type === 'zero')?.value || 0;

      // Ціни
      rackSheet.addRow([]);
      rackSheet.addRow(['Базова ціна:', `${basePrice.toFixed(2)} ₴`]);
      rackSheet.addRow(['Ціна без ізоляторів:', `${noIsolatorsPrice.toFixed(2)} ₴`]);
      rackSheet.addRow(['Нульова ціна:', `${zeroPrice.toFixed(2)} ₴`]);
      rackSheet.addRow(['Загальна нульова ціна позиції:', `${(zeroPrice * quantity).toFixed(2)} ₴`]);

      // Комплектація
      rackSheet.addRow([]);
      rackSheet.addRow(['Комплектація:']);
      rackSheet.addRow(['№', 'Назва', 'К-сть на 1 од', 'Всього', 'Ціна', 'Сума']);
      
      const compHeaderRow = rackSheet.getRow(rackSheet.lastRow.number);
      compHeaderRow.font = { bold: true };
      compHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Компоненти
      let compIndex = 1;
      if (rack.components) {
        Object.entries(rack.components).forEach(([category, items]) => {
          if (Array.isArray(items)) {
            items.forEach((item) => {
              const totalAmount = item.amount * quantity;
              const totalSum = item.total * quantity;
              
              rackSheet.addRow([
                compIndex++,
                item.name,
                item.amount,
                totalAmount,
                item.price.toFixed(2),
                totalSum.toFixed(2)
              ]);
            });
          }
        });
      }

      // Форматування
      rackSheet.getColumn('A').width = 5;
      rackSheet.getColumn('B').width = 35;
      rackSheet.getColumn('C').width = 15;
      rackSheet.getColumn('D').width = 15;
      rackSheet.getColumn('E').width = 12;
      rackSheet.getColumn('F').width = 15;
    });

    // Генерация файла и отправка клиенту
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(rackSet.name)}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export default {
  exportRackSet,
};
