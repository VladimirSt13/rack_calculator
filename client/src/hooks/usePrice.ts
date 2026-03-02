import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axios from '../lib/axios';

export interface PriceData {
  supports: Record<string, any>;
  spans: Record<string, any>;
  vertical_supports: Record<string, any>;
  diagonal_brace: Record<string, any>;
  isolator: Record<string, any>;
}

export interface PriceResponse {
  data: PriceData;
  updatedAt: string;
}

/**
 * Отримати прайс-лист
 */
export const usePrice = (options?: Omit<UseQueryOptions<PriceResponse>, 'queryKey' | 'queryFn'>) => {
  return useQuery<PriceResponse>({
    queryKey: ['price'],
    queryFn: async () => {
      const { data } = await axios.get('/price');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 хвилин
    ...options,
  });
};

/**
 * Оновити прайс-лист
 */
export const useUpdatePrice = (options?: UseMutationOptions<PriceResponse, Error, PriceData>) => {
  return useMutation<PriceResponse, Error, PriceData>({
    mutationFn: async (priceData) => {
      const { data } = await axios.put('/price', { data: priceData });
      return data;
    },
    ...options,
  });
};

/**
 * Завантажити прайс з файлу
 */
export const useUploadPrice = (options?: UseMutationOptions<PriceResponse, Error, PriceData>) => {
  return useMutation<PriceResponse, Error, PriceData>({
    mutationFn: async (priceData) => {
      const { data } = await axios.post('/price/upload', { data: priceData });
      return data;
    },
    ...options,
  });
};
