import React, { useEffect, useRef, useState } from 'react';
import { Skeleton, CalculationControls, Button } from '@/shared/components';
import { CalculatorPage } from '@/shared/layout';
import BatteryForm from '@/features/battery/components/BatteryForm';
import BatteryResults from '@/features/battery/components/BatteryResults';
import { BatterySetModal } from '@/features/battery/BatterySetModal';
import { useBatteryCalculator } from '@/features/battery/useBatteryCalculator';
import { usePrice } from '@/hooks/usePrice';
import { useBatteryFormStore } from '@/features/battery/formStore';
import { useBatterySetStore } from '@/features/battery/setStore';
import { Package } from 'lucide-react';

/**
 * Battery Page - сторінка підбору стелажа для батареї
 *
 * Live recalculation UX:
 * - editing → calculating → ready
 * - Non-blocking inputs
 * - Auto-recalculate on form change (debounced)
 */
const BatteryPage: React.FC = () => {
  const { data: priceData, isLoading: priceLoading } = usePrice();
  const { calculate, isLoading, error, calculationState, setCalculationState } = useBatteryCalculator({ priceData: priceData?.data });
  const formState = useBatteryFormStore();
  const { racks, clear } = useBatterySetStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track form changes for live recalculation
  const formValuesRef = useRef(JSON.stringify(formState));
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-recalculate when form values change
  useEffect(() => {
    const currentFormValues = JSON.stringify(formState);

    // Skip if form values haven't changed
    if (currentFormValues === formValuesRef.current) {
      return;
    }

    // Mark as editing when user changes inputs
    setCalculationState('editing');

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounced recalculation (500ms delay)
    debounceTimerRef.current = setTimeout(async () => {
      // Only recalculate if we have valid form data
      if (formState.length && formState.width && formState.height && formState.weight && formState.count) {
        setCalculationState('calculating');
        await calculate(formState);
        // State will be set to 'ready' in calculate() after completion
      }
      formValuesRef.current = currentFormValues;
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formState, calculate, setCalculationState]);

  // Очищення комплекту при зміні форми
  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  const inputContent = (
    <div className='space-y-4'>
      {priceLoading ? (
        <>
          <Skeleton className='h-96 w-full rounded-lg' />
          <Skeleton className='h-10 w-full' />
        </>
      ) : (
        <>
          {/* Form - always enabled, non-blocking */}
          <BatteryForm />

          {/* Manual Calculate Button (fallback) */}
          <CalculationControls
            isLoading={isLoading}
            error={error}
            submitText='Підібрати'
            loadingText='Розрахунок...'
            onSubmit={() => calculate(useBatteryFormStore.getState())}
          />
          
          {/* Кнопка відкриття комплекту */}
          {racks.length > 0 && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="w-full"
              >
                <Package className="w-4 h-4 mr-2" />
                Відкрити комплект ({racks.length} стелажів)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const resultsContent = <BatteryResults isLoading={isLoading} />;

  return (
    <>
      <CalculatorPage
        title='Підбір стелажа для батареї'
        description='Вкажіть розміри та вагу акумулятора для пошуку'
        input={inputContent}
        results={resultsContent}
        status={calculationState}
      />
      
      <BatterySetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        racks={racks}
      />
    </>
  );
};

export default BatteryPage;
