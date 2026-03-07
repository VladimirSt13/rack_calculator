import api from '@/features/auth/authApi';

export const batteryApi = {
  /**
   * Розрахунок стелажа по батареї
   */
  calculate: async (batteryDimensions: any, weight: number, quantity: number, config: any) => {
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
  findBest: async (batteryDimensions: any, weight: number, quantity: number) => {
    const { data } = await api.post('/battery/find-best', {
      batteryDimensions,
      weight,
      quantity,
    });
    return data;
  },
};

export default batteryApi;
