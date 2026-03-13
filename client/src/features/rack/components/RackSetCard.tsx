import React from 'react';
import { useRackSetStore, type RackSetItem, type PriceInfo } from '@/features/rack/setStore';
import { RackSetModal } from '@/features/rack/RackSetModal';
import { SetCard, type PriceConfig, type SummaryRenderProps } from '@/shared/components/SetCard';
import { PriceDisplay } from '@/shared/components';

/**
 * RackSetCard - картка комплекту стелажів
 */
const RackSetCard: React.FC = () => {
  const { racks, removeRack, updateRackQuantity, clear } = useRackSetStore();

  // Функція для отримання нульової ціни з prices масиву
  const getZeroPrice = (rack: RackSetItem) => {
    const priceItem = rack.prices?.find((p: PriceInfo) => p.type === 'нульова' || p.type === 'zero');
    return priceItem?.value || 0;
  };

  // Функція для отримання ціни "без ізоляторів" з prices масиву
  const getPriceWithoutIsolators = (rack: RackSetItem) => {
    const priceItem = rack.prices?.find((p: PriceInfo) => p.type === 'без_ізоляторів' || p.type === 'no_isolators');
    return priceItem?.value || 0;
  };

  // Перевіряємо чи є хоча б одна нульова ціна в комплектах
  const hasZeroPrice = racks.some((rack: RackSetItem) =>
    rack.prices?.some((p: PriceInfo) => p.type === 'нульова' || p.type === 'zero')
  );

  // Конфігурація цін для Rack
  const priceConfig: PriceConfig[] = [
    { type: 'нульова', label: 'нульова', isPrimary: hasZeroPrice, showInSummary: true },
    { type: 'zero', label: 'нульова', isPrimary: hasZeroPrice, showInSummary: true },
    { type: 'без_ізоляторів', label: 'без ізоляторів', isPrimary: !hasZeroPrice, showInSummary: true },
    { type: 'no_isolators', label: 'без ізоляторів', isPrimary: !hasZeroPrice, showInSummary: true },
  ];

  // Отримання первинної ціни (нульова або без ізоляторів)
  const getPrimaryPrice = (rack: RackSetItem): number => {
    return hasZeroPrice ? getZeroPrice(rack) : getPriceWithoutIsolators(rack);
  };

  // Кастомний рендер підсумків
  const renderSummary = ({ getPriceByType }: SummaryRenderProps) => {
    const totalZero = getPriceByType('нульова') + getPriceByType('zero');
    const totalWithoutIsolators = getPriceByType('без_ізоляторів') + getPriceByType('no_isolators');

    return (
      <div className="mt-4 pt-4 border-t-2 space-y-2">
        {/* Показуємо основну ціну (нульова або без ізоляторів) */}
        {hasZeroPrice ? (
          <div className="flex justify-between text-2xl font-bold">
            <span>Нульова:</span>
            <PriceDisplay value={totalZero} size="2xl" className="font-bold text-primary" />
          </div>
        ) : (
          <div className="flex justify-between text-2xl font-bold">
            <span>Без ізоляторів:</span>
            <PriceDisplay value={totalWithoutIsolators} size="2xl" className="font-bold text-primary" />
          </div>
        )}
        {/* Показуємо без ізоляторів тільки якщо є дозвіл на нульову */}
        {hasZeroPrice && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Без ізоляторів:</span>
            <PriceDisplay value={totalWithoutIsolators} className="font-medium" />
          </div>
        )}
      </div>
    );
  };

  return (
    <SetCard<RackSetItem>
      title="Комплект стелажів"
      racks={racks}
      removeRack={removeRack}
      updateRackQuantity={updateRackQuantity}
      clear={clear}
      priceConfig={priceConfig}
      getPrimaryPrice={getPrimaryPrice}
      modalComponent={<RackSetModal racks={racks} />}
      renderSummary={renderSummary}
      emptyStateText="Додайте стелажі до комплекту"
    />
  );
};

export default RackSetCard;
