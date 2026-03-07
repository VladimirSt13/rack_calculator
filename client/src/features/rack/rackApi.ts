import api from '@/features/auth/authApi';

export const rackApi = {
  /**
   * Розрахунок стелажа
   */
  calculate: async (config: any) => {
    const { data } = await api.post('/rack/calculate', config);
    return data;
  },

  /**
   * Масовий розрахунок стелажів
   */
  calculateBatch: async (racks: any[]) => {
    const { data } = await api.post('/rack/calculate-batch', { racks });
    return data;
  },
};

export default rackApi;
