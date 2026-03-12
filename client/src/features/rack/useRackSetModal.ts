import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rackSetsApi, downloadRackSetExport } from '@/features/rack/rackSetsApi';
import { useRackSetStore } from '@/features/rack/setStore';
import { useRackResultsStore } from '@/features/rack/resultsStore';
import type { RackSetItem } from '@/features/rack/setStore';
import { toast } from 'sonner';

const rackSetSchema = z.object({
  name: z.string().min(1, 'Назва обовязкова'),
  object_name: z.string().min(1, 'Назва обєкта обовязкова'),
  description: z.string().optional(),
});

export type RackSetForm = z.infer<typeof rackSetSchema>;

export interface UseRackSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  racks: RackSetItem[];
}

export interface UseRackSetModalReturn {
  form: any;
  includePrices: boolean;
  setIncludePrices: (checked: boolean) => void;
  isExporting: boolean;
  createMutation: any;
  onSubmit: (data: RackSetForm) => void;
  handleExport: () => Promise<void>;
  groupedRacks: Array<RackSetItem & { quantity: number }>;
  totalCost: number;
}

export const useRackSetModal = ({ isOpen, onClose, racks }: UseRackSetModalProps): UseRackSetModalReturn => {
  const queryClient = useQueryClient();
  const { clear } = useRackSetStore();
  const resultsStore = useRackResultsStore();
  const [includePrices, setIncludePrices] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<RackSetForm>({
    resolver: zodResolver(rackSetSchema),
    defaultValues: { name: '', object_name: '', description: '' },
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
      resultsStore.clear();  // ✅ Очищаємо результати розрахунку
      onClose();
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.error || 'Помилка збереження');
    },
  });

  const prepareRackItems = () =>
    racks
      .filter((rack) => rack.rackConfigId)
      .map((rack) => ({ rackConfigId: rack.rackConfigId!, quantity: rack.quantity || 1 }));

  const onSubmit = (data: RackSetForm) => {
    createMutation.mutate({ ...data, rack_items: prepareRackItems() });
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
      downloadRackSetExport(
        blob,
        { name: formData.name, object_name: formData.object_name, description: formData.description },
        includePrices,
      );
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
      return sum + zeroPrice * quantity;
    }, 0);
  }, [racks]);

  const groupedRacks = React.useMemo(() => {
    const groups = new Map<string, RackSetItem & { quantity: number }>();
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
    form: { register, handleSubmit, formState: { errors }, reset, getValues },
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

export default useRackSetModal;
