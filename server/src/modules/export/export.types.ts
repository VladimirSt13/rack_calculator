/**
 * Вхідні дані для експорту комплекту стелажів
 */
export interface ExportRackSetInput {
  rackSetId: string;
  includePrices?: boolean;
  includeComponents?: boolean;
  userId: string;
}

/**
 * Вхідні дані для експорту прайсу
 */
export interface ExportPriceInput {
  category?: string;
  includeComponents?: boolean;
}

/**
 * Вхідні дані для експорту розрахунку
 */
export interface ExportCalculationInput {
  calculationId: string;
  includeDetails?: boolean;
  userId: string;
}

/**
 * Результат експорту
 */
export interface ExportResult {
  success: boolean;
  fileName: string;
  fileSize: number;
  buffer: any;
  mimeType: string;
}

/**
 * Дані для експорту комплекту
 */
export interface RackSetExportData {
  rackSetName: string;
  description?: string;
  revision: number;
  userName: string;
  createdAt: Date;
  racks: any[];
  prices?: any;
}
