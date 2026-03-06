import { useCallback, useState } from 'react';
import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateRackName,
} from '../../shared/core/rackCalculator';
import { useRackFormStore } from './formStore';
import { useRackSpansStore } from './spansStore';
import { useRackResultsStore } from './resultsStore';
import { CalculationLifecycleStatus } from '../../shared/layout';

interface UseRackCalculatorProps {
  priceData?: any;
}

/**
 * Hook для розрахунку стелажа
 * 
 * Live recalculation states:
 * - idle: початковий стан
 * - editing: користувач змінив параметри
 * - calculating: триває розрахунок
 * - ready: розрахунок завершено
 */
export const useRackCalculator = ({ priceData }: UseRackCalculatorProps) => {
  const formState = useRackFormStore();
  const spansState = useRackSpansStore();
  const resultsStore = useRackResultsStore();
  const [calculationState, setCalculationState] = useState<CalculationLifecycleStatus>('idle');

  const calculate = useCallback(() => {
    if (!priceData?.data) {
      resultsStore.setError('Немає даних прайсу');
      setCalculationState('idle');
      return;
    }

    const form = formState;

    // Validation
    if (!form.supports || !form.rows || !form.floors || !form.beamsPerRow) {
      resultsStore.setError('Заповніть всі обов\'язкові поля');
      setCalculationState('idle');
      return;
    }

    if (spansState.spans.length === 0 || !spansState.spans.some((s: any) => s.item && s.quantity > 0)) {
      resultsStore.setError('Додайте хоча б один проліт');
      setCalculationState('idle');
      return;
    }

    if (form.floors > 1 && !form.verticalSupports) {
      resultsStore.setError('Оберіть вертикальну опору');
      setCalculationState('idle');
      return;
    }

    resultsStore.setLoading(true);
    setCalculationState('calculating');

    // Prepare data for calculator
    const validSpans = spansState.spans.filter((s: any) => s.item && s.quantity > 0);

    const rackConfig = {
      floors: form.floors,
      rows: form.rows,
      beamsPerRow: form.beamsPerRow,
      supports: form.supports,
      verticalSupports: form.verticalSupports,
      spans: validSpans.map((s: any) => ({
        item: s.item,
        quantity: s.quantity,
      })),
    };

    try {
      // Calculate components
      const components = calculateRackComponents(rackConfig, priceData.data);

      // Generate name
      const name = generateRackName(rackConfig);

      // Calculate totals
      const total = calculateTotalCost(components);
      const totalWithoutIsolators = calculateTotalWithoutIsolators(components);
      const zeroBase = total * 1.44;

      const result = {
        name,
        tableHtml: '', // Will be generated in component
        total: Math.round(total * 100) / 100,
        totalWithoutIsolators: Math.round(totalWithoutIsolators * 100) / 100,
        zeroBase: Math.round(zeroBase * 100) / 100,
        components,
        // Зберігаємо дані форми для редагування
        form: { ...form },
        // Зберігаємо прольоти для підрахунку
        spans: validSpans.map((s: any) => ({
          item: s.item,
          quantity: s.quantity,
        })),
      };

      resultsStore.setResult(result);
      setCalculationState('ready');
    } catch (error) {
      console.error('[RackCalculator] Error:', error);
      resultsStore.setError('Помилка розрахунку');
      setCalculationState('idle');
    }
  }, [formState, spansState.spans, priceData, resultsStore]);

  return {
    calculate,
    isLoading: resultsStore.isLoading,
    error: resultsStore.error,
    result: resultsStore.result,
    calculationState,
    setCalculationState,
  };
};

export default useRackCalculator;
