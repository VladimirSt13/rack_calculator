import { useCallback, useState } from 'react';
import { useBatteryResultsStore, type BatteryVariant } from './resultsStore';
import { CalculationLifecycleStatus } from '@/shared/layout';
import type { BatteryFormState } from './formStore';
import { batteryApi } from '@/features/battery/batteryApi';
import { logger } from '@/lib/logger';

interface UseBatteryCalculatorProps {
  priceData?: any;
}

/**
 * Hook для розрахунку варіантів стелажів для battery
 *
 * Manual calculation:
 * - idle: початковий стан
 * - calculating: триває розрахунок
 * - ready: розрахунок завершено
 */
export const useBatteryCalculator = ({}: UseBatteryCalculatorProps) => {
  const resultsStore = useBatteryResultsStore();
  const [calculationState, setCalculationState] = useState<CalculationLifecycleStatus>('idle');

  const calculate = useCallback(async (formState: BatteryFormState) => {
    const { length, width, height, weight, gap, count, rows, floors, supportType } = formState;

    // Validation
    if (!length || !width || !height || !weight || !count) {
      resultsStore.setError('Заповніть всі обов\'язкові поля');
      setCalculationState('idle');
      return;
    }

    resultsStore.setLoading(true);
    setCalculationState('calculating');

    const batteryDimensions = {
      length: Number(length),
      width: Number(width),
      height: Number(height),
      weight: Number(weight),
      gap: Number(gap) || 0,
    };

    try {
      // Запит на сервер для отримання варіантів з цінами
      const response = await batteryApi.findBest(batteryDimensions, Number(weight), Number(count), {
        floors: Number(floors),
        rows: Number(rows),
        supportType,
      });
      console.log('🚀 ~ response->', response)

      // Трансформація відповіді сервера в BatteryVariant
      const transformedVariants: BatteryVariant[] = response.variants.map((variant: any, index: number) => ({
        _index: index,
        rackConfigId: variant.rackConfigId,
        name: variant.name,
        config: variant.config,
        components: variant.components || {},
        prices: variant.prices || [],
        totalCost: variant.totalCost || 0,
        // Додаткові поля для UI
        span: variant.span,
        spansCount: variant.spansCount,
        totalLength: variant.totalLength,
        combination: variant.combination,
        beams: variant.beams,
        batteriesPerRow: response.batteriesPerRow,
        excessLength: variant.excessLength,
        isBest: variant.isBest,
        index: variant.index,
      }));

      resultsStore.setVariants(transformedVariants);
      if (response.requiredLength) {
        resultsStore.setRequiredLength(response.requiredLength);
      }
      setCalculationState('ready');
    } catch (error) {
      logger.error('[BatteryCalculator] Error:', error);
      resultsStore.setError('Помилка розрахунку');
      setCalculationState('idle');
    }
  }, [resultsStore]);

  return {
    calculate,
    isLoading: resultsStore.isLoading,
    error: resultsStore.error,
    variants: resultsStore.variants,
    requiredLength: resultsStore.requiredLength,  // Додамо requiredLength
    calculationState,
    setCalculationState,
  };
};

export default useBatteryCalculator;
