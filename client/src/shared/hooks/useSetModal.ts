import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  rackSetsApi,
  downloadRackSetExport,
} from "@/features/rack/rackSetsApi";
import { toast } from "sonner";

/**
 * Базовий елемент комплекту для універсального хука
 */
export interface BaseSetItemWithPrices {
  rackConfigId?: number;
  quantity: number;
  prices?: Array<{ type: string; value: number }>;
  name: string;
}

/**
 * Пропси для універсального хука
 */
export interface UseSetModalProps<T extends BaseSetItemWithPrices> {
  isOpen: boolean;
  onClose: () => void;
  racks: T[];
  /** Схема валідації форми */
  schema?: z.ZodSchema;
  /** Функція для отримання ціни для totalCost */
  getPriceForTotal: (rack: T) => number;
  /** Store для очищення комплекту */
  clearSetStore: () => void;
  /** Store для очищення результатів */
  clearResultsStore: () => void;
}

/**
 * Повертаєме значення хука
 */
export interface UseSetModalReturn {
  form: {
    register: any;
    handleSubmit: (
      onSubmit: (data: any) => void,
    ) => (e?: React.BaseSyntheticEvent) => void;
    formState: { errors: Record<string, { message?: string }> };
    reset: (values?: any) => void;
    getValues: () => any;
  };
  includePrices: boolean;
  setIncludePrices: (checked: boolean) => void;
  isExporting: boolean;
  createMutation: any;
  onSubmit: (data: any) => void;
  handleExport: () => Promise<void>;
  groupedRacks: Array<any>;
  totalCost: number;
}

/**
 * Універсальна схема форми за замовчуванням
 */
export const defaultSetSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  object_name: z.string().min(1, "Назва об'єкта обов'язкова"),
  description: z.string().optional(),
});

/**
 * useSetModal - універсальний хук для модальних вікон комплекту
 * Використовується для Battery та Rack
 */
export function useSetModal<T extends BaseSetItemWithPrices>({
  isOpen,
  onClose,
  racks,
  schema = defaultSetSchema,
  getPriceForTotal,
  clearSetStore,
  clearResultsStore,
}: UseSetModalProps<T>): UseSetModalReturn {
  const queryClient = useQueryClient();
  const [includePrices, setIncludePrices] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      object_name: "",
      description: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ name: "", object_name: "", description: "" });
      setIncludePrices(false);
    }
  }, [isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: rackSetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rackSets"] });
      queryClient.invalidateQueries({ queryKey: ["myRackSets"] });
      toast.success("Комплект стелажів збережено");
      clearSetStore();
      clearResultsStore();
      onClose();
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.error || "Помилка збереження");
    },
  });

  const prepareRackItems = () => {
    return racks
      .filter((rack) => rack.rackConfigId)
      .map((rack) => ({
        rackConfigId: rack.rackConfigId!,
        quantity: rack.quantity || 1,
      }));
  };

  const onSubmit = (data: any) => {
    const rackItems = prepareRackItems();
    createMutation.mutate({
      ...data,
      rack_items: rackItems,
    });
  };

  const handleExport = async () => {
    if (racks.length === 0) {
      toast.error("Немає стелажів для експорту");
      return;
    }

    setIsExporting(true);
    try {
      const rackItems = prepareRackItems();
      const blob = await rackSetsApi.exportNew(rackItems, includePrices);
      const formData = getValues();
      downloadRackSetExport(
        blob,
        {
          name: formData.name,
          object_name: formData.object_name,
          description: formData.description,
        },
        includePrices,
      );
      toast.success("Експорт виконано успішно");
    } catch (error) {
      toast.error((error as any).response?.data?.error || "Помилка експорту");
    } finally {
      setIsExporting(false);
    }
  };

  const totalCost = React.useMemo(() => {
    return racks.reduce((sum, rack) => {
      const price = getPriceForTotal(rack);
      const quantity = rack.quantity || 1;
      return sum + price * quantity;
    }, 0);
  }, [racks, getPriceForTotal]);

  const groupedRacks = React.useMemo(() => {
    const groups = new Map<string, T & { quantity: number }>();
    racks.forEach((rack) => {
      const key = rack.name;
      const existing = groups.get(key);
      if (existing) {
        existing.quantity += rack.quantity || 1;
      } else {
        groups.set(key, { ...rack, quantity: rack.quantity || 1 });
      }
    });
    return Array.from(groups.values());
  }, [racks]);

  return {
    form: {
      register,
      handleSubmit,
      formState: { errors },
      reset,
      getValues,
    },
    includePrices,
    setIncludePrices,
    isExporting,
    createMutation,
    onSubmit,
    handleExport,
    groupedRacks,
    totalCost,
  };
}

export default useSetModal;
