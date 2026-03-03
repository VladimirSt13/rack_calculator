import React, { useState, memo } from 'react';
import { useBatteryResultsStore } from '../resultsStore';
import { useBatterySetStore } from '../setStore';
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
import { Plus, CheckCircle2, CircleDashed } from 'lucide-react';

/**
 * Battery Results - відображення результатів підбору
 */
interface BatteryResultsProps {
  isLoading?: boolean;
}

const BatteryResults: React.FC<BatteryResultsProps> = memo(({ isLoading = false }) => {
  const { variants } = useBatteryResultsStore();
  const { addRack } = useBatterySetStore();
  const [activeTab, setActiveTab] = useState<string>('variants');

  const hasVariants = variants && variants.length > 0;
  const showSkeleton = isLoading;

  if (showSkeleton) {
    return <ResultsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <CalculationStatus hasVariants={hasVariants} variants={variants} />
      <SummaryMetrics variants={variants} />
      <ResultsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variants={variants}
        onAdd={addRack}
      />
    </div>
  );
});

BatteryResults.displayName = 'BatteryResults';

/**
 * ResultsSkeleton - скелетон для завантаження результатів
 */
const ResultsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Status Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 py-1">
          <Skeleton className="w-6 h-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Separator />
      </div>

      {/* Metrics Skeleton */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-px bg-border rounded-md overflow-hidden">
          <div className="bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Separator />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-1">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
        <Separator />
        <div className="min-h-[200px] space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
};

/**
 * CalculationStatus - статус розрахунку
 */
interface CalculationStatusProps {
  hasVariants: boolean;
  variants?: any[] | null;
}

const CalculationStatus: React.FC<CalculationStatusProps> = memo(({ hasVariants, variants }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 py-1" role="status" aria-live="polite">
        <div className="flex items-center justify-center w-6 h-6" aria-hidden="true">
          {hasVariants ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <CircleDashed className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-none">
            {hasVariants ? 'Розрахунок виконано' : 'Очікування розрахунку'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {hasVariants
              ? `Знайдено ${variants?.length || 0} варіантів`
              : 'Заповніть форму та натисніть "Підібрати"'}
          </p>
        </div>
      </div>
      <Separator />
    </div>
  );
});

CalculationStatus.displayName = 'CalculationStatus';

/**
 * ResultsTabs - компонент табів з результатами
 */
interface ResultsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  variants?: any[] | null;
  onAdd: (variant: any, quantity: number) => void;
}

const ResultsTabs: React.FC<ResultsTabsProps> = memo(({ activeTab, onTabChange, variants, onAdd }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 h-9" role="tablist" aria-label="Результати підбору">
        <TabsTrigger value="variants" className="text-xs gap-1" role="tab">
          <span className="hidden sm:inline">Варіанти</span>
          <span className="sm:hidden">Вар.</span>
        </TabsTrigger>
        <TabsTrigger value="structure" className="text-xs gap-1" role="tab">
          <span className="hidden sm:inline">Структура</span>
          <span className="sm:hidden">Струк.</span>
        </TabsTrigger>
        <TabsTrigger value="load" className="text-xs gap-1" role="tab">
          <span className="hidden sm:inline">Навантаження</span>
          <span className="sm:hidden">Навант.</span>
        </TabsTrigger>
        <TabsTrigger value="pricing" className="text-xs gap-1" role="tab">
          <span className="hidden sm:inline">Вартість</span>
          <span className="sm:hidden">Варт.</span>
        </TabsTrigger>
      </TabsList>

      <Separator />

      <div className="min-h-[200px]">
        <TabsContent value="variants" className="mt-0" role="tabpanel">
          <ResultsTable variants={variants} onAdd={onAdd} />
        </TabsContent>

        <TabsContent value="structure" className="mt-0" role="tabpanel">
          <StructureView variants={variants} />
        </TabsContent>

        <TabsContent value="load" className="mt-0" role="tabpanel">
          <LoadAnalysisView variants={variants} />
        </TabsContent>

        <TabsContent value="pricing" className="mt-0" role="tabpanel">
          <PricingView variants={variants} />
        </TabsContent>
      </div>
    </Tabs>
  );
});

ResultsTabs.displayName = 'ResultsTabs';

/**
 * SummaryMetrics - сітка метрик
 */
interface SummaryMetricsProps {
  variants?: Array<{
    name: string;
    width: number;
    height: number;
    beams: number;
    total: number;
  }> | null;
}

const SummaryMetrics: React.FC<SummaryMetricsProps> = memo(({ variants }) => {
  const hasVariants = variants && variants.length > 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-px bg-border rounded-md overflow-hidden" role="region" aria-label="Метрики">
        <MetricCell
          label="Знайдено варіантів"
          value={hasVariants ? variants.length.toString() : '—'}
        />
        <MetricCell
          label="Вартість"
          value={
            hasVariants
              ? `${Math.min(...variants.map(v => v.total)).toFixed(0)} – ${Math.max(...variants.map(v => v.total)).toFixed(0)} ₴`
              : '—'
          }
        />
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
    <div className="bg-card p-4 space-y-1.5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold tabular-nums" aria-label={value}>{value}</p>
    </div>
  );
});

MetricCell.displayName = 'MetricCell';

/**
 * ResultsTable - таблиця варіантів
 */
interface ResultsTableProps {
  variants?: Array<{
    name: string;
    width: number;
    height: number;
    combination: number[];
    beams: number;
    total: number;
  }> | null;
  onAdd: (variant: any, quantity: number) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = memo(({ variants, onAdd }) => {
  const hasVariants = variants && variants.length > 0;

  if (!hasVariants) {
    return <EmptyState message="Варіанти з'являться після розрахунку" />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b">
              <TableHead className="h-11 font-medium">Назва</TableHead>
              <TableHead className="h-11 font-medium text-right">Прольоти</TableHead>
              <TableHead className="h-11 font-medium text-right">Балок</TableHead>
              <TableHead className="h-11 font-medium text-right">Вартість</TableHead>
              <TableHead className="h-11 w-[44px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, index) => (
              <TableRow
                key={index}
                className="h-12 hover:bg-muted/30 transition-colors border-b last:border-b-0"
              >
                <TableCell className="max-w-[200px]">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">{variant.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {variant.width} × {variant.height} мм
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-mono tabular-nums">
                    {variant.combination.join('+')} мм
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-mono tabular-nums">
                    {variant.beams} шт
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-mono tabular-nums font-medium">
                    {variant.total.toFixed(2)} ₴
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    onClick={() => onAdd(variant, 1)}
                    aria-label={`Додати ${variant.name}`}
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

ResultsTable.displayName = 'ResultsTable';

/**
 * StructureView - перегляд структури стелажа
 */
const StructureView: React.FC<{ variants?: any[] | null }> = memo(({ variants }) => {
  const hasVariants = variants && variants.length > 0;

  if (!hasVariants) {
    return <EmptyState message="Структура з'явиться після розрахунку" />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Конструкція стелажа для обраного варіанту
      </p>
      <div className="rounded-md border border-border p-6 bg-muted/20">
        <p className="text-sm text-muted-foreground text-center py-8">
          Деталі структури (компоненти, з'єднання, матеріали)
        </p>
      </div>
    </div>
  );
});

StructureView.displayName = 'StructureView';

/**
 * LoadAnalysisView - аналіз навантажень
 */
const LoadAnalysisView: React.FC<{ variants?: any[] | null }> = memo(({ variants }) => {
  const hasVariants = variants && variants.length > 0;

  if (!hasVariants) {
    return <EmptyState message="Аналіз навантажень з'явиться після розрахунку" />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Розподіл навантажень на конструкцію
      </p>
      <div className="rounded-md border border-border p-6 bg-muted/20">
        <p className="text-sm text-muted-foreground text-center py-8">
          Дані про навантаження (кг/м², коефіцієнти запасу)
        </p>
      </div>
    </div>
  );
});

LoadAnalysisView.displayName = 'LoadAnalysisView';

/**
 * PricingView - детальна вартість
 */
const PricingView: React.FC<{ variants?: any[] | null }> = memo(({ variants }) => {
  const hasVariants = variants && variants.length > 0;

  if (!hasVariants) {
    return <EmptyState message="Деталі вартості з'являться після розрахунку" />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Деталізація вартості по компонентах
      </p>
      <div className="rounded-md border border-border p-6 bg-muted/20">
        <p className="text-sm text-muted-foreground text-center py-8">
          Розбивка вартості (опори, балки, прольоти, кріплення)
        </p>
      </div>
    </div>
  );
});

PricingView.displayName = 'PricingView';

/**
 * EmptyState - стан відсутності даних
 */
const EmptyState: React.FC<{ message: string }> = memo(({ message }) => {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm text-muted-foreground text-center max-w-xs">{message}</p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default BatteryResults;
