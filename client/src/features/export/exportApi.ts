import api from '@/lib/axios';

/**
 * Export Rack Sets DTO
 */
export interface ExportRackSetsDto {
  rackSetIds: number[];
  includePrices: boolean;
}

/**
 * Export Prices DTO
 */
export interface ExportPricesDto {
  priceIds: number[];
}

/**
 * Export Calculations DTO
 */
export interface ExportCalculationsDto {
  calculationIds: number[];
}

/**
 * Export API
 * Маршрути для експорту даних в Excel
 */
export const exportApi = {
  /**
   * Експорт комплектів стелажів в Excel
   * POST /api/export/rack-sets
   * 
   * @param data - Дані для експорту
   * @returns ArrayBuffer з Excel файлом
   */
  exportRackSets: async (data: ExportRackSetsDto): Promise<ArrayBuffer> => {
    const response = await api.post('/export/rack-sets', data, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },

  /**
   * Експорт прайсів в Excel
   * POST /api/export/prices
   * 
   * @param data - Дані для експорту
   * @returns ArrayBuffer з Excel файлом
   */
  exportPrices: async (data: ExportPricesDto): Promise<ArrayBuffer> => {
    const response = await api.post('/export/prices', data, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },

  /**
   * Експорт розрахунків в Excel
   * POST /api/export/calculations
   * 
   * @param data - Дані для експорту
   * @returns ArrayBuffer з Excel файлом
   */
  exportCalculations: async (data: ExportCalculationsDto): Promise<ArrayBuffer> => {
    const response = await api.post('/export/calculations', data, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },

  /**
   * Завантажити Excel файл в браузері
   * 
   * @param data - ArrayBuffer з Excel файлом
   * @param filename - Ім'я файлу
   */
  downloadFile: (data: ArrayBuffer, filename: string): void => {
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default exportApi;
