import * as React from 'react';
import type { BatterySetItem } from '@/features/battery/setStore';
import { useBatterySetModal } from './useBatterySetModal';
import { BatterySetModalContent } from './components/BatterySetModalContent';

interface BatterySetModalProps {
  isOpen: boolean;
  onClose: () => void;
  racks: BatterySetItem[];
}

export const BatterySetModal: React.FC<BatterySetModalProps> = ({
  isOpen,
  onClose,
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
    <BatterySetModalContent
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
    />
  );
};

export default BatterySetModal;
