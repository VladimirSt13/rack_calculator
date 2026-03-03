import React from 'react';
import { cn } from '../../lib/utils';
import { PageHeader } from './PageHeader';

/**
 * Константи ширин для калькуляторів
 */
export const CALCULATOR_WIDTHS = {
  /** Максимальна ширина контейнера */
  container: '1600px',
  /** Ширина панелі вводу (фіксована) */
  input: '420px',
  /** Панель результатів (гнучка, minmax(0, 1fr)) */
  results: 'auto',
} as const;

/**
 * Режим відображення результатів
 */
export type CalculatorMode = 'analysis' | 'builder';

/**
 * CalculatorPage - універсальний лейаут для сторінок калькуляторів
 * 
 * Ширина:
 * - Container: max-w-[1600px]
 * - Input Panel: 420px (фіксована)
 * - Results Panel: flexible (minmax(0, 1fr))
 */
export interface CalculatorPageProps {
  /** Заголовок сторінки */
  title: string;
  /** Опис сторінки */
  description?: string;
  /** Дії в заголовку (кнопки, перемикачі) */
  headerActions?: React.ReactNode;
  /** Панель вводу (форма, фільтри, кнопки) */
  input: React.ReactNode;
  /** Панель результатів */
  results: React.ReactNode;
  /** Ширина панелі вводу (за замовчуванням 420px) */
  inputWidth?: string;
  /** Режим роботи: analysis (аналіз) | builder (конструктор) */
  mode?: CalculatorMode;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  title,
  description,
  headerActions,
  input,
  results,
  inputWidth = CALCULATOR_WIDTHS.input,
  mode = 'analysis',
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Container: max-w-[1600px], без внутрішніх max-width */}
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 py-6"
        style={{ maxWidth: CALCULATOR_WIDTHS.container }}
      >
        {/* Page Header */}
        <PageHeader
          title={title}
          description={description}
          actions={headerActions}
          className="mb-6"
        />

        {/* Calculator Grid: input (fixed) + results (flexible) */}
        {/* Mobile: single column, Desktop: sidebar + content */}
        <div
          className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,min-content)_minmax(0,1fr)]"
          style={{
            gridTemplateColumns: `minmax(0, ${inputWidth}) minmax(0, 1fr)`,
          }}
        >
          {/* Input Panel: 420px fixed */}
          <InputPanel width={inputWidth}>{input}</InputPanel>

          {/* Results Panel: flexible, no max-width */}
          <ResultsPanel mode={mode}>{results}</ResultsPanel>
        </div>
      </div>
    </div>
  );
};

/**
 * InputPanel - панель вводу з sticky поведінкою
 * Відповідає за: sticky, вертикальне складання, відступи, scroll safety
 * Ширина: 420px (фіксована, успадковує від батька)
 */
export interface InputPanelProps {
  children: React.ReactNode;
  /** Ширина панелі (за замовчуванням 420px) */
  width?: string;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  children,
  width = CALCULATOR_WIDTHS.input,
}) => {
  return (
    <aside
      className="lg:sticky lg:top-6 lg:self-start space-y-4 w-full max-w-full lg:max-w-none"
      style={{ width, flexShrink: 0 }}
    >
      {/* Без внутрішніх max-width - діти розтягуються на 100% */}
      {children}
    </aside>
  );
};

/**
 * ResultsPanel - структурований контейнер результатів
 * Завжди рендерить:
 * 1. CalculationStatus - статус розрахунку
 * 2. Summary - підсумкова секція
 * 3. ResultsContent - контент результатів
 *
 * Ширина: flexible (minmax(0, 1fr)), без max-width
 * Mode впливає на композицію:
 * - analysis: статус → підсумки → таблиця/список
 * - builder: статус → підсумки → візуалізація/конструктор
 */
export interface ResultsPanelProps {
  children: React.ReactNode;
  /** Статус розрахунку в життєвому циклі */
  status?: CalculationLifecycleStatus;
  /** Повідомлення статусу */
  statusMessage?: string;
  /** Заголовок секції підсумків */
  summaryTitle?: string;
  /** Контент підсумків */
  summary?: React.ReactNode;
  /** Режим роботи */
  mode?: CalculatorMode;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  children,
  status = 'idle',
  statusMessage,
  summaryTitle,
  summary,
  mode = 'analysis',
}) => {
  return (
    /* Flexible width, no max-width constraints */
    <main className="space-y-4 min-w-0">
      {/* 1. Calculation Status (always first) */}
      <CalculationStatus status={status} message={statusMessage} />

      {/* 2. Summary Section (always second, may be empty) */}
      <ResultsSummary title={summaryTitle} mode={mode}>
        {summary}
      </ResultsSummary>

      {/* 3. Results Content (mode affects composition) */}
      <ResultsContent mode={mode}>{children}</ResultsContent>
    </main>
  );
};

/**
 * Статус розрахунку в життєвому циклі
 */
export type CalculationLifecycleStatus = 'idle' | 'editing' | 'calculating' | 'ready';

/**
 * CalculationStatus - відображення статусу розрахунку
 * Життєвий цикл: idle → editing → calculating → ready
 */
export interface CalculationStatusProps {
  status: CalculationLifecycleStatus;
  message?: string;
}

export const CalculationStatus: React.FC<CalculationStatusProps> = ({
  status,
  message,
}) => {
  const statusConfig: Record<CalculationLifecycleStatus, {
    icon: string | null;
    text: string;
    className: string;
    pulse?: boolean;
  }> = {
    idle: {
      icon: null,
      text: message || 'Введіть дані для розрахунку',
      className: 'text-muted-foreground',
    },
    editing: {
      icon: '✎',
      text: message || 'Дані змінено',
      className: 'text-warning',
    },
    calculating: {
      icon: '⏳',
      text: message || 'Розрахунок...',
      className: 'text-primary',
      pulse: true,
    },
    ready: {
      icon: '✓',
      text: message || 'Розрахунок виконано',
      className: 'text-success',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm font-medium',
        config.className
      )}
      role="status"
      aria-live="polite"
    >
      {config.icon && (
        <span
          className={cn(
            'flex-shrink-0 w-5 h-5 flex items-center justify-center',
            config.pulse && 'animate-pulse'
          )}
        >
          {config.icon}
        </span>
      )}
      <span>{config.text}</span>
    </div>
  );
};

/**
 * ResultsSummary - секція підсумків
 */
export interface ResultsSummaryProps {
  title?: string;
  children?: React.ReactNode;
  /** Режим роботи */
  mode?: CalculatorMode;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  title,
  children,
  mode = 'analysis',
}) => {
  return (
    <section
      className={cn('space-y-2', mode === 'builder' && 'border-b pb-4')}
    >
      {title && (
        <h2 className="text-lg font-semibold">{title}</h2>
      )}
      <div className="min-h-[1rem]">
        {children || (
          <div className="text-sm text-muted-foreground italic">
            Підсумки з'являться після розрахунку
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * ResultsContent - контейнер контенту результатів
 * Mode впливає на відображення:
 * - analysis: таблиці, списки, специфікації
 * - builder: візуалізація, інтерактивні елементи
 */
export interface ResultsContentProps {
  children: React.ReactNode;
  /** Режим роботи */
  mode?: CalculatorMode;
}

export const ResultsContent: React.FC<ResultsContentProps> = ({
  children,
  mode = 'analysis',
}) => {
  return (
    <section
      className={cn(
        'space-y-4',
        mode === 'builder' && 'bg-muted/30 rounded-lg p-4'
      )}
    >
      {children}
    </section>
  );
};
