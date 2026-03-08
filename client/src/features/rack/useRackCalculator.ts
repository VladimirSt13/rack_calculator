import { useCallback, useState } from 'react';
import { rackApi } from './rackApi';
import { useRackFormStore } from './formStore';
import { useRackSpansStore } from './spansStore';
import { useRackResultsStore } from './resultsStore';
import { CalculationLifecycleStatus } from '@/shared/layout';

/**
 * Hook для розрахунку стелажа
 *
 * Manual calculation:
 * - idle: початковий стан
 * - calculating: триває розрахунок
 * - ready: розрахунок завершено
 */
export const useRackCalculator = () => {
  const formState = useRackFormStore();
  const spansState = useRackSpansStore();
  const resultsStore = useRackResultsStore();
  const [calculationState, setCalculationState] = useState<CalculationLifecycleStatus>('idle');

  const calculate = useCallback(async () => {
    // Validation
    if (!formState.supports || !formState.rows || !formState.floors || !formState.beamsPerRow) {
      resultsStore.setError("Заповніть всі обов'язкові поля");
      setCalculationState('idle');
      return;
    }

    if (spansState.spans.length === 0 || !spansState.spans.some((s: any) => s.item && s.quantity > 0)) {
      resultsStore.setError('Додайте хоча б один проліт');
      setCalculationState('idle');
      return;
    }

    if (formState.floors > 1 && !formState.verticalSupports) {
      resultsStore.setError('Оберіть вертикальну опору');
      setCalculationState('idle');
      return;
    }

    resultsStore.setLoading(true);
    setCalculationState('calculating');

    try {
      // Prepare data for API
      const validSpans = spansState.spans.filter((s: any) => s.item && s.quantity > 0);

      const rackConfig = {
        floors: formState.floors,
        rows: formState.rows,
        beamsPerRow: formState.beamsPerRow,
        supports: formState.supports,
        verticalSupports: formState.verticalSupports,
        spans: validSpans.map((s: any) => ({
          item: s.item,
          quantity: s.quantity,
        })),
      };

      // Call API - новий метод з findOrCreateConfiguration
      const response = await rackApi.findOrCreateConfiguration(rackConfig);

      const result = {
        name: response.name,
        tableHtml: '', // Will be generated in component
        components: response.components,
        prices: response.prices, // Зберігаємо всі ціни (3 типи)
        total: response.totalCost,
        totalWithoutIsolators: response.totalCost * 0.9, // приклад
        zeroBase: response.totalCost * 1.44,
        // Зберігаємо дані форми для редагування
        form: { ...formState },
        // Зберігаємо прольоти для підрахунку
        spans: validSpans.map((s: any) => ({
          item: s.item,
          quantity: s.quantity,
        })),
        // ID конфігурації в БД
        rackConfigId: response.rackConfigId,
      };

      resultsStore.setResult(result as any);
      setCalculationState('ready');
    } catch (error: any) {
      console.error('[RackCalculator] Error:', error);
      resultsStore.setError(error.response?.data?.error || 'Помилка розрахунку');
      setCalculationState('idle');
    }
  }, [formState, spansState.spans, resultsStore]);

  return {
    calculate,
    isLoading: resultsStore.isLoading,
    error: resultsStore.error,
    result: resultsStore.result,
    calculationState,
  };
};

export default useRackCalculator;
