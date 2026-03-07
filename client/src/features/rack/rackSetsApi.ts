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
  total_cost: number;
  created_at: string;
  updated_at?: string;
}

export interface RackSetRevision {
  id: number;
  rack_set_id: number;
  comment?: string;
  total_cost_snapshot: number;
  created_at: string;
}

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
    racks: RackSetItem[];
  }) => {
    const { data } = await api.post('/rack-sets', rackSetData);
    return data;
  },

  /**
   * Оновити існуючий комплект
   */
  update: async (id: number, rackSetData: {
    name?: string;
    object_name?: string;
    description?: string;
    racks?: RackSetItem[];
  }) => {
    const { data } = await api.put(`/rack-sets/${id}`, rackSetData);
    return data;
  },

  /**
   * Видалити комплект стелажів
   */
  delete: async (id: number) => {
    const { data } = await api.delete(`/rack-sets/${id}`);
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
   * @param racks - Масив стелажів
   * @param includePrices - Чи включати ціни
   */
  exportNew: async (racks: RackSetItem[], includePrices: boolean = false) => {
    const response = await api.post('/rack-sets/export', { racks, includePrices }, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },
};

export default rackSetsApi;
