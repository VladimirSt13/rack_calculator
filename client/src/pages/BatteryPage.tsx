import React from 'react';
import { CalculationControls } from '@/shared/components';
import { CalculatorPage } from '@/shared/layout';
import BatteryForm from '@/features/battery/components/BatteryForm';
import BatteryResults from '@/features/battery/components/BatteryResults';
import BatterySetCard from '@/features/battery/components/BatterySetCard';
import { useBatteryCalculator } from '@/features/battery/useBatteryCalculator';
import { useBatteryFormStore } from '@/features/battery/formStore';
import { useBatterySetStore } from '@/features/battery/setStore';
import { RefreshCw } from 'lucide-react';

/**
 * Battery Page - сторінка підбору стелажа для батареї
 *
 * Manual calculation UX:
 * - Користувач заповнює форму
 * - Натискає кнопку "Підібрати"
 * - Отримує результат з сервера
 */
const BatteryPage: React.FC = () => {
  const { calculate, isLoading, error, calculationState, setCalculationState } = useBatteryCalculator();
  const formState = useBatteryFormStore();
  const { clear } = useBatterySetStore();

  // Очищення комплекту при зміні сторінки
  React.useEffect(() => {
    return () => {
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCalculate = async () => {
    setCalculationState('calculating');
    await calculate(formState);
  };

  const inputContent = (
    <div className='space-y-4'>
      <BatteryForm />

      <CalculationControls
        isLoading={isLoading}
        error={error}
        submitText='Підібрати'
        loadingText='Розрахунок...'
        onSubmit={handleCalculate}
      />
    </div>
  );

  const resultsContent = (
    <>
      {calculationState === 'calculating' && (
        <div className='flex items-center justify-center py-12'>
          <RefreshCw className='w-8 h-8 animate-spin text-primary' />
        </div>
      )}
      {calculationState === 'ready' && <BatteryResults isLoading={false} />}
      {calculationState === 'idle' && (
        <div className='flex items-center justify-center py-12 text-muted-foreground'>
          <p>Заповніть форму та натисніть &quot;Підібрати&quot; для розрахунку</p>
        </div>
      )}
    </>
  );

  const setPanelContent = <BatterySetCard />;

  return (
    <>
      <CalculatorPage
        title='Підбір стелажа для батареї'
        description='Вкажіть розміри та вагу акумулятора для пошуку'
        input={inputContent}
        results={resultsContent}
        setPanel={setPanelContent}
        status={calculationState}
      />
    </>
  );
};

export default BatteryPage;
