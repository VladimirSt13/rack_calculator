import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { priceComponentsApi, type ComponentsResponse } from './priceComponentsApi';
import { useRackComponentsStore } from './componentsStore';
import { logger } from '@/lib/logger';

/**
 * Hook для завантаження комплектуючих з серверу
 */
export const useRackComponents = () => {
  const { setComponents, setLoading, setError } = useRackComponentsStore();

  const { data, isLoading, error } = useQuery<ComponentsResponse>({
    queryKey: ['rack-components'],
    queryFn: priceComponentsApi.getAll,
    retry: 1,
  });

  useEffect(() => {
    setLoading(isLoading);
    if (error) {
      setError((error as Error).message);
      logger.error('[useRackComponents] Error:', error);
    }
    if (data && data.components) {
      logger.debug('[useRackComponents] Data loaded:', data);
      setComponents({
        supports: data.components.supports || [],
        spans: data.components.spans || [],
        verticalSupports: data.components.verticalSupports || [],
      });
    }
  }, [data, isLoading, error, setComponents, setLoading, setError]);

  return {
    supports: data?.components?.supports || [],
    verticalSupports: data?.components?.verticalSupports || [],
    spans: data?.components?.spans || [],
    isLoading,
    error,
  };
};

export default useRackComponents;
