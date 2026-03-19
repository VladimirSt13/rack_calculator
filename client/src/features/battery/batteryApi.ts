import api from '@/features/auth/authApi';
import type { BatteryCalculationRequest, BatteryFindBestResponse } from '@/shared/types/api.types';

/**
 * Battery Dimensions
 */
export interface BatteryDimensions {
  length: number; // Довжина батареї (мм)
  width: number; // Ширина батареї (мм)
  height: number; // Висота батареї (мм)
  gap?: number; // Зазор між батареями (мм)
}

/**
 * Battery Calculation Result
 */
export interface BatteryCalculationResult {
  variants: Array<{
    rackConfigId: number;
    config: {
      length: number;
      width: number;
      height: number;
      gap?: number;
    };
    components: Array<{
      name: string;
      amount: number;
      price: number;
      total: number;
    }>;
    prices: {
      rack: Array<{ id: number; name: string; price: number }>;
      battery: Array<{ id: number; name: string; price: number }>;
    };
    totalCost: number;
    requiredLength: number;
  }>;
  message?: string;
}

/**
 * Battery Info
 */
export interface BatteryInfo {
  id: number;
  model: string;
  name: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  capacity?: string;
}

export const batteryApi = {
  /**
   * Розрахунок стелажа по батареї
   * POST /api/battery/calculate
   *
   * @param batteryDimensions - Розміри батареї
   * @param weight - Вага батареї (кг)
   * @param quantity - Кількість батарей
   * @param config - Додаткова конфігурація
   */
  calculate: async (
    batteryDimensions: BatteryDimensions,
    weight: number,
    quantity: number,
    config?: { format?: string; floors?: number; rows?: number; supportType?: string },
  ): Promise<BatteryCalculationResult> => {
    const { data } = await api.post('/battery/calculate', {
      batteryDimensions,
      weight,
      quantity,
      config,
    });
    return data.data;
  },

  /**
   * Отримати список акумуляторів
   * GET /api/battery/list
   */
  getBatteries: async (): Promise<BatteryInfo[]> => {
    const { data } = await api.get('/battery/list');
    return data.data?.batteries || [];
  },

  /**
   * Отримати акумулятор за моделлю
   * GET /api/battery/:model
   */
  getBatteryByModel: async (model: string): Promise<BatteryInfo | null> => {
    const { data } = await api.get(`/battery/${model}`);
    return data.data || null;
  },

  /**
   * Підбір найкращого варіанту стелажа (legacy, для сумісності)
   * @deprecated Використовуйте calculate() з config.floors/config.rows
   */
  findBest: async (
    batteryDimensions: BatteryDimensions,
    weight: number,
    quantity: number,
    config?: { floors?: number; rows?: number; supportType?: string },
  ): Promise<BatteryCalculationResult> => {
    console.warn('findBest deprecated - use calculate() with config instead');
    // findBest використовує той самий endpoint що і calculate
    return await batteryApi.calculate(batteryDimensions, weight, quantity, config);
  },
};

export default batteryApi;
