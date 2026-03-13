import * as React from 'react';
import type { BatterySetItem } from '@/features/battery/setStore';
import { useBatterySetModal } from './useBatterySetModal';
import { SetModalContent } from '@/shared/components/SetModalContent';

interface BatterySetModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  racks: BatterySetItem[];
}

export const BatterySetModal: React.FC<BatterySetModalProps> = ({
  isOpen = false,
  onClose = () => {},
  racks,
}) => {
  const {
    form,
    includePrices,
    setIncludePrices,
    isExporting,
    createMutation,
    onSubmit,
    handleExport,
    groupedRacks,
    totalCost,
  } = useBatterySetModal({ isOpen, onClose, racks });

  return (
    <SetModalContent<BatterySetItem>
      isOpen={isOpen}
      onClose={onClose}
      form={form}
      includePrices={includePrices}
      setIncludePrices={setIncludePrices}
      isExporting={isExporting}
      isPending={createMutation.isPending}
      onSubmit={onSubmit}
      handleExport={handleExport}
      groupedRacks={groupedRacks}
      totalCost={totalCost}
      hasRacks={racks.length > 0}
      dialogTitle="Зберегти комплект стелажів (Акумулятор)"
      namePlaceholder="Наприклад: Стелажі для АКБ"
      objectNamePlaceholder="Наприклад: Склад АКБ"
      submitButtonText="Зберегти комплект"
      exportButtonText="Експорт в Excel"
    />
  );
};

export default BatterySetModal;
