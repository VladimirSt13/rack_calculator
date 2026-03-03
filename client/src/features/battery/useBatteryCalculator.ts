import { useCallback, useState } from 'react';
import { generateRackVariants } from '../../shared/core/rackBuilder';
import { calculateBatteryRack } from '../../shared/core/batteryCalculator';
import { useBatteryFormStore } from './formStore';
import { useBatteryResultsStore } from './resultsStore';
import { CalculationLifecycleStatus } from '../../shared/layout';

interface UseBatteryCalculatorProps {
  priceData?: any;
}

/**
 * Hook для розрахунку варіантів стелажів для battery
 * 
 * Live recalculation states:
 * - idle: початковий стан
 * - editing: користувач змінив параметри
 * - calculating: триває розрахунок
 * - ready: розрахунок завершено
 */
export const useBatteryCalculator = ({ priceData }: UseBatteryCalculatorProps) => {
  const formState = useBatteryFormStore();
  const resultsStore = useBatteryResultsStore();
  const [calculationState, setCalculationState] = useState<CalculationLifecycleStatus>('idle');

  const calculate = useCallback(() => {
    if (!priceData?.data) {
      resultsStore.setError('Немає даних прайсу');
      setCalculationState('idle');
      return;
    }

    const { length, width, height, weight, gap, count, rows, floors, supportType } = formState;

    // Validation
    if (!length || !width || !height || !weight || !count) {
      resultsStore.setError('Заповніть всі обов\'язкові поля');
      setCalculationState('idle');
      return;
    }

    resultsStore.setLoading(true);
    setCalculationState('calculating');

    const element = {
      length: Number(length),
      width: Number(width),
      height: Number(height),
      weight: Number(weight),
    };

    try {
      // 1. Generate rack variants
      const rackVariants = generateRackVariants({
        element,
        totalCount: Number(count),
        gap: Number(gap),
        rows: Number(rows),
        floors: Number(floors),
        supportType,
        price: priceData.data,
      });

      // 2. Calculate price for each variant
      const resultsWithCalculation = rackVariants.map((variant: any) => {
        const spanVariants = variant.topSpans || [];

        const variantsWithPrice = spanVariants.map((spanVariant: any, idx: number) => {
          const rackConfig = {
            floors: variant.floors,
            rows: variant.rows,
            supportType: variant.supportType,
            length: variant.length,
            width: variant.width,
            height: variant.height,
            spans: spanVariant.combination,
            beams: spanVariant.beams,
          };

          const calculation = calculateBatteryRack(rackConfig, priceData.data);

          return {
            ...variant,
            ...spanVariant,
            ...calculation,
            _index: idx,
          };
        });

        return {
          ...variant,
          variantsWithPrice,
        };
      });

      // Flatten variants
      const allVariants = resultsWithCalculation.flatMap((r: any) => r.variantsWithPrice);

      resultsStore.setVariants(allVariants);
      setCalculationState('ready');
    } catch (error) {
      console.error('[BatteryCalculator] Error:', error);
      resultsStore.setError('Помилка розрахунку');
      setCalculationState('idle');
    }
  }, [formState, priceData, resultsStore]);

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
