import { useCallback, useState } from 'react';
import { rackApi } from './rackApi';
import { useRackFormStore } from './formStore';
import { useRackSpansStore } from './spansStore';
import { useRackResultsStore } from './resultsStore';
import { CalculationLifecycleStatus } from '@/shared/layout';
import type { SpanItem } from '@rack-calculator/shared';
import { logger } from '@/lib/logger';

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

    if (spansState.spans.length === 0 || !spansState.spans.some((s: SpanItem) => s.item && s.quantity > 0)) {
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
      const validSpans = spansState.spans.filter((s: SpanItem) => s.item && s.quantity > 0);

      const rackConfig = {
        floors: formState.floors,
        rows: formState.rows,
        beamsPerRow: formState.beamsPerRow,
        supports: formState.supports,
        verticalSupports: formState.verticalSupports,
        spans: validSpans.map((s: SpanItem) => ({
          item: s.item,
          quantity: s.quantity,
        })),
      };

      // Call API - використовуємо старий API /rack/calculate
      const response = await rackApi.calculate(rackConfig);

      logger.info('[RackCalculator] API Response:', response);

      // Сервер повертає { success: true, data: {...} }
      const resultData = response.data || response;

      const result = {
        name: resultData.name || 'Розрахунок стелажа',
        tableHtml: '', // Will be generated in component
        components: resultData.components,
        prices: resultData.prices, // Зберігаємо всі ціни (3 типи)
        total: resultData.total,
        totalWithoutIsolators: resultData.totalWithoutIsolators || resultData.total * 0.9,
        zeroBase: resultData.zeroBase || resultData.total * 1.44,
        // Зберігаємо дані форми для редагування
        form: { ...formState },
        // Зберігаємо прольоти для підрахунку
        spans: validSpans.map((s: SpanItem) => ({
          item: s.item,
          quantity: s.quantity,
        })),
        // ID конфігурації в БД (поки що немає)
        rackConfigId: undefined,
      };

      resultsStore.setResult(result);
      setCalculationState('ready');
    } catch (error) {
      logger.error('[RackCalculator] Error:', error);
      const errorData = (error as any).response?.data;
      const errorMessage = errorData?.message || errorData?.error?.message || errorData?.error || 'Помилка розрахунку';
      resultsStore.setError(errorMessage);
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
