import {
  useSetModal,
  type UseSetModalReturn,
} from "@/shared/hooks/useSetModal";
import { useRackSetStore } from "@/features/rack/setStore";
import { useRackResultsStore } from "@/features/rack/resultsStore";
import type { RackSetItem } from "@/features/rack/setStore";
import { z } from "zod";

export type RackSetForm = z.infer<typeof defaultRackSetSchema>;

export interface UseRackSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  racks: RackSetItem[];
}

export interface UseRackSetModalReturn extends Omit<
  UseSetModalReturn,
  "groupedRacks" | "totalCost"
> {
  groupedRacks: Array<RackSetItem & { quantity: number }>;
  totalCost: number;
}

/**
 * Схема форми для Rack (можна розширити при потребі)
 */
export const defaultRackSetSchema = z.object({
  name: z.string().min(1, `Назва обов'язкова`),
  object_name: z.string().min(1, `Назва об'єкта обов'язкова`),
  description: z.string().optional(),
});

/**
 * useRackSetModal - хук для модального вікна комплекту стелажів
 * Використовує універсальний useSetModal
 */
export const useRackSetModal = ({
  isOpen,
  onClose,
  racks,
}: UseRackSetModalProps): UseRackSetModalReturn => {
  return useSetModal<RackSetItem>({
    isOpen,
    onClose,
    racks,
    schema: defaultRackSetSchema,
    // Для totalCost використовуємо нульову ціну
    getPriceForTotal: (rack) => {
      const zeroPrice =
        rack.prices?.find((p) => p.type === "нульова" || p.type === "zero")
          ?.value || 0;
      return zeroPrice;
    },
    clearSetStore: () => useRackSetStore.getState().clear(),
    clearResultsStore: () => useRackResultsStore.getState().clear(),
  });
};

export default useRackSetModal;
