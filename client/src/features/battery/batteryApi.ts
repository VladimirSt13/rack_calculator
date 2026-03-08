import api from '@/features/auth/authApi';
import type { BatteryCalculationRequest, BatteryCalculationResponse, BatteryVariantDto } from '@/shared/types/api.types';

export const batteryApi = {
  /**
   * Розрахунок стелажа по батареї
   */
  calculate: async (
    batteryDimensions: BatteryCalculationRequest['batteryDimensions'],
    weight: number,
    quantity: number,
    config?: { format?: string }
  ): Promise<BatteryCalculationResponse> => {
    const { data } = await api.post('/battery/calculate', {
      batteryDimensions,
      weight,
      quantity,
      config,
    });
    return data;
  },

  /**
   * Підбір найкращого варіанту стелажа по батареї
   */
  findBest: async (
    batteryDimensions: BatteryCalculationRequest['batteryDimensions'],
    weight: number,
    quantity: number
  ): Promise<{ variants: BatteryVariantDto[]; bestMatch?: unknown }> => {
    const { data } = await api.post('/battery/find-best', {
      batteryDimensions,
      weight,
      quantity,
    });
    return data;
  },
};

export default batteryApi;
