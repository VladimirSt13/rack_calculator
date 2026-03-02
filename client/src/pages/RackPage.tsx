import React from 'react';
import { Page, PageContent, PageHeader, Sidebar, MainContent, Container } from '@/shared/layout';
import { Alert, Skeleton } from '@/shared/components';
import RackForm from '../features/rack/components/RackForm';
import RackResults from '../features/rack/components/RackResults';
import RackSetCard from '../features/rack/components/RackSetCard';
import { useRackCalculator } from '../features/rack/useRackCalculator';
import { usePrice } from '../hooks/usePrice';

/**
 * Rack Page - сторінка розрахунку стелажа
 */
const RackPage: React.FC = () => {
  const { data: priceData, isLoading: priceLoading } = usePrice();
  const { calculate, isLoading, error } = useRackCalculator({ priceData });

  return (
    <Page>
      <PageContent>
        <Container size="xl">
          <PageHeader
            title="Розрахунок стелажа"
            description="Налаштуйте параметри та отримайте специфікацію"
          />

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar: Form */}
            <Sidebar>
              {priceLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  <RackForm />

                  <div className="space-y-2">
                    <button
                      onClick={calculate}
                      disabled={isLoading}
                      className="w-full h-12 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      {isLoading ? 'Розрахунок...' : 'Розрахувати'}
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
              <RackResults />
              <RackSetCard />
            </MainContent>
          </div>
        </Container>
      </PageContent>
    </Page>
  );
};

export default RackPage;
