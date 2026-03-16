import ExcelJS from 'exceljs';
import { ExportRackSetInput, ExportPriceInput, ExportResult, RackSetExportData } from './export.types';

/**
 * Export Service
 * Відповідає за бізнес-логіку експорту даних в Excel
 */
export class ExportService {
  /**
   * Експортувати комплект стелажів в Excel
   */
  async exportRackSet(input: ExportRackSetInput): Promise<ExportResult> {
    const { rackSetId, includePrices } = input;

    // Тут має бути отримання даних з репозиторію
    // Для прикладу створюємо тестові дані
    const data: RackSetExportData = {
      rackSetName: `Rack Set ${rackSetId}`,
      description: 'Test rack set',
      revision: 1,
      userName: 'User',
      createdAt: new Date(),
      racks: [],
      prices: includePrices ? {} : undefined,
    };

    // Створення Excel файлу
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rack Calculator';
    workbook.created = new Date();

    // Додати аркуш з інформацією про комплект
    const infoSheet = workbook.addWorksheet('Information');
    infoSheet.addRow(['Rack Set Name', data.rackSetName]);
    infoSheet.addRow(['Description', data.description || '']);
    infoSheet.addRow(['Revision', data.revision]);
    infoSheet.addRow(['Created By', data.userName]);
    infoSheet.addRow(['Created At', data.createdAt.toISOString()]);

    // Додати аркуш зі стелажами
    const racksSheet = workbook.addWorksheet('Racks');
    racksSheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Rows', key: 'rows', width: 10 },
      { header: 'Columns', key: 'columns', width: 10 },
      { header: 'Levels', key: 'levels', width: 10 },
      { header: 'Components', key: 'components', width: 50 },
    ];

    // Додати дані про стелажі
    data.racks.forEach((rack) => {
      racksSheet.addRow(rack);
    });

    // Додати аркуш з цінами (якщо потрібно)
    if (includePrices) {
      const pricesSheet = workbook.addWorksheet('Prices');
      pricesSheet.columns = [
        { header: 'Component', key: 'component', width: 30 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Total', key: 'total', width: 15 },
      ];
    }

    // Генерація буферу
    const buffer = (await workbook.xlsx.writeBuffer()) as any;

    return {
      success: true,
      fileName: `rack-set-${rackSetId}-${Date.now()}.xlsx`,
      fileSize: (buffer as Buffer).length,
      buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  /**
   * Експортувати прайс-лист в Excel
   */
  async exportPrice(input: ExportPriceInput): Promise<ExportResult> {
    const { category, includeComponents } = input;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rack Calculator';
    workbook.created = new Date();

    // Додати аркуш з прайсом
    const priceSheet = workbook.addWorksheet('Price List');
    priceSheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Name', key: 'name', width: 40 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Unit', key: 'unit', width: 10 },
    ];

    // Стилізація заголовка
    priceSheet.getRow(1).font = { bold: true };
    priceSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE082' },
    };

    // Додати компоненти (якщо потрібно)
    if (includeComponents) {
      const componentsSheet = workbook.addWorksheet('Components');
      componentsSheet.columns = [
        { header: 'Name', key: 'name', width: 40 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Price', key: 'price', width: 15 },
      ];
    }

    const buffer = (await workbook.xlsx.writeBuffer()) as any;

    return {
      success: true,
      fileName: `price-list-${category || 'all'}-${Date.now()}.xlsx`,
      fileSize: (buffer as Buffer).length,
      buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  /**
   * Експортувати розрахунок в Excel
   */
  async exportCalculation(calculationId: string, includeDetails: boolean = false): Promise<ExportResult> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rack Calculator';
    workbook.created = new Date();

    // Додати аркуш з інформацією
    const infoSheet = workbook.addWorksheet('Calculation');
    infoSheet.addRow(['Calculation ID', calculationId]);
    infoSheet.addRow(['Date', new Date().toISOString()]);

    if (includeDetails) {
      const detailsSheet = workbook.addWorksheet('Details');
      detailsSheet.columns = [
        { header: 'Parameter', key: 'parameter', width: 30 },
        { header: 'Value', key: 'value', width: 30 },
      ];
    }

    const buffer = (await workbook.xlsx.writeBuffer()) as any;

    return {
      success: true,
      fileName: `calculation-${calculationId}-${Date.now()}.xlsx`,
      fileSize: (buffer as Buffer).length,
      buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}

export default ExportService;
