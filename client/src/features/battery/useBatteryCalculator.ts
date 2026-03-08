import { useCallback, useState } from 'react';
import { generateRackVariants } from '@/shared/core/rackBuilder';
import { calculateBatteryRack } from '@/shared/core/batteryCalculator';
import { useBatteryResultsStore, type BatteryVariant } from './resultsStore';
import { CalculationLifecycleStatus } from '@/shared/layout';
import type { BatteryFormState } from './formStore';
import { rackApi } from '@/features/rack/rackApi';
import type { PriceData } from '@rack-calculator/shared';
import { logger } from '@/lib/logger';

interface UseBatteryCalculatorProps {
  priceData?: PriceData;
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
        price: priceData,
      });

      // 2. Calculate price for each variant
      const resultsWithCalculation = rackVariants.map((variant) => {
        const spanVariants = variant.topSpans || [];

        const variantsWithPrice = spanVariants.map((spanVariant, idx) => {
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

          const calculation = priceData ? calculateBatteryRack(rackConfig, priceData) : null;

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
      const allVariants = resultsWithCalculation.flatMap((r) => r.variantsWithPrice);

      // Transform to BatteryVariant type
      const transformedVariants: BatteryVariant[] = allVariants.map((variant: any, index: number) => ({
        _index: index,
        name: variant.name || `Варіант ${index + 1}`,
        width: variant.width,
        height: variant.height,
        length: variant.element?.length || Number(length),  // Довжина елемента з форми
        totalLength: variant.length,  // Розрахункова довжина стелажа
        floors: variant.floors,
        rows: variant.rows,
        supportType: variant.supportType,
        combination: variant.combination,
        beams: variant.beams,
        prices: variant.prices?.map((p: any) => ({
          type: p.type,
          label: p.label,
          value: p.value,
        })),
        components: variant.components || {},  // Додаємо компоненти
        rackConfigId: undefined,
      }));

      // 3. Створити конфігурації для кожного варіанту (опціонально, для збереження)
      const variantsWithConfigIds = await Promise.all(
        transformedVariants.map(async (variant) => {
          try {
            const rackConfig = {
              floors: variant.floors,
              rows: variant.rows,
              beamsPerRow: 2, // Для battery використовується фіксоване значення
              supports: variant.supportType === 'step' ? 'C' : undefined,
              verticalSupports: variant.floors > 1 ? 'V' : undefined,
              spans: variant.combination.map((span: number) => ({
                item: String(span),
                quantity: 1,
              })),
            };

            const response = await rackApi.findOrCreateConfiguration(rackConfig);
            return {
              ...variant,
              rackConfigId: response.rackConfigId,
            };
          } catch (error) {
            logger.error('[Battery] Error creating config:', error);
            return variant;
          }
        })
      );

      resultsStore.setVariants(variantsWithConfigIds);
      setCalculationState('ready');
    } catch (error) {
      logger.error('[BatteryCalculator] Error:', error);
      resultsStore.setError('Помилка розрахунку');
      setCalculationState('idle');
    }
  }, [resultsStore, priceData]);

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
