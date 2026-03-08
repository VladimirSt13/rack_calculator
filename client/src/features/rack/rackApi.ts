import api from '@/features/auth/authApi';
import type { RackCalculationRequest, RackCalculationResponse } from '@/shared/types/api.types';

export const rackApi = {
  /**
   * Розрахунок стелажа (старий API, для сумісності)
   */
  calculate: async (config: RackCalculationRequest): Promise<RackCalculationResponse> => {
    const { data } = await api.post('/rack/calculate', config);
    return data;
  },

  /**
   * Знайти або створити конфігурацію стелажа (новий API)
   * @returns { rackConfigId, name, config, components, prices, totalCost }
   */
  findOrCreateConfiguration: async (config: {
    floors: number;
    rows: number;
    beamsPerRow: number;
    supports?: string;
    verticalSupports?: string;
    spans?: Array<{ item: string; quantity: number }>;
  }) => {
    const { data } = await api.post('/rack-configurations/find-or-create', config);
    return data;
  },

  /**
   * Масовий розрахунок стелажів
   */
  calculateBatch: async (racks: RackCalculationRequest[]) => {
    const { data } = await api.post('/rack/calculate-batch', { racks });
    return data;
  },
  
  /**
   * Розрахувати ціни для конфігурації за ID
   */
  calculatePricesForConfiguration: async (rackConfigId: number, quantity: number = 1) => {
    const { data } = await api.post(`/rack-configurations/${rackConfigId}/calculate-prices`, { quantity });
    return data;
  },
};

export default rackApi;
