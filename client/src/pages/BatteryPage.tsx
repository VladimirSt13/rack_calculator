import React, { useEffect, useRef } from 'react';
import { Skeleton, CalculationControls } from '@/shared/components';
import { CalculatorPage } from '@/shared/layout';
import BatteryForm from '../features/battery/components/BatteryForm';
import BatteryResults from '../features/battery/components/BatteryResults';
import { useBatteryCalculator } from '../features/battery/useBatteryCalculator';
import { usePrice } from '../hooks/usePrice';
import { useBatteryFormStore } from '../features/battery/formStore';

/**
 * Battery Page - сторінка підбору стелажа для акумулятора
 * 
 * Live recalculation UX:
 * - editing → calculating → ready
 * - Non-blocking inputs
 * - Auto-recalculate on form change (debounced)
 */
const BatteryPage: React.FC = () => {
  const { data: priceData, isLoading: priceLoading } = usePrice();
  const { calculate, isLoading, error, setCalculationState } = useBatteryCalculator({ priceData });
  const formState = useBatteryFormStore();
  
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
    debounceTimerRef.current = setTimeout(() => {
      // Only recalculate if we have valid form data
      if (formState.length && formState.width && formState.height && formState.weight && formState.count) {
        setCalculationState('calculating');
        calculate();
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

  const inputContent = (
    <>
      {priceLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-96 w-full rounded-lg" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Form - always enabled, non-blocking */}
          <BatteryForm />

          {/* Manual Calculate Button (fallback) */}
          <CalculationControls
            isLoading={isLoading}
            error={error}
            submitText="Підібрати"
            loadingText="Розрахунок..."
            onSubmit={calculate}
          />
        </div>
      )}
    </>
  );

  const resultsContent = <BatteryResults isLoading={isLoading} />;

  return (
    <CalculatorPage
      title="Підбір стелажа для батареї"
      description="Вкажіть розміри та вагу акумулятора для пошуку"
      input={inputContent}
      results={resultsContent}
    />
  );
};

export default BatteryPage;
