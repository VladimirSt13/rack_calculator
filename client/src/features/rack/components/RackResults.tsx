import React, { useState, useMemo, memo } from 'react';
import { useRackResultsStore } from '../resultsStore';
import { useRackSetStore } from '../setStore';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
} from '../../../shared/components';
import { Plus, CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';

/**
 * Rack Results - відображення результатів розрахунку
 */
interface RackResultsProps {
  isLoading?: boolean;
}

const RackResults: React.FC<RackResultsProps> = memo(({ isLoading = false }) => {
  const { result } = useRackResultsStore();
  const { addRack } = useRackSetStore();
  const [activeTab, setActiveTab] = useState<string>('specification');

  const hasResult = result !== null;
  const showSkeleton = isLoading || (!hasResult && isLoading);

  if (showSkeleton) {
    return <ResultsSkeleton />;
  }

  return (
    <div className='space-y-6'>
      <CalculationStatus hasResult={hasResult} result={result} />
      <SummaryMetrics result={result} />
      <ResultsTabs activeTab={activeTab} onTabChange={setActiveTab} result={result} onAddToSet={addRack} />
    </div>
  );
});

RackResults.displayName = 'RackResults';

/**
 * ResultsSkeleton - скелетон для завантаження результатів
 */
const ResultsSkeleton: React.FC = () => {
  return (
    <div className='space-y-6'>
      {/* Status Skeleton */}
      <div className='space-y-2'>
        <div className='flex items-center gap-3 py-1'>
          <Skeleton className='w-6 h-6 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-48' />
          </div>
        </div>
        <Separator />
      </div>

      {/* Metrics Skeleton */}
      <div className='space-y-3'>
        <div className='grid grid-cols-2 gap-px bg-border rounded-md overflow-hidden'>
          <div className='bg-card p-4 space-y-2'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-6 w-20' />
          </div>
          <div className='bg-card p-4 space-y-2'>
            <Skeleton className='h-3 w-20' />
            <Skeleton className='h-6 w-24' />
          </div>
        </div>
        <Separator />
      </div>

      {/* Tabs Skeleton */}
      <div className='space-y-4'>
        <div className='grid grid-cols-3 gap-1'>
          <Skeleton className='h-9' />
          <Skeleton className='h-9' />
          <Skeleton className='h-9' />
        </div>
        <Separator />
        <div className='min-h-[200px] space-y-4'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>
      </div>
    </div>
  );
};

/**
 * ResultsTabs - компонент табів з результатами
 */
interface ResultsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  result: any;
  onAddToSet: (result: any, quantity: number) => void;
}

const ResultsTabs: React.FC<ResultsTabsProps> = memo(({ activeTab, onTabChange, result, onAddToSet }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className='w-full'>
      <TabsList className='grid grid-cols-3 h-9' role='tablist' aria-label='Результати розрахунку'>
        <TabsTrigger value='specification' className='text-xs gap-1' role='tab'>
          <span className='hidden sm:inline'>Специфікація</span>
          <span className='sm:hidden'>Специф.</span>
        </TabsTrigger>
        <TabsTrigger value='components' className='text-xs gap-1' role='tab'>
          <span className='hidden sm:inline'>Компоненти</span>
          <span className='sm:hidden'>Компон.</span>
        </TabsTrigger>
        <TabsTrigger value='pricing' className='text-xs gap-1' role='tab'>
          <span className='hidden sm:inline'>Вартість</span>
          <span className='sm:hidden'>Варт.</span>
        </TabsTrigger>
      </TabsList>

      <Separator />

      <div className='min-h-[200px]'>
        <TabsContent value='specification' className='mt-0' role='tabpanel'>
          <SpecificationView result={result} onAddToSet={onAddToSet} />
        </TabsContent>

        <TabsContent value='components' className='mt-0' role='tabpanel'>
          <ComponentsView result={result} />
        </TabsContent>

        <TabsContent value='pricing' className='mt-0' role='tabpanel'>
          <PricingView result={result} />
        </TabsContent>
      </div>
    </Tabs>
  );
});

ResultsTabs.displayName = 'ResultsTabs';

/**
 * CalculationStatus - статус розрахунку
 */
interface CalculationStatusProps {
  hasResult: boolean;
  result?: { name: string } | null;
  isCalculating?: boolean;
}

const CalculationStatus: React.FC<CalculationStatusProps> = memo(({ hasResult, result, isCalculating = false }) => {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-3 py-1' role='status' aria-live='polite'>
        <div className='flex items-center justify-center w-6 h-6' aria-hidden='true'>
          {isCalculating ? (
            <Loader2 className='w-5 h-5 text-primary animate-spin' />
          ) : hasResult ? (
            <CheckCircle2 className='w-5 h-5 text-success' />
          ) : (
            <CircleDashed className='w-5 h-5 text-muted-foreground' />
          )}
        </div>
        <div className='flex-1'>
          <p className='text-sm font-medium leading-none'>
            {isCalculating ? 'Розрахунок...' : hasResult ? 'Розрахунок виконано' : 'Очікування розрахунку'}
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            {isCalculating
              ? 'Обробка даних...'
              : hasResult
              ? `Стелаж: ${result?.name}`
              : 'Заповніть форму та натисніть "Розрахувати"'}
          </p>
        </div>
      </div>
      <Separator />
    </div>
  );
});

CalculationStatus.displayName = 'CalculationStatus';

/**
 * SummaryMetrics - сітка метрик
 */
interface SummaryMetricsProps {
  result?: {
    name: string;
    total: number;
    totalWithoutIsolators: number;
    zeroBase: number;
  } | null;
}

const SummaryMetrics: React.FC<SummaryMetricsProps> = memo(({ result }) => {
  const hasResult = result != null;

  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-2 gap-px bg-border rounded-md overflow-hidden' role='region' aria-label='Метрики'>
        <MetricCell label='Загальна вартість' value={hasResult ? `${result.total.toFixed(0)} ₴` : '—'} />
        <MetricCell label='Нульова база' value={hasResult ? `${result.zeroBase.toFixed(0)} ₴` : '—'} />
      </div>
      <Separator />
    </div>
  );
});

SummaryMetrics.displayName = 'SummaryMetrics';

/**
 * MetricCell - комірка метрики
 */
interface MetricCellProps {
  label: string;
  value: string;
}

const MetricCell: React.FC<MetricCellProps> = memo(({ label, value }) => {
  return (
    <div className='bg-card p-4 space-y-1.5'>
      <p className='text-xs text-muted-foreground uppercase tracking-wide'>{label}</p>
      <p className='text-lg font-semibold tabular-nums' aria-label={value}>
        {value}
      </p>
    </div>
  );
});

MetricCell.displayName = 'MetricCell';

/**
 * SpecificationView - перегляд специфікації
 */
interface SpecificationViewProps {
  result?: {
    name: string;
    total: number;
    totalWithoutIsolators: number;
    zeroBase: number;
  } | null;
  onAddToSet: (result: any, quantity: number) => void;
}

const SpecificationView: React.FC<SpecificationViewProps> = memo(({ result, onAddToSet }) => {
  const hasResult = result != null;

  if (!hasResult) {
    return <EmptyState message="Специфікація з'явиться після розрахунку" />;
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <p className='text-xs text-muted-foreground uppercase tracking-wide'>Назва</p>
          <p className='text-xl font-semibold'>{result.name}</p>
        </div>

        <div className='grid grid-cols-3 gap-4' role='region' aria-label='Вартість'>
          <div className='space-y-1.5'>
            <p className='text-xs text-muted-foreground'>Загальна</p>
            <p className='text-sm font-medium tabular-nums'>{result.total.toFixed(2)} ₴</p>
          </div>
          <div className='space-y-1.5'>
            <p className='text-xs text-muted-foreground'>Без ізоляторів</p>
            <p className='text-sm font-medium tabular-nums'>{result.totalWithoutIsolators.toFixed(2)} ₴</p>
          </div>
          <div className='space-y-1.5'>
            <p className='text-xs text-muted-foreground'>Нульова</p>
            <p className='text-sm font-medium tabular-nums'>{result.zeroBase.toFixed(2)} ₴</p>
          </div>
        </div>
      </div>

      <Button
        variant='outline'
        className='w-full'
        onClick={() => onAddToSet(result, 1)}
        aria-label='Додати стелаж до комплекту'
      >
        <Plus className='w-4 h-4 mr-2' aria-hidden='true' />
        Додати до комплекту
      </Button>
    </div>
  );
});

SpecificationView.displayName = 'SpecificationView';

/**
 * ComponentsView - таблиця компонентів
 */
interface ComponentsViewProps {
  result?: {
    components?: Record<string, any>;
  } | null;
}

const ComponentsView: React.FC<ComponentsViewProps> = memo(({ result }) => {
  const hasResult = result != null;

  if (!hasResult || !result.components) {
    return <EmptyState message="Компоненти з'являться після розрахунку" />;
  }

  const allComponents = useMemo(() => {
    return Object.values(result.components || {}).flatMap((items: any) => (Array.isArray(items) ? items : [items]));
  }, [result.components]);

  if (allComponents.length === 0) {
    return <EmptyState message='Немає компонентів для відображення' />;
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-md border border-border overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50 border-b'>
              <TableHead className='h-11 font-medium'>Компонент</TableHead>
              <TableHead className='h-11 font-medium text-right'>Кількість</TableHead>
              <TableHead className='h-11 font-medium text-right'>Ціна за од., ₴</TableHead>
              <TableHead className='h-11 font-medium text-right'>
                <span className='block'>Загальна</span>
                <span className='block'>вартість, ₴</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allComponents.map((item: any, idx: number) => (
              <TableRow key={idx} className='h-12 hover:bg-muted/30 transition-colors border-b last:border-b-0'>
                <TableCell className='font-medium'>{item.name}</TableCell>
                <TableCell className='text-right'>
                  <span className='text-sm font-mono tabular-nums'>{item.amount}</span>
                </TableCell>
                <TableCell className='text-right'>
                  <span className='text-sm font-mono tabular-nums'>{item.price.toFixed(2)}</span>
                </TableCell>
                <TableCell className='text-right'>
                  <span className='text-sm font-mono tabular-nums font-medium'>{item.total.toFixed(2)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

ComponentsView.displayName = 'ComponentsView';

/**
 * PricingView - детальна вартість
 */
interface PricingViewProps {
  result?: {
    total: number;
    totalWithoutIsolators: number;
    zeroBase: number;
  } | null;
}

const PricingView: React.FC<PricingViewProps> = memo(({ result }) => {
  const hasResult = result != null;

  if (!hasResult) {
    return <EmptyState message="Деталі вартості з'являться після розрахунку" />;
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <div className='flex justify-between items-center py-2.5 border-b border-dashed'>
          <span className='text-sm text-muted-foreground'>Загальна вартість</span>
          <span className='text-sm font-medium tabular-nums'>{result.total.toFixed(2)} ₴</span>
        </div>
        <div className='flex justify-between items-center py-2.5 border-b border-dashed'>
          <span className='text-sm text-muted-foreground'>Без ізоляторів</span>
          <span className='text-sm font-medium tabular-nums'>{result.totalWithoutIsolators.toFixed(2)} ₴</span>
        </div>
        <div className='flex justify-between items-center py-3 bg-muted/50 px-4 rounded-md'>
          <span className='text-base font-semibold'>Нульова база</span>
          <span className='text-lg font-bold tabular-nums'>{result.zeroBase.toFixed(2)} ₴</span>
        </div>
      </div>
      <p className='text-xs text-muted-foreground text-center pt-2'>* Нульова база включає коефіцієнт 1.44</p>
    </div>
  );
});

PricingView.displayName = 'PricingView';

/**
 * EmptyState - стан відсутності даних
 */
const EmptyState: React.FC<{ message: string }> = memo(({ message }) => {
  return (
    <div className='flex items-center justify-center py-16'>
      <p className='text-sm text-muted-foreground text-center max-w-xs'>{message}</p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default RackResults;
