import React, { memo } from 'react';
import { useBatteryResultsStore, type BatteryVariant } from '@/features/battery/resultsStore';
import { useBatterySetStore } from '@/features/battery/setStore';
import { useBatteryFormStore, type BatteryFormState } from '@/features/battery/formStore';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Separator,
  EmptyState,
  ResultsSkeleton,
  PriceDisplay,
  IconButton,
  Badge,
} from '@/shared/components';
import { Plus, CheckCircle2 } from 'lucide-react';

/**
 * Battery Results - відображення результатів підбору
 */
interface BatteryResultsProps {
  isLoading?: boolean;
}

interface SpansTableProps {
  variants: BatteryVariant[];
  onAdd: (variant: BatteryVariant, quantity: number) => void;
}

const BatteryResults: React.FC<BatteryResultsProps> = memo(({ isLoading = false }) => {
  const { variants } = useBatteryResultsStore();
  const { addRack } = useBatterySetStore();
  const formState = useBatteryFormStore();
  const { requiredLength } = useBatteryResultsStore();

  const hasVariants = variants && variants.length > 0;
  const showSkeleton = isLoading;

  if (showSkeleton) {
    return <ResultsSkeleton rows={3} />;
  }

  if (!hasVariants) {
    return <EmptyState />;
  }

  return (
    <div className='space-y-6'>
      <Preamble variants={variants} formState={formState} requiredLength={requiredLength} />
      <SpansTable variants={variants} onAdd={addRack} />
    </div>
  );
});

BatteryResults.displayName = 'BatteryResults';

/**
 * Preamble - короткі вхідні дані
 */
interface PreamblePropsWithForm {
  variants: BatteryVariant[];
  formState: BatteryFormState;
  requiredLength?: number;
}

const Preamble: React.FC<PreamblePropsWithForm> = memo(({ variants, formState, requiredLength }) => {
  // Кількість варіантів
  const variantsCount = variants.length;

  const firstVariant = variants[0];
  const isStep = firstVariant?.config?.supports?.includes('С') || firstVariant?.config?.supports?.includes('C');

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-3'>
        <CheckCircle2 className='w-5 h-5 text-success' />
        <p className='text-sm font-medium'>Розрахунок виконано</p>
      </div>
      <Separator />
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Група: Акумулятор */}
        <div className='space-y-3'>
          <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Акумулятор</p>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Розміри (Д×Ш×В)</p>
            <p className='text-sm font-semibold tabular-nums'>
              {formState?.length} × {formState?.width} × {formState?.height} мм
            </p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Кількість</p>
            <p className='text-sm font-semibold tabular-nums'>{formState?.count} од.</p>
          </div>
        </div>
        
        {/* Група: Стелаж */}
        <div className='space-y-3'>
          <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Стелаж</p>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Довжина</p>
            <p className='text-sm font-semibold tabular-nums'>{requiredLength || 0} мм</p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Тип</p>
            <p className='text-sm font-semibold'>
              {isStep ? 'Ступінчастий' : 'Прямий'}
            </p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Конфігурація</p>
            <p className='text-sm font-semibold tabular-nums'>
              {firstVariant?.config?.rows ?? '—'} рядн.
              {firstVariant?.config?.floors && firstVariant.config.floors > 1
                ? `, ${firstVariant.config.floors} пов.`
                : ''}
            </p>
          </div>
        </div>
        
        {/* Варіантів */}
        <div className='space-y-1 flex items-end'>
          <div className='space-y-1 w-full'>
            <p className='text-xs text-muted-foreground'>Знайдено варіантів</p>
            <p className='text-2xl font-bold tabular-nums text-primary'>{variantsCount}</p>
          </div>
        </div>
        
        {/* Пустий блок для заповнення сітки */}
        <div className='hidden lg:block'></div>
      </div>
    </div>
  );
});

Preamble.displayName = 'Preamble';

/**
 * SpansTable - таблиця варіантів з кнопкою додавання
 */
const SpansTable: React.FC<SpansTableProps> = memo(({ variants, onAdd }) => {
  if (variants.length === 0) {
    return <EmptyState />;
  }

  // Перевіряємо, чи є вертикальні опори хоча б в одному варіанті
  const hasVerticalSupports = variants.some(v => v.config?.verticalSupports || v.verticalSupports);

  // Отримати нульову ціну
  const getZeroPrice = (variant: BatteryVariant) => {
    const priceItem = variant.prices?.find((p) => p.type === 'нульова' || p.type === 'zero');
    return priceItem?.value || 0;
  };

  // Формування назви стелажа
  const formatName = (variant: BatteryVariant) => {
    return variant.name || `Стелаж ${variant.index ? variant.index + 1 : 1}`;
  };

  // Формування переліку спанів
  const formatSpans = (variant: BatteryVariant) => {
    if (!variant.combination || variant.combination.length === 0) {
      return '—';
    }
    return variant.combination.join('+');
  };

  return (
    <div className='space-y-3'>
      <h3 className='text-sm font-semibold'>Варіанти стелажів</h3>
      <Separator />
      <div className='rounded-md border overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='h-11 font-medium w-[40px]'>№</TableHead>
              <TableHead className='h-11 font-medium'>Назва стелажа</TableHead>
              <TableHead className='h-11 font-medium'>Прольоти</TableHead>
              {hasVerticalSupports && (
                <TableHead className='h-11 font-medium'>Верт. опора</TableHead>
              )}
              <TableHead className='h-11 font-medium text-center'>К-сть балок</TableHead>
              <TableHead className='h-11 font-medium text-right'>Нульова ціна, ₴</TableHead>
              <TableHead className='h-11 w-[44px]' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, index) => {
              const zeroPrice = getZeroPrice(variant);
              const formattedName = formatName(variant);
              const spansStr = formatSpans(variant);
              // Захист від undefined config
              const verticalSupports = variant.config?.verticalSupports || variant.verticalSupports;
              const beamsCount = variant.beams;

              return (
                <TableRow key={`${variant._index ?? ''}-${index}`} className='h-12 hover:bg-muted/30 transition-colors'>
                  <TableCell className='text-sm text-muted-foreground text-center'>{index + 1}</TableCell>
                  <TableCell className='max-w-[200px]'>
                    <p className='text-sm font-medium truncate' title={formattedName}>{formattedName}</p>
                  </TableCell>
                  <TableCell className='max-w-[150px]'>
                    <p className='text-sm font-mono truncate' title={spansStr}>{spansStr}</p>
                  </TableCell>
                  {hasVerticalSupports && (
                    <TableCell>
                      {verticalSupports ? (
                        <Badge variant='secondary' className='text-xs'>
                          {verticalSupports}
                        </Badge>
                      ) : (
                        <span className='text-xs text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className='text-center'>
                    <span className='text-sm font-medium tabular-nums'>{beamsCount ?? '—'}</span>
                  </TableCell>
                  <TableCell className='text-right'>
                    <PriceDisplay value={zeroPrice} className='font-medium tabular-nums' />
                  </TableCell>
                  <TableCell className='p-0'>
                    <div className='flex items-center justify-center h-full'>
                      <IconButton
                        icon={Plus}
                        variant='icon'
                        onClick={() => onAdd(variant, 1)}
                        aria-label={`Додати ${formattedName}`}
                        title='Додати в комплект'
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

SpansTable.displayName = 'SpansTable';

export default BatteryResults;
