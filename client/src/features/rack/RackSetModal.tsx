import * as React from 'react';
import type { RackSetItem } from '@/features/rack/setStore';
import { useRackSetModal } from './useRackSetModal';
import { RackSetModalContent } from './components/RackSetModalContent';

interface RackSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  racks: RackSetItem[];
}

export const RackSetModal: React.FC<RackSetModalProps> = ({
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
  } = useRackSetModal({ isOpen, onClose, racks });

  return (
    <RackSetModalContent
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

export default RackSetModal;
