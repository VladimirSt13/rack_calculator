import React, { memo, useState } from 'react';
import { useBatteryResultsStore, type BatteryVariant } from '@/features/battery/resultsStore';
import { useBatterySetStore } from '@/features/battery/setStore';
import { useBatteryFormStore } from '@/features/battery/formStore';
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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from '@/shared/components';
import { Plus, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ComponentItem } from '@rack-calculator/shared';

/**
 * Battery Results - відображення результатів підбору
 */
interface BatteryResultsProps {
  isLoading?: boolean;
}

interface PreambleProps {
  variants: BatteryVariant[];
}

interface BatteryElementProps {
  variants: BatteryVariant[];
}

interface SpansTableProps {
  variants: BatteryVariant[];
  onAdd: (variant: BatteryVariant, quantity: number) => void;
}

const BatteryResults: React.FC<BatteryResultsProps> = memo(({ isLoading = false }) => {
  const { variants, requiredLength } = useBatteryResultsStore();
  const { addRack } = useBatterySetStore();
  const [showComponents, setShowComponents] = useState(false);

  const hasVariants = variants && variants.length > 0;
  const showSkeleton = isLoading;

  if (showSkeleton) {
    return <ResultsSkeleton rows={3} />;
  }

  if (!hasVariants) {
    return <EmptyState />;
  }

  // Підрахунок загальних компонентів для всіх доданих стелажів
  const selectedVariant = variants[0]; // Беремо перший варіант для прикладу

  return (
    <div className='space-y-6'>
      {/* Пreamble - короткі вхідні дані */}
      <Preamble variants={variants} />

      {/* Акумулятор - параметри елемента */}
      <BatteryElement variants={variants} />

      {/* Таблиця варіантів */}
      <SpansTable variants={variants} onAdd={addRack} />

      {/* Склад комплекту (розгорнутий) */}
      {selectedVariant?.components && (
        <ComponentsCard
          components={selectedVariant.components}
          isOpen={showComponents}
          onToggle={() => setShowComponents(!showComponents)}
        />
      )}
    </div>
  );
});

BatteryResults.displayName = 'BatteryResults';

/**
 * Пreamble - короткі вхідні дані
 */
const Preamble: React.FC<PreambleProps> = memo(({ variants }) => {
  // Кількість варіантів
  const variantsCount = variants.length;

  // Розрахунок мін/макс вартості (нульова ціна)
  const prices = variants
    .flatMap((v) => v.prices || [])
    .filter((p) => p.type === 'нульова' || p.type === 'zero');
  
  const minTotal = prices.length > 0 ? Math.min(...prices.map((p) => p.value)) : 0;
  const maxTotal = prices.length > 0 ? Math.max(...prices.map((p) => p.value)) : 0;

  const firstVariant = variants[0];

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
          <p className='text-xs text-muted-foreground'>Конфігурація</p>
          <p className='text-lg font-semibold tabular-nums'>
            {firstVariant?.config.rows} рядн.{firstVariant?.config.floors > 1 ? `, ${firstVariant?.config.floors} пов.` : ''}
          </p>
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
 * BatteryElement - параметри акумулятора з форми
 */
const BatteryElement: React.FC<BatteryElementProps> = memo(({ variants }) => {
  const formState = useBatteryFormStore();
  const firstVariant = variants[0];

  if (!firstVariant || !formState) return null;

  return (
    <div className='space-y-3'>
      <h3 className='text-sm font-semibold'>Акумулятор</h3>
      <Separator />
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-1'>
          <p className='text-xs text-muted-foreground'>Розміри елемента (Д×Ш×В)</p>
          <p className='text-sm font-medium tabular-nums'>
            {formState.length} × {formState.width} × {formState.height} мм
          </p>
        </div>
        <div className='space-y-1'>
          <p className='text-xs text-muted-foreground'>Кількість</p>
          <p className='text-sm font-medium tabular-nums'>{formState.count} од.</p>
        </div>
      </div>

      <div className='pt-2'>
        <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
          Розрахункова довжина стелажа
        </h4>
        <p className='text-base font-semibold tabular-nums text-primary'>
          {requiredLength || 0} мм
        </p>
      </div>
    </div>
  );
});

BatteryElement.displayName = 'BatteryElement';

/**
 * SpansTable - таблиця варіантів з кнопкою додавання
 */
const SpansTable: React.FC<SpansTableProps> = memo(({ variants, onAdd }) => {
  if (variants.length === 0) {
    return <EmptyState />;
  }

  // Отримати нульову ціну
  const getZeroPrice = (variant: BatteryVariant) => {
    const priceItem = variant.prices?.find((p) => p.type === 'нульова' || p.type === 'zero');
    return priceItem?.value || 0;
  };

  // Формування назви: Стелаж ... L1A2C-1000/430 (комбінація / висота / н бал.)
  const formatName = (variant: BatteryVariant) => {
    const combinationStr = variant.combination.join('+');
    const beamsCount = variant.beams;
    const beamsLabel = beamsCount === 1 ? 'балка' : beamsCount <= 4 ? 'балки' : 'балок';
    
    // Якщо багатоповерховий - додаємо висоту
    if (variant.config.floors > 1) {
      return `${variant.name} (${combinationStr} / ${variant.config.verticalSupports ? 'V' : ''} / ${beamsCount} ${beamsLabel})`;
    }
    
    // Якщо одноповерховий - без висоти
    return `${variant.name} (${combinationStr} / ${beamsCount} ${beamsLabel})`;
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
              <TableHead className='h-11 font-medium'>Назва</TableHead>
              <TableHead className='h-11 font-medium text-right'>Нульова ціна, ₴</TableHead>
              <TableHead className='h-11 w-[44px]' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, index) => {
              const zeroPrice = getZeroPrice(variant);
              const formattedName = formatName(variant);

              return (
                <TableRow
                  key={`${variant._index}-${index}`}
                  className='h-12 hover:bg-muted/30 transition-colors'
                >
                  <TableCell className='text-sm text-muted-foreground text-center'>
                    {index + 1}
                  </TableCell>
                  <TableCell className='max-w-[400px]'>
                    <p className='text-sm font-medium font-mono'>{formattedName}</p>
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
                        aria-label={`Додати ${variant.name}`}
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

/**
 * ComponentsCard - картка з компонентами стелажа
 */
interface ComponentsCardProps {
  components: Record<string, ComponentItem | ComponentItem[]>;
  isOpen: boolean;
  onToggle: () => void;
}

const ComponentsCard: React.FC<ComponentsCardProps> = memo(({ components, isOpen, onToggle }) => {
  // Перетворення компонентів в плоский масив
  const allComponents: (ComponentItem & { category: string })[] = [];
  
  Object.entries(components).forEach(([category, items]) => {
    const itemsArray = Array.isArray(items) ? items : [items];
    itemsArray.forEach((item) => {
      if (item && item.name) {
        allComponents.push({ category, ...item });
      }
    });
  });

  if (allComponents.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base'>Склад комплекту</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={onToggle}
            className='h-8'
          >
            {isOpen ? (
              <>
                <ChevronUp className='w-4 h-4 mr-1' />
                Згорнути
              </>
            ) : (
              <>
                <ChevronDown className='w-4 h-4 mr-1' />
                Розгорнути
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className='rounded-md border overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead className='h-11 font-medium'>№</TableHead>
                  <TableHead className='h-11 font-medium'>Назва</TableHead>
                  <TableHead className='h-11 font-medium text-right'>К-сть</TableHead>
                  <TableHead className='h-11 font-medium text-right'>Ціна</TableHead>
                  <TableHead className='h-11 font-medium text-right'>Сума</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allComponents.map((component, index) => (
                  <TableRow key={`${component.category}-${index}`} className='h-12'>
                    <TableCell className='text-sm text-muted-foreground w-[40px]'>
                      {index + 1}
                    </TableCell>
                    <TableCell className='font-medium'>
                      <div className='space-y-0.5'>
                        <p className='text-sm'>{component.name}</p>
                        {component.category !== 'other' && (
                          <p className='text-xs text-muted-foreground capitalize'>
                            {component.category === 'supports' && 'Опори'}
                            {component.category === 'beams' && 'Балки'}
                            {component.category === 'vertical_supports' && 'Верт. стійки'}
                            {component.category === 'braces' && 'Розкоси'}
                            {component.category === 'isolators' && 'Ізолятори'}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <span className='text-sm font-mono tabular-nums'>
                        {component.amount} шт
                      </span>
                    </TableCell>
                    <TableCell className='text-right'>
                      <PriceDisplay value={component.price} className='text-sm font-mono' />
                    </TableCell>
                    <TableCell className='text-right'>
                      <PriceDisplay value={component.total} className='text-sm font-mono font-medium' />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
});

ComponentsCard.displayName = 'ComponentsCard';

export default BatteryResults;
