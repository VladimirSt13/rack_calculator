import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rackSetsApi, downloadRackSetExport } from '@/features/rack/rackSetsApi';
import { useBatterySetStore } from '@/features/battery/setStore';
import type { BatterySetItem } from '@/features/battery/setStore';
import { toast } from 'sonner';

const batterySetSchema = z.object({
  name: z.string().min(1, 'Назва обов\'язкова'),
  object_name: z.string().min(1, 'Назва об\'єкта обов\'язкова'),
  description: z.string().optional(),
});

export type BatterySetForm = z.infer<typeof batterySetSchema>;

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

export const useBatterySetModal = ({
  isOpen,
  onClose,
  racks,
}: UseBatterySetModalProps): UseBatterySetModalReturn => {
  const queryClient = useQueryClient();
  const { clear } = useBatterySetStore();
  const [includePrices, setIncludePrices] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<BatterySetForm>({
    resolver: zodResolver(batterySetSchema),
    defaultValues: {
      name: '',
      object_name: '',
      description: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ name: '', object_name: '', description: '' });
      setIncludePrices(false);
    }
  }, [isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: rackSetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rackSets'] });
      queryClient.invalidateQueries({ queryKey: ['myRackSets'] });
      toast.success('Комплект стелажів збережено');
      clear();
      onClose();
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.error || 'Помилка збереження');
    },
  });

  const convertSpansToRackFormat = (spansArray: number[]) => {
    const spansMap = new Map<string, number>();
    spansArray.forEach((span) => {
      const key = String(span);
      spansMap.set(key, (spansMap.get(key) || 0) + 1);
    });
    return Array.from(spansMap.entries()).map(([item, quantity]) => ({
      item,
      quantity,
    }));
  };

  const prepareRackItems = () => {
    return racks
      .filter((rack) => rack.rackConfigId)
      .map((rack) => ({
        rackConfigId: rack.rackConfigId!,
        quantity: rack.quantity || 1,
      }));
  };

  const onSubmit = (data: BatterySetForm) => {
    const rackItems = prepareRackItems();
    createMutation.mutate({
      ...data,
      rack_items: rackItems,
    });
  };

  const handleExport = async () => {
    if (racks.length === 0) {
      toast.error('Немає стелажів для експорту');
      return;
    }

    setIsExporting(true);
    try {
      const rackItems = prepareRackItems();
      const blob = await rackSetsApi.exportNew(rackItems, includePrices);
      const formData = getValues();
      downloadRackSetExport(blob, {
        name: formData.name,
        object_name: formData.object_name,
        description: formData.description,
      }, includePrices);
      toast.success('Експорт виконано успішно');
    } catch (error) {
      toast.error((error as any).response?.data?.error || 'Помилка експорту');
    } finally {
      setIsExporting(false);
    }
  };

  const totalCost = React.useMemo(() => {
    return racks.reduce((sum, rack) => {
      const zeroPrice = rack.prices?.find((p) => p.type === 'нульова' || p.type === 'zero')?.value || 0;
      const quantity = rack.quantity || 1;
      return sum + (zeroPrice * quantity);
    }, 0);
  }, [racks]);

  const groupedRacks = React.useMemo(() => {
    const groups = new Map<string, BatterySetItem & { quantity: number }>();
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
};

export default useBatterySetModal;
