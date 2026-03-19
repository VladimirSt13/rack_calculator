import api from '@/lib/axios';

/**
 * Calculation Type
 */
export type CalculationType = 'rack' | 'battery';

/**
 * Calculation Input Data
 */
export interface CalculationInput {
  type: CalculationType;
  [key: string]: any;
}

/**
 * Calculation Result Data
 */
export interface CalculationResult {
  config?: any;
  components?: any[];
  totalCost?: number;
  [key: string]: any;
}

/**
 * Calculation
 */
export interface Calculation {
  id: number;
  userId: number;
  type: CalculationType;
  inputData: CalculationInput;
  resultData: CalculationResult;
  createdAt: string;
}

/**
 * Create Calculation DTO
 */
export interface CreateCalculationDto {
  type: CalculationType;
  inputData: CalculationInput;
  resultData: CalculationResult;
}

/**
 * Calculations API
 * Маршрути для управління розрахунками користувачів
 */
export const calculationsApi = {
  /**
   * Отримати розрахунки користувача з пагінацією
   * GET /api/calculations
   */
  getAll: async (params?: {
    type?: CalculationType;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ calculations: Calculation[]; pagination: any }> => {
    const { data } = await api.get('/calculations', { params });
    return {
      calculations: data.data?.calculations || [],
      pagination: data.data?.pagination || { total: 0, page: 0, limit: 0, totalPages: 0 },
    };
  },

  /**
   * Зберегти розрахунок користувача
   * POST /api/calculations
   */
  create: async (calculationData: CreateCalculationDto): Promise<Calculation> => {
    const { data } = await api.post('/calculations', calculationData);
    return data.data;
  },

  /**
   * Видалити розрахунок
   * DELETE /api/calculations/:id
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/calculations/${id}`);
  },
};

export default calculationsApi;
