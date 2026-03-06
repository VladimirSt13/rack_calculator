import React, { memo } from 'react';
import { useRackResultsStore, type RackCalculationResult } from '../resultsStore';
import { useRackSetStore } from '../setStore';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Skeleton,
} from '../../../shared/components';
import { Plus, CheckCircle2, CircleDashed } from 'lucide-react';

/**
 * Rack Results - відображення результатів розрахунку
 */
interface RackResultsProps {
  isLoading?: boolean;
}

const RackResults: React.FC<RackResultsProps> = memo(({ isLoading = false }) => {
  const { result } = useRackResultsStore();
  const { addRack } = useRackSetStore();

  const hasResult = result !== null;
  const showSkeleton = isLoading || (!hasResult && isLoading);

  if (showSkeleton) {
    return <ResultsSkeleton />;
  }

  if (!hasResult) {
    return <EmptyState />;
  }

  return (
    <div className='space-y-4'>
      {/* Пreamble - короткі вхідні дані */}
      <PreambleCard result={result} />

      {/* Стелаж - повна назва */}
      <RackNameCard result={result} />

      {/* Таблиця комплектуючих */}
      <ComponentsTableCard result={result} onAddToSet={addRack} />
    </div>
  );
});

RackResults.displayName = 'RackResults';

/**
 * ResultsSkeleton - скелетон для завантаження
 */
const ResultsSkeleton: React.FC = () => {
  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-24' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-8 w-full' />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * EmptyState - стан відсутності даних
 */
const EmptyState: React.FC = () => {
  return (
    <Card>
      <CardContent className='flex items-center justify-center py-16'>
        <div className='text-center space-y-3'>
          <CircleDashed className='w-12 h-12 text-muted-foreground mx-auto' />
          <p className='text-sm text-muted-foreground max-w-xs'>
            Заповніть форму та натисніть "Розрахувати" для отримання результатів
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * ПreambleCard - короткі вхідні дані
 */
interface PreambleCardProps {
  result: RackCalculationResult;
}

const PreambleCard: React.FC<PreambleCardProps> = memo(({ result }) => {
  // Витягуємо параметри з компонентів
  const beams = result.components.beams || [];
  const supports = result.components.supports || [];

  // Кількість балок
  const totalBeams = Array.isArray(beams) ? beams.reduce((sum, b) => sum + b.amount, 0) : beams.amount || 0;

  // Кількість опор
  const totalSupports = Array.isArray(supports)
    ? supports.reduce((sum, s) => sum + s.amount, 0)
    : supports?.amount || 0;

  // Визначаємо кількість прольотів (сума quantity всіх прольотів з форми)
  const totalSpans = result.spans.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <CheckCircle2 className='w-5 h-5 text-success' />
          <CardTitle className='text-base'>Результати розрахунку</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Прольотів</p>
            <p className='text-lg font-semibold tabular-nums'>{totalSpans}</p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Балок</p>
            <p className='text-lg font-semibold tabular-nums'>{totalBeams} шт</p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Опор</p>
            <p className='text-lg font-semibold tabular-nums'>{totalSupports} шт</p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>Вартість</p>
            <p className='text-lg font-semibold tabular-nums text-primary'>{result.total.toFixed(0)} ₴</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PreambleCard.displayName = 'PreambleCard';

/**
 * RackNameCard - повна назва стелажа
 */
const RackNameCard: React.FC<PreambleCardProps> = memo(({ result }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Стелаж</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-base font-medium leading-relaxed'>{result.name}</p>
      </CardContent>
    </Card>
  );
});

RackNameCard.displayName = 'RackNameCard';

/**
 * ComponentsTableCard - таблиця комплектуючих
 */
interface ComponentsTableCardProps {
  result: RackCalculationResult;
  onAddToSet: (result: RackCalculationResult, quantity: number) => void;
}

const ComponentsTableCard: React.FC<ComponentsTableCardProps> = memo(({ result, onAddToSet }) => {
  // Збираємо всі компоненти в один масив
  const allComponents = Object.values(result.components).flatMap((items) => (Array.isArray(items) ? items : [items]));

  if (allComponents.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Комплектуючі</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='rounded-md border overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/50'>
                <TableHead className='h-11 font-medium'>Компонент</TableHead>
                <TableHead className='h-11 font-medium text-right'>Кількість</TableHead>
                <TableHead className='h-11 font-medium text-right'>Ціна за од., ₴</TableHead>
                <TableHead className='h-11 font-medium text-right'>Загальна вартість, ₴</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allComponents.map((item: any, idx: number) => (
                <TableRow key={idx} className='h-12 hover:bg-muted/30 transition-colors'>
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

        {/* Підсумок */}
        <div className='space-y-2 pt-4 border-t'>
          <div className='flex justify-between items-center py-2'>
            <span className='text-sm text-muted-foreground'>Без ізоляторів</span>
            <span className='text-sm font-medium tabular-nums'>{result.totalWithoutIsolators.toFixed(2)} ₴</span>
          </div>
          <div className='flex justify-between items-center py-3 bg-muted/50 px-4 rounded-md'>
            <span className='text-base font-semibold'>Загальна вартість</span>
            <span className='text-lg font-bold tabular-nums text-primary'>{result.total.toFixed(2)} ₴</span>
          </div>
        </div>

        <Button
          variant='outline'
          className='w-full'
          onClick={() => onAddToSet(result, 1)}
        >
          <Plus className='w-4 h-4 mr-2' />
          Додати до комплекту
        </Button>
      </CardContent>
    </Card>
  );
});

ComponentsTableCard.displayName = 'ComponentsTableCard';

export default RackResults;
