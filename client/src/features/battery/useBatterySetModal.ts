import { useSetModal } from '@/shared/hooks/useSetModal';
import { useBatterySetStore } from '@/features/battery/setStore';
import { useBatteryResultsStore } from '@/features/battery/resultsStore';
import type { BatterySetItem } from '@/features/battery/setStore';
import { z } from 'zod';

export type BatterySetForm = z.infer<typeof defaultBatterySetSchema>;

export interface UseBatterySetModalProps {
  isOpen: boolean;
  onClose: () => void;
  racks: BatterySetItem[];
}

export interface UseBatterySetModalReturn {
  form: any;
  includePrices: boolean;
  setIncludePrices: (checked: boolean) => void;
  isExporting: boolean;
  createMutation: any;
  onSubmit: (data: BatterySetForm) => void;
  handleExport: () => Promise<void>;
  groupedRacks: Array<BatterySetItem & { quantity: number }>;
  totalCost: number;
}

/**
 * Схема форми для Battery (можна розширити при потребі)
 */
export const defaultBatterySetSchema = z.object({
  name: z.string().min(1, 'Назва обов\'язкова'),
  object_name: z.string().min(1, 'Назва об\'єкта обов\'язкова'),
  description: z.string().optional(),
});

/**
 * useBatterySetModal - хук для модального вікна комплекту акумуляторів
 * Використовує універсальний useSetModal
 */
export const useBatterySetModal = ({
  isOpen,
  onClose,
  racks,
}: UseBatterySetModalProps): UseBatterySetModalReturn => {
  return useSetModal<BatterySetItem>({
    isOpen,
    onClose,
    racks,
    schema: defaultBatterySetSchema,
    // Для totalCost використовуємо нульову ціну
    getPriceForTotal: (rack) => {
      const zeroPrice = rack.prices?.find((p) => p.type === 'нульова' || p.type === 'zero')?.value || 0;
      return zeroPrice;
    },
    clearSetStore: () => useBatterySetStore.getState().clear(),
    clearResultsStore: () => useBatteryResultsStore.getState().clear(),
  });
};

export default useBatterySetModal;
