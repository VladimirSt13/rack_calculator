import React from 'react';

interface RackItemDisplayProps {
  rack: {
    name?: string;
    quantity?: number;
    config?: {
      floors?: number;
      rows?: number;
      beamsPerRow?: number;
    };
    form?: {
      floors?: number;
      rows?: number;
      beamsPerRow?: number;
    };
    prices?: Array<{
      type: string;
      value: number;
    }>;
    totalCost?: number;
    components?: Record<string, any>;
  };
  showDetails?: boolean; // Показувати деталі (розміри, комплектацію)
}

/**
 * Компонент для відображення інформації про стелаж в комплекті
 * Використовується в:
 * - admin/RackSetsList.tsx (перегляд комплекту)
 * - MyRackSetsPage.tsx (перегляд комплекту)
 */
export const RackItemDisplay: React.FC<RackItemDisplayProps> = ({ rack, showDetails = false }) => {
  // Визначаємо конфігурацію з нової або старої структури
  const rackConfig = rack.config || rack.form || {
    floors: 0,
    rows: 0,
    beamsPerRow: 0,
  };

  // Знаходимо ціну з типу "нульова" або "zero"
  const rackPrice = rack.prices?.find((p) =>
    p.type === 'нульова' || p.type === 'zero'
  )?.value || rack.totalCost || 0;
  const totalRackPrice = rackPrice * (rack.quantity || 1);

  return (
    <div className="border rounded-md bg-background p-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium">
            {rack.name || `Стелаж ${rackConfig.floors}х${rackConfig.rows}х${rackConfig.beamsPerRow}`}
          </p>
          <p className="text-sm text-muted-foreground">
            Кількість:{' '}
            <span className="font-medium">
              {rack.quantity || 1} од.
            </span>
          </p>
          
          {/* Деталі показуємо тільки якщо showDetails = true */}
          {showDetails && (
            <>
              <p className="text-xs text-muted-foreground mt-1">
                Розміри: {rackConfig.floors || 0} пов. × {rackConfig.rows || 0} рядів × {rackConfig.beamsPerRow || 0} балок
              </p>
              
              {/* Компоненти - перші 6 */}
              {rack.components && Object.keys(rack.components).length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
                    Комплектація:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(rack.components)
                      .flatMap(([_category, items]: [string, any]) =>
                        Array.isArray(items)
                          ? items.slice(0, 6).map((item: any) => ({
                              name: item.name,
                              amount: item.amount,
                            }))
                          : []
                      )
                      .slice(0, 6)
                      .map((comp: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-muted-foreground truncate">
                            {comp.name}:
                          </span>
                          <span className="font-medium">
                            {comp.amount} од.
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="text-right ml-4">
          <p className="text-sm text-muted-foreground">
            Вартість:
          </p>
          <p className="font-semibold">
            {totalRackPrice.toFixed(2)} ₴
          </p>
        </div>
      </div>
    </div>
  );
};

export default RackItemDisplay;
