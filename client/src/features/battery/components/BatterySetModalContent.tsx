import * as React from 'react';
import type { BatterySetForm } from '../useBatterySetModal';
import type { BatterySetItem } from '@/features/battery/setStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/Dialog';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Label } from '@/shared/components/Label';
import { Checkbox } from '@/shared/components/Checkbox';
import { Download } from 'lucide-react';

interface BatterySetModalContentProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    register: (name: string, options?: any) => any;
    handleSubmit: (onSubmit: (data: BatterySetForm) => void) => (e?: React.BaseSyntheticEvent) => void;
    formState: { errors: Record<string, { message?: string }> };
    getValues: () => BatterySetForm;
  };
  includePrices: boolean;
  setIncludePrices: (checked: boolean) => void;
  isExporting: boolean;
  isPending: boolean;
  onSubmit: (data: BatterySetForm) => void;
  handleExport: () => void;
  groupedRacks: Array<BatterySetItem & { quantity: number }>;
  totalCost: number;
  hasRacks: boolean;
}

export const BatterySetModalContent: React.FC<BatterySetModalContentProps> = ({
  isOpen,
  onClose,
  form,
  includePrices,
  setIncludePrices,
  isExporting,
  isPending,
  onSubmit,
  handleExport,
  groupedRacks,
  totalCost,
  hasRacks,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-[95vw] w-full sm:max-w-5xl h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Зберегти комплект стелажів (Акумулятор)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='flex-1 overflow-y-auto space-y-4 min-w-0 pr-2'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Назва комплекту</Label>
              <Input
                id='name'
                placeholder='Наприклад: Стелажі для АКБ'
                {...register('name')}
                className={errors.name?.message ? 'border-destructive' : ''}
                disabled={isPending}
              />
              {errors.name?.message && <p className='text-sm text-destructive'>{errors.name.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='object_name'>Назва об&apos;єкта</Label>
              <Input
                id='object_name'
                placeholder='Наприклад: Склад АКБ'
                {...register('object_name')}
                className={errors.object_name?.message ? 'border-destructive' : ''}
                disabled={isPending}
              />
              {errors.object_name?.message && <p className='text-sm text-destructive'>{errors.object_name.message}</p>}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Коментар (необов&apos;язково)</Label>
            <textarea
              id='description'
              rows={2}
              placeholder='Додаткова інформація...'
              {...register('description')}
              disabled={isPending}
              className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
            />
          </div>

          <div className='border rounded-lg p-4 bg-muted/30'>
            <h4 className='font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground'>
              Склад комплекту
            </h4>

            <div className='space-y-3'>
              {groupedRacks.map((rack, index) => {
                const quantity = rack.quantity || 1;

                const basePrice = rack.prices?.find((p) => p.type === 'базова' || p.type === 'base')?.value || 0;
                const noIsolatorsPrice =
                  rack.prices?.find((p) => p.type === 'без_ізоляторів' || p.type === 'no_isolators')?.value || 0;
                const zeroPrice = rack.prices?.find((p) => p.type === 'нульова' || p.type === 'zero')?.value || 0;
                const totalZeroPrice = zeroPrice * quantity;

                return (
                  <div key={rack.setId || index} className='border rounded-md bg-background p-3'>
                    <div className='mb-3'>
                      <div className='flex items-baseline gap-2 mb-1'>
                        <span className='text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded'>
                          {index + 1}
                        </span>
                        <p className='font-semibold text-base'>{rack.name}</p>
                      </div>
                      <p className='text-sm text-muted-foreground ml-8'>
                        Кількість: <span className='font-medium'>{quantity}</span> од.
                      </p>
                    </div>

                    <div className='ml-8 space-y-2 pt-3 border-t'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>Базова ціна:</span>
                        <span className='font-medium tabular-nums'>{basePrice.toFixed(2)} ₴</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>Ціна без ізоляторів:</span>
                        <span className='font-medium tabular-nums'>{noIsolatorsPrice.toFixed(2)} ₴</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>Нульова ціна:</span>
                        <span className='font-medium tabular-nums'>{zeroPrice.toFixed(2)} ₴</span>
                      </div>
                      <div className='flex justify-between text-base font-semibold pt-2 border-t'>
                        <span>Загальна нульова ціна позиції:</span>
                        <span className='text-primary tabular-nums'>{totalZeroPrice.toFixed(2)} ₴</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className='mt-4 pt-4 border-t flex justify-between items-center'>
              <p className='text-lg font-semibold'>Загальна нульова ціна комплекту:</p>
              <p className='text-2xl font-bold text-primary'>{totalCost.toFixed(2)} ₴</p>
            </div>
          </div>

          <div className='flex items-center gap-6 pt-4 border-t'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='includePrices'
                checked={includePrices}
                onCheckedChange={(checked) => setIncludePrices(checked as boolean)}
                disabled={isExporting}
              />
              <Label htmlFor='includePrices' className='text-sm font-medium cursor-pointer'>
                Додати ціни в експорт
              </Label>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleExport}
              disabled={isExporting || !hasRacks}
              className='gap-2'
            >
              <Download className='w-4 h-4' />
              {isExporting ? 'Експорт...' : 'Експорт в Excel'}
            </Button>
            <div className='flex-1' />
            <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
              Скасувати
            </Button>
            <Button type='submit' disabled={isPending || !hasRacks}>
              {isPending ? 'Збереження...' : 'Зберегти комплект'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BatterySetModalContent;
