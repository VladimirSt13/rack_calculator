import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rackSetsApi } from '@/features/rack/rackSetsApi';
import type { RackSetItem } from '@/features/rack/setStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/Dialog';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Label } from '@/shared/components/Label';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/Table';
import { Checkbox } from '@/shared/components/Checkbox';
import { Download } from 'lucide-react';

const rackSetSchema = z.object({
  name: z.string().min(1, 'Назва обов\'язкова'),
  object_name: z.string().min(1, 'Назва об\'єкта обов\'язкова'),
  description: z.string().optional(),
});

type RackSetForm = z.infer<typeof rackSetSchema>;

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
  const queryClient = useQueryClient();
  const [includePrices, setIncludePrices] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RackSetForm>({
    resolver: zodResolver(rackSetSchema),
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
      // Інвалідація кешу для оновлення обох списків комплектів
      queryClient.invalidateQueries({ queryKey: ['rackSets'] });
      queryClient.invalidateQueries({ queryKey: ['myRackSets'] });
      toast.success('Комплект стелажів збережено');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Помилка збереження');
    },
  });

  const onSubmit = (data: RackSetForm) => {
    // Формуємо нову структуру: rack_items = [{rackConfigId, quantity}]
    const rackItems = racks
      .filter(rack => rack.rackConfigId) // фільтруємо ті, що мають ID
      .map(rack => ({
        rackConfigId: rack.rackConfigId!,
        quantity: rack.quantity || 1,
      }));
    
    createMutation.mutate({
      ...data,
      rack_items: rackItems, // нова структура
      racks, // залишаємо для зворотної сумісності
    });
  };

  const handleExport = async () => {
    if (racks.length === 0) {
      toast.error('Немає стелажів для експорту');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await rackSetsApi.exportNew(racks, includePrices);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      const filename = includePrices ? 'комплект_з_цінами.xlsx' : 'комплект.xlsx';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Експорт виконано успішно');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Помилка експорту');
    } finally {
      setIsExporting(false);
    }
  };

  // Розрахунок загальної вартості по нульовій ціні
  const totalCost = racks.reduce((sum, rack) => {
    const zeroPrice = rack.prices?.find((p) => p.type === 'нульова' || p.type === 'zero')?.value || 0;
    const quantity = rack.quantity || 1;
    return sum + (zeroPrice * quantity);
  }, 0);

  // Групування однакових стелажів
  const groupedRacks = React.useMemo(() => {
    const groups = new Map<string, RackSetItem>();
    
    racks.forEach((rack) => {
      const key = rack.name;
      const existing = groups.get(key);
      
      if (existing) {
        existing.quantity += rack.quantity || 1;
      } else {
        groups.set(key, { ...rack });
      }
    });
    
    return Array.from(groups.values());
  }, [racks]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-5xl h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Зберегти комплект стелажів</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-4 min-w-0 pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Назва комплекту</Label>
              <Input
                id="name"
                placeholder="Наприклад: Стелажі для складу №1"
                {...register('name')}
                className={errors.name?.message ? 'border-destructive' : ''}
                disabled={createMutation.isPending}
              />
              {errors.name?.message && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="object_name">Назва об'єкта</Label>
              <Input
                id="object_name"
                placeholder="Наприклад: Склад готової продукції"
                {...register('object_name')}
                className={errors.object_name?.message ? 'border-destructive' : ''}
                disabled={createMutation.isPending}
              />
              {errors.object_name?.message && (
                <p className="text-sm text-destructive">{errors.object_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Коментар (необов'язково)</Label>
            <textarea
              id="description"
              rows={2}
              placeholder="Додаткова інформація..."
              {...register('description')}
              disabled={createMutation.isPending}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="border rounded-lg p-4 bg-muted/30">
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
              Склад комплекту
            </h4>

            <div className="space-y-4">
              {groupedRacks.map((rack, index) => {
                const quantity = rack.quantity || 1;
                
                // Отримуємо ціни з prices масиву
                const basePrice = rack.prices?.find((p) => p.type === 'базова' || p.type === 'base')?.value || 0;
                const noIsolatorsPrice = rack.prices?.find((p) => p.type === 'без_ізоляторів' || p.type === 'no_isolators')?.value || 0;
                const zeroPrice = rack.prices?.find((p) => p.type === 'нульова' || p.type === 'zero')?.value || 0;
                const totalZeroPrice = zeroPrice * quantity;

                return (
                  <div key={rack.setId || index} className="border rounded-md bg-background p-3">
                    {/* Номер, назва, кількість */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {index + 1}
                        </span>
                        <p className="font-semibold text-base">{rack.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">
                        Кількість: <span className="font-medium">{quantity}</span> од.
                      </p>
                    </div>

                    {/* Деталізація компонентів */}
                    {rack.components && Object.keys(rack.components).length > 0 && (
                      <div className="mb-3 ml-8">
                        <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
                          Комплектація:
                        </p>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">№</TableHead>
                              <TableHead>Назва</TableHead>
                              <TableHead className="text-right">К-сть на 1 од</TableHead>
                              <TableHead className="text-right">Всього</TableHead>
                              <TableHead className="text-right">Ціна</TableHead>
                              <TableHead className="text-right">Сума</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(rack.components).flatMap(([category, items]) =>
                              Array.isArray(items) ? items.map(item => ({ category, ...item })) : []
                            ).map((component, compIndex) => (
                              <TableRow key={compIndex}>
                                <TableCell className="text-sm text-muted-foreground">
                                  {compIndex + 1}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {component.name}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="text-sm font-mono">
                                    {component.amount}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="text-sm font-mono font-medium">
                                    {component.amount * quantity}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="text-sm font-mono">
                                    {component.price.toFixed(2)} ₴
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="text-sm font-mono font-medium">
                                    {(component.total * quantity).toFixed(2)} ₴
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Підсумкові ціни */}
                    <div className="ml-8 space-y-2 pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Базова ціна:</span>
                        <span className="font-medium tabular-nums">
                          {basePrice.toFixed(2)} ₴
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ціна без ізоляторів:</span>
                        <span className="font-medium tabular-nums">
                          {noIsolatorsPrice.toFixed(2)} ₴
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Нульова ціна:</span>
                        <span className="font-medium tabular-nums">
                          {zeroPrice.toFixed(2)} ₴
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-2 border-t">
                        <span>Загальна нульова ціна позиції:</span>
                        <span className="text-primary tabular-nums">
                          {totalZeroPrice.toFixed(2)} ₴
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <p className="text-lg font-semibold">Загальна нульова ціна комплекту:</p>
              <p className="text-2xl font-bold text-primary">
                {totalCost.toFixed(2)} ₴
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Checkbox
                id="includePrices"
                checked={includePrices}
                onCheckedChange={(checked) => setIncludePrices(checked as boolean)}
                disabled={isExporting}
              />
              <Label htmlFor="includePrices" className="text-sm font-medium cursor-pointer">
                Додати ціни в експорт
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              disabled={isExporting || racks.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Експорт...' : 'Експорт в Excel'}
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || racks.length === 0}
            >
              {createMutation.isPending ? 'Збереження...' : 'Зберегти комплект'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RackSetModal;
