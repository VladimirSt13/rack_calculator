import React, { useState } from 'react';
import { Skeleton, CalculationControls, Button } from '@/shared/components';
import { CalculatorPage } from '@/shared/layout';
import BatteryForm from '@/features/battery/components/BatteryForm';
import BatteryResults from '@/features/battery/components/BatteryResults';
import { BatterySetModal } from '@/features/battery/BatterySetModal';
import { useBatteryCalculator } from '@/features/battery/useBatteryCalculator';
import { usePrice } from '@/hooks/usePrice';
import { useBatteryFormStore } from '@/features/battery/formStore';
import { useBatterySetStore } from '@/features/battery/setStore';
import { Package, RefreshCw } from 'lucide-react';

/**
 * Battery Page - сторінка підбору стелажа для батареї
 *
 * Manual calculation UX:
 * - Користувач заповнює форму
 * - Натискає кнопку "Підібрати"
 * - Отримує результат з сервера
 */
const BatteryPage: React.FC = () => {
  const { data: priceData, isLoading: priceLoading } = usePrice();
  const { calculate, isLoading, error, calculationState, setCalculationState } = useBatteryCalculator({ priceData: priceData?.data });
  const formState = useBatteryFormStore();
  const { racks, clear } = useBatterySetStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Очищення комплекту при зміні сторінки
  React.useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  const handleCalculate = async () => {
    setCalculationState('calculating');
    await calculate(formState);
  };

  const inputContent = (
    <div className='space-y-4'>
      {priceLoading ? (
        <>
          <Skeleton className='h-96 w-full rounded-lg' />
          <Skeleton className='h-10 w-full' />
        </>
      ) : (
        <>
          {/* Form */}
          <BatteryForm />

          {/* Manual Calculate Button */}
          <CalculationControls
            isLoading={isLoading}
            error={error}
            submitText='Підібрати'
            loadingText='Розрахунок...'
            onSubmit={handleCalculate}
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

  const resultsContent = (
    <>
      {calculationState === 'calculating' && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      {calculationState === 'ready' && <BatteryResults isLoading={false} />}
      {calculationState === 'idle' && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <p>Заповніть форму та натисніть "Підібрати" для розрахунку</p>
        </div>
      )}
    </>
  );

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
