import React, { useEffect, useRef } from 'react';
import { Skeleton, CalculationControls } from '@/shared/components';
import { CalculatorPage } from '@/shared/layout';
import RackForm from '../features/rack/components/RackForm';
import RackResults from '../features/rack/components/RackResults';
import RackSetCard from '../features/rack/components/RackSetCard';
import { useRackCalculator } from '../features/rack/useRackCalculator';
import { usePrice } from '../hooks/usePrice';
import { useRackFormStore } from '../features/rack/formStore';
import { useRackSpansStore } from '../features/rack/spansStore';

/**
 * Rack Page - сторінка розрахунку стелажа
 * 
 * Live recalculation UX:
 * - editing → calculating → ready
 * - Non-blocking inputs
 * - Auto-recalculate on form change (debounced)
 */
const RackPage: React.FC = () => {
  const { data: priceData, isLoading: priceLoading } = usePrice();
  const { calculate, isLoading, error, calculationState, setCalculationState } = useRackCalculator({ priceData });
  const formState = useRackFormStore();
  const spansState = useRackSpansStore();
  
  // Track form changes for live recalculation
  const formValuesRef = useRef(JSON.stringify({ form: formState, spans: spansState.spans }));
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-recalculate when form values change
  useEffect(() => {
    const currentFormValues = JSON.stringify({ form: formState, spans: spansState.spans });
    
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
      if (formState.supports && formState.rows && formState.floors && formState.beamsPerRow && spansState.spans.length > 0) {
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
  }, [formState, spansState.spans, calculate, setCalculationState]);

  const inputContent = (
    <>
      {priceLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Form - always enabled, non-blocking */}
          <RackForm />

          {/* Manual Calculate Button (fallback) */}
          <CalculationControls
            isLoading={isLoading}
            error={error}
            submitText="Розрахувати"
            loadingText="Розрахунок..."
            onSubmit={calculate}
          />
        </div>
      )}
    </>
  );

  const resultsContent = (
    <RackResults isLoading={isLoading} />
  );

  const setPanelContent = (
    <RackSetCard />
  );

  return (
    <CalculatorPage
      title="Розрахунок стелажа"
      description="Налаштуйте параметри та отримайте специфікацію"
      input={inputContent}
      results={resultsContent}
      setPanel={setPanelContent}
      status={calculationState}
    />
  );
};

export default RackPage;
