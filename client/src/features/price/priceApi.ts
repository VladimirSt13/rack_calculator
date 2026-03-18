import api from '@/lib/axios';

/**
 * Типи компонентів прайсу
 */
export type PriceCategory = 'supports' | 'spans' | 'vertical_supports' | 'diagonal_brace' | 'isolator';

/**
 * Вкладена структура ціни (для опор)
 */
export interface PriceWithWeight {
  price: number;
  weight?: number | null;
}

/**
 * Позиція прайсу для опор (з edge/intermediate)
 */
export interface SupportPriceItem {
  name: string;
  edge: PriceWithWeight;
  intermediate: PriceWithWeight;
}

/**
 * Позиція прайсу для інших категорій (балки, верт. опори, ізолятори)
 */
export interface SimplePriceItem {
  name: string;
  price: number;
  weight?: number | null;
}

/**
 * Об'єднаний тип для позиції прайсу
 */
export type PriceItem = SupportPriceItem | SimplePriceItem;

/**
 * Перевірка чи є елемент опорою (з edge/intermediate)
 */
export const isSupportItem = (item: PriceItem): item is SupportPriceItem => {
  return 'edge' in item && 'intermediate' in item;
};

/**
 * Структура прайсу по категоріях
 */
export interface PriceData {
  supports: Record<string, SupportPriceItem>;
  spans: Record<string, SimplePriceItem>;
  vertical_supports: Record<string, SimplePriceItem>;
  diagonal_brace: Record<string, SimplePriceItem>;
  isolator: Record<string, SimplePriceItem>;
}

/**
 * Версія прайсу (для історії)
 */
export interface PriceVersion {
  id: number;
  created_at: string;
  created_by: string;
  items_count: number;
}

/**
 * Відповідь від сервера при отриманні прайсу
 */
export interface PriceResponse {
  data: PriceData;
  updatedAt: string;
}

/**
 * Відповідь при завантаженні нового прайсу
 */
export interface PriceUploadResponse {
  success: boolean;
  message?: string;
  data: PriceData;
  updatedAt: string;
}

/**
 * Відповідь при отриманні історії змін
 */
export interface PriceHistoryResponse {
  versions: PriceVersion[];
}

/**
 * API для роботи з прайсом
 */
export const priceApi = {
  /**
   * Отримати поточний прайс
   */
  getCurrent: async () => {
    try {
      const { data } = await api.get('/prices');
      return data.data;
    } catch (error: any) {
      // Якщо прайсу ще немає (404), повертаємо null
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Отримати історію змін прайсу
   */
  getHistory: async () => {
    try {
      const { data } = await api.get('/prices/history');
      return data.data;
    } catch (error: any) {
      // Якщо історії ще немає (404), повертаємо пустий масив
      if (error.response?.status === 404) {
        return { versions: [] };
      }
      throw error;
    }
  },

  /**
   * Завантажити новий прайс з Excel файлу
   * @param file - Excel файл (.xlsx)
   * @param onProgress - callback для прогресу завантаження
   */
  uploadExcel: async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/prices/upload-excel', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return data.data;
  },

  /**
   * Отримати конкретну версію прайсу
   */
  getVersion: async (versionId: number) => {
    const { data } = await api.get(`/prices/history/${versionId}`);
    return data.data;
  },

  /**
   * Відновити попередню версію прайсу (rollback)
   */
  restoreVersion: async (versionId: number) => {
    const { data } = await api.post(`/prices/history/${versionId}/restore`);
    return data.data;
  },

  /**
   * Оновити ціну в прайсі
   */
  updatePrice: async (priceData: PriceData) => {
    const { data } = await api.patch('/prices/current', { data: priceData });
    return data.data;
  },

  /**
   * Скачати поточний прайс у форматі Excel
   */
  downloadExcel: async () => {
    const { data, headers } = await api.get('/prices/export-excel', {
      responseType: 'blob',
    });

    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = headers['content-disposition'];
    let filename = 'price.xlsx';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default priceApi;
