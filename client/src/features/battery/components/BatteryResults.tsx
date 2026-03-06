import React, { memo } from 'react';
import { useBatteryResultsStore, type BatteryVariant } from '../resultsStore';
import { useBatterySetStore } from '../setStore';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Separator,
  IconButton,
  EmptyState,
  ResultsSkeleton,
  PriceDisplay,
} from '@/shared/components';
import { Plus, CheckCircle2 } from 'lucide-react';

/**
 * Battery Results - відображення результатів підбору
 */
interface BatteryResultsProps {
  isLoading?: boolean;
}

interface PreambleProps {
  variants: BatteryVariant[];
}

interface SpansTableProps {
  variants: BatteryVariant[];
  onAdd: (variant: BatteryVariant, quantity: number) => void;
}

const BatteryResults: React.FC<BatteryResultsProps> = memo(({ isLoading = false }) => {
  const { variants } = useBatteryResultsStore();
  const { addRack } = useBatterySetStore();

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
      {/* Пreamble - короткі вхідні дані */}
      <Preamble variants={variants} />

      {/* Акумулятор - параметри елемента */}
      <BatteryElement variants={variants} />

      {/* Таблиця варіантів прольотів */}
      <SpansTable variants={variants} onAdd={addRack} />
    </div>
  );
});

BatteryResults.displayName = 'BatteryResults';

/**
 * Пreamble - короткі вхідні дані
 */
const Preamble: React.FC<PreambleProps> = memo(({ variants }) => {
  // Унікальні параметри стелажа
  const firstVariant = variants[0];

  // Кількість варіантів
  const variantsCount = variants.length;

  // Мінімальна та максимальна вартість
  const minTotal = Math.min(...variants.map(v => v.total));
  const maxTotal = Math.max(...variants.map(v => v.total));

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-3'>
        <CheckCircle2 className='w-5 h-5 text-success' />
        <p className='text-sm font-medium'>Розрахунок виконано</p>
      </div>
      <Separator />
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-1'>
          <p className='text-xs text-muted-foreground'>Варіантів</p>
          <p className='text-lg font-semibold tabular-nums'>{variantsCount}</p>
        </div>
        <div className='space-y-1'>
          <p className='text-xs text-muted-foreground'>Стелажів</p>
          <p className='text-lg font-semibold tabular-nums'>{firstVariant?.rows} рядн., {firstVariant?.floors} пов.</p>
        </div>
        <div className='space-y-1'>
          <p className='text-xs text-muted-foreground'>Мін. вартість</p>
          <PriceDisplay value={minTotal} size='lg' className='font-semibold text-primary' />
        </div>
        <div className='space-y-1'>
          <p className='text-xs text-muted-foreground'>Макс. вартість</p>
          <PriceDisplay value={maxTotal} size='lg' className='font-semibold text-primary' />
        </div>
      </div>
    </div>
  );
});

Preamble.displayName = 'Preamble';

/**
 * BatteryElement - параметри елемента, кількість, початкові параметри стелажа
 */
const BatteryElement: React.FC<PreambleProps> = memo(({ variants }) => {
  const firstVariant = variants[0];

  if (!firstVariant) return null;

  return (
    <div className='space-y-3'>
      <h3 className='text-sm font-semibold'>Акумулятор</h3>
      <Separator />
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-1'>
          <p className='text-xs text-muted-foreground'>Розміри елемента</p>
          <p className='text-sm font-medium tabular-nums'>
            {firstVariant.length} × {firstVariant.width} × {firstVariant.height} мм
          </p>
        </div>
        <div className='space-y-1'>
          <p className='text-xs text-muted-foreground'>Кількість</p>
          <p className='text-sm font-medium tabular-nums'>-</p>
        </div>
      </div>

      <div className='pt-2'>
        <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
          Початкові параметри стелажа
        </h4>
        <div className='grid grid-cols-3 gap-4'>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Ширина</p>
            <p className='text-sm font-medium tabular-nums'>{firstVariant.width} мм</p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Висота</p>
            <p className='text-sm font-medium tabular-nums'>{firstVariant.height} мм</p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Довжина</p>
            <p className='text-sm font-medium tabular-nums'>{firstVariant.length} мм</p>
          </div>
        </div>
      </div>

      <div className='pt-2'>
        <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
          Розрахункова довжина стелажа
        </h4>
        <p className='text-base font-semibold tabular-nums text-primary'>
          {firstVariant.length} мм
        </p>
      </div>
    </div>
  );
});

BatteryElement.displayName = 'BatteryElement';

/**
 * SpansTable - таблиця варіантів прольотів з кнопкою додавання
 */
const SpansTable: React.FC<SpansTableProps> = memo(({ variants, onAdd }) => {
  if (variants.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className='space-y-3'>
      <h3 className='text-sm font-semibold'>Варіанти прольотів</h3>
      <Separator />
      <div className='rounded-md border overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='h-11 font-medium'>Абревіатура стелажа</TableHead>
              <TableHead className='h-11 font-medium text-right'>Прольоти</TableHead>
              <TableHead className='h-11 font-medium text-right'>Балок</TableHead>
              <TableHead className='h-11 font-medium text-right'>Вартість, ₴</TableHead>
              <TableHead className='h-11 w-[44px]' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, index) => (
              <TableRow
                key={`${variant._index}-${index}`}
                className='h-12 hover:bg-muted/30 transition-colors'
              >
                <TableCell className='max-w-[200px]'>
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium leading-none font-mono'>{variant.name}</p>
                    <p className='text-xs text-muted-foreground tabular-nums'>
                      {variant.width} × {variant.height} мм
                    </p>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <span className='text-sm font-mono tabular-nums'>
                    {variant.combination.join('+')} мм
                  </span>
                </TableCell>
                <TableCell className='text-right'>
                  <span className='text-sm font-mono tabular-nums'>
                    {variant.beams} шт
                  </span>
                </TableCell>
                <TableCell className='text-right'>
                  <PriceDisplay value={variant.total} className='font-medium' />
                </TableCell>
                <TableCell className='p-0'>
                  <div className='flex items-center justify-center h-full'>
                    <IconButton
                      icon={Plus}
                      variant='icon'
                      onClick={() => onAdd(variant, 1)}
                      aria-label={`Додати ${variant.name}`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

SpansTable.displayName = 'SpansTable';

export default BatteryResults;
