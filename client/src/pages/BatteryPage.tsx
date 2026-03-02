import React from 'react';
import { Page, PageContent, PageHeader, Sidebar, MainContent, Container } from '@/shared/layout';
import { Alert, Skeleton } from '@/shared/components';
import BatteryForm from '../features/battery/components/BatteryForm';
import BatteryResults from '../features/battery/components/BatteryResults';
import { useBatteryCalculator } from '../features/battery/useBatteryCalculator';
import { usePrice } from '../hooks/usePrice';

/**
 * Battery Page - сторінка підбору стелажа для акумулятора
 */
const BatteryPage: React.FC = () => {
  const { data: priceData, isLoading: priceLoading } = usePrice();
  const { calculate, isLoading, error } = useBatteryCalculator({ priceData });

  return (
    <Page>
      <PageContent>
        <Container size="xl">
          <PageHeader
            title="Підбір стелажа для батареї"
            description="Вкажіть розміри та вагу акумулятора для пошуку"
          />

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar: Form */}
            <Sidebar>
              {priceLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-96 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  <BatteryForm />

                  <div className="space-y-2">
                    <button
                      onClick={calculate}
                      disabled={isLoading}
                      className="w-full h-12 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      {isLoading ? 'Розрахунок...' : 'Підібрати'}
                    </button>

                    {error && (
                      <Alert variant="destructive">
                        {error}
                      </Alert>
                    )}
                  </div>
                </>
              )}
            </Sidebar>

            {/* Main: Results */}
            <MainContent>
              <BatteryResults />
            </MainContent>
          </div>
        </Container>
      </PageContent>
    </Page>
  );
};

export default BatteryPage;
