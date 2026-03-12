import api from '@/features/auth/authApi';
import type { RackSetItem } from './setStore';

export interface RackComponent {
  name: string;
  amount: number;
  price: number;
  total: number;
}

export interface RackSet {
  id: number;
  user_id: number;
  name: string;
  object_name?: string;
  description?: string;
  racks?: RackSetItem[];
  total_cost?: number; // Старе поле (для сумісності)
  total_cost_snapshot?: number; // Нове поле
  created_at: string;
  updated_at?: string;
  deleted_at?: string; // Для soft delete
}

export interface RackSetRevision {
  id: number;
  rack_set_id: number;
  comment?: string;
  total_cost_snapshot: number;
  created_at: string;
}

export interface RackItem {
  rackConfigId: number;
  quantity: number;
  spans?: Array<{ item: string; quantity: number }>; // Для battery page
}

/**
 * Сформувати назву файлу для експорту
 * Формат: {рікмісяць}_комплект стелажів_{об'єкт}_{назва}
 * @param rackSet - Дані комплекту
 * @param includePrices - Чи включати ціни
 */
export const getExportFilename = (
  rackSet: { name: string; object_name?: string; description?: string },
  includePrices: boolean = false,
): string => {
  const now = new Date();
  const yearMonth = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0');

  const name = rackSet.name?.trim() || 'без назви';
  const objectName = rackSet.object_name?.trim() || "без об'єкта";
  const description = rackSet.description?.trim() || '';

  // Формуємо назву: дата_комплект стелажів_об'єкт_назва_примітка
  const parts = [yearMonth, 'комплект стелажів', objectName, name];

  if (description) {
    parts.push(description);
  }

  if (includePrices) {
    parts.push('з цінами');
  }

  return parts.join('_') + '.xlsx';
};

/**
 * Завантажити Excel файл експорту комплекту в браузері
 * Формує назву файлу автоматично з даних комплекту
 * @param data - Дані файлу (arraybuffer від сервера)
 * @param rackSet - Дані комплекту для формування назви
 * @param includePrices - Чи включати ціни (для назви файлу)
 */
export const downloadRackSetExport = (
  data: ArrayBuffer,
  rackSet: { name: string; object_name?: string; description?: string },
  includePrices: boolean = false,
) => {
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const filename = getExportFilename(rackSet, includePrices);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const rackSetsApi = {
  /**
   * Отримати список комплектів стелажів
   */
  getAll: async () => {
    const { data } = await api.get('/rack-sets');
    return data as { rackSets: RackSet[] };
  },

  /**
   * Отримати конкретний комплект з деталями
   */
  getById: async (id: number) => {
    const { data } = await api.get(`/rack-sets/${id}`);
    return data as { rackSet: RackSet };
  },

  /**
   * Створити новий комплект стелажів
   */
  create: async (rackSetData: {
    name: string;
    object_name?: string;
    description?: string;
    racks?: RackSetItem[];
    rack_items?: RackItem[];
  }) => {
    const { data } = await api.post('/rack-sets', rackSetData);
    return data;
  },

  /**
   * Оновити існуючий комплект
   */
  update: async (
    id: number,
    rackSetData: {
      name?: string;
      object_name?: string;
      description?: string;
      racks?: RackSetItem[];
    },
  ) => {
    const { data } = await api.put(`/rack-sets/${id}`, rackSetData);
    return data;
  },

  /**
   * Видалити комплект стелажів (Soft Delete)
   */
  delete: async (id: number) => {
    const { data } = await api.delete(`/rack-sets/${id}`);
    return data;
  },

  /**
   * Отримати видалені комплекти стелажів
   */
  getDeleted: async () => {
    const { data } = await api.get('/rack-sets/deleted');
    return data as { rackSets: RackSet[] };
  },

  /**
   * Відновити видалений комплект стелажів
   */
  restore: async (id: number) => {
    const { data } = await api.post(`/rack-sets/${id}/restore`);
    return data;
  },

  /**
   * Створити ревізію комплекту
   */
  createRevision: async (id: number, comment?: string) => {
    const { data } = await api.post(`/rack-sets/${id}/revision`, { comment });
    return data;
  },

  /**
   * Отримати історію ревізій
   */
  getRevisions: async (id: number) => {
    const { data } = await api.get(`/rack-sets/${id}/revisions`);
    return data as { revisions: RackSetRevision[] };
  },

  /**
   * Експорт комплекту в Excel
   * @param id - ID комплекту
   * @param includePrices - Чи включати ціни
   */
  export: async (id: number, includePrices: boolean = false) => {
    const response = await api.get(`/rack-sets/${id}/export`, {
      params: { includePrices },
      responseType: 'arraybuffer',
    });
    return response.data;
  },

  /**
   * Експорт комплекту в Excel (для нового комплекту, ще не збереженого)
   * @param rack_items - Масив елементів комплекту {rackConfigId, quantity, spans?}
   * @param includePrices - Чи включати ціни
   */
  exportNew: async (rack_items: RackItem[], includePrices: boolean = false) => {
    const response = await api.post(
      '/rack-sets/export',
      { rack_items, includePrices },
      {
        responseType: 'arraybuffer',
      },
    );
    return response.data;
  },
};

export default rackSetsApi;
