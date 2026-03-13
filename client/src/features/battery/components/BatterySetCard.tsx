import React from 'react';
import { useBatterySetStore, type BatterySetItem } from '@/features/battery/setStore';
import { BatterySetModal } from '@/features/battery/BatterySetModal';
import { SetCard, type PriceConfig } from '@/shared/components/SetCard';

const BatterySetCard: React.FC = () => {
  const { racks, removeRack, updateRackQuantity, clear } = useBatterySetStore();

  // Конфігурація цін для Battery
  const priceConfig: PriceConfig[] = [
    { type: 'нульова', label: 'нульова', isPrimary: true, showInSummary: true },
    { type: 'zero', label: 'нульова', isPrimary: true, showInSummary: true },
  ];

  // Отримання нульової ціни
  const getZeroPrice = (rack: BatterySetItem): number => {
    const priceItem = rack.prices?.find((p) => p.type === 'нульова' || p.type === 'zero');
    return priceItem?.value || 0;
  };

  return (
    <SetCard<BatterySetItem>
      title="Комплект стелажів"
      racks={racks}
      removeRack={removeRack}
      updateRackQuantity={updateRackQuantity}
      clear={clear}
      priceConfig={priceConfig}
      getPrimaryPrice={getZeroPrice}
      modalComponent={<BatterySetModal racks={racks} />}
      emptyStateText="Додайте стелажі до комплекту натиснувши кнопку «+» у таблиці варіантів"
    />
  );
};

export default BatterySetCard;