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
    const { length, width, height, weight, count, rows, floors, supportType } = formState;

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
    };

    try {
      // Запит на сервер для отримання варіантів з цінами
      const response = await batteryApi.findBest(batteryDimensions, Number(weight), Number(count), {
        floors: Number(floors),
        rows: Number(rows),
        supportType,
      });

      // Трансформація відповіді сервера в BatteryVariant
      const transformedVariants: BatteryVariant[] = response.variants.map((variant: any, index: number) => ({
        _index: index,
        name: variant.name || `Варіант ${index + 1}`,
        width: Number(width),
        height: Number(height),
        length: Number(length),
        totalLength: variant.totalLength,
        floors: Number(floors),
        rows: Number(rows),
        supportType,
        combination: variant.combination,
        beams: variant.beams,
        prices: variant.prices?.map((p: any) => ({
          type: p.type,
          label: p.label,
          value: p.value,
        })),
        components: variant.components || {},
        rackConfigId: variant.rackConfigId,
      }));

      resultsStore.setVariants(transformedVariants);
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
    calculationState,
    setCalculationState,
  };
};

export default useBatteryCalculator;
