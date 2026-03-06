import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axios from '@/lib/axios';

export interface Calculation {
  id: number;
  name: string | null;
  type: 'rack' | 'battery';
  data: Record<string, any>;
  created_at: string;
}

export interface CalculationsResponse {
  calculations: Calculation[];
}

export interface CalculationResponse {
  calculation: Calculation;
}

/**
 * Отримати список розрахунків
 */
export const useCalculations = (
  type?: 'rack' | 'battery',
  options?: Omit<UseQueryOptions<CalculationsResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CalculationsResponse>({
    queryKey: ['calculations', type],
    queryFn: async () => {
      const params = type ? { type } : {};
      const { data } = await axios.get('/calculations', { params });
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 хвилини
    ...options,
  });
};

/**
 * Отримати конкретний розрахунок
 */
export const useCalculation = (
  id: number | null,
  options?: Omit<UseQueryOptions<CalculationResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CalculationResponse>({
    queryKey: ['calculations', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const { data } = await axios.get(`/calculations/${id}`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

/**
 * Зберегти новий розрахунок
 */
export const useCreateCalculation = (
  options?: UseMutationOptions<Calculation, Error, { name?: string; type: 'rack' | 'battery'; data: Record<string, any> }>
) => {
  return useMutation<Calculation, Error, { name?: string; type: 'rack' | 'battery'; data: Record<string, any> }>({
    mutationFn: async (calculationData) => {
      const { data } = await axios.post('/calculations', calculationData);
      return data;
    },
    ...options,
  });
};

/**
 * Видалити розрахунок
 */
export const useDeleteCalculation = (options?: UseMutationOptions<number, Error, number>) => {
  return useMutation<number, Error, number>({
    mutationFn: async (id) => {
      await axios.delete(`/calculations/${id}`);
      return id;
    },
    ...options,
  });
};
