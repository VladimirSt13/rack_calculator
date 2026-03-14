import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "./PageHeader";

/**
 * Константи ширин для калькуляторів
 */
export const CALCULATOR_WIDTHS = {
  /** Максимальна ширина контейнера */
  container: "1600px",
  /** Ширина панелі вводу (фіксована) */
  input: "380px",
  /** Панель результатів (гнучка, minmax(0, 1fr)) */
  results: "auto",
} as const;

/**
 * Режим відображення результатів
 */
export type CalculatorMode = "analysis" | "builder";

/**
 * CalculatorPage - універсальний лейаут для сторінок калькуляторів
 *
 * Ширина:
 * - Container: max-w-[1600px]
 * - Input Panel: 420px (фіксована)
 * - Results Panel: flexible (minmax(0, 1fr))
 * - Set Panel: під результатами (на всю ширину контенту)
 *
 * Responsive:
 * - Mobile (< 1024px): 1 колонка (форма → результати → комплект)
 * - Desktop (≥ 1024px): 2 колонки (форма | результати + комплект)
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
  /** Панель комплекту (опціонально) */
  setPanel?: React.ReactNode;
  /** Ширина панелі вводу (за замовчуванням 420px) */
  inputWidth?: string;
  /** Режим роботи: analysis (аналіз) | builder (конструктор) */
  mode?: CalculatorMode;
  /** Статус розрахунку в життєвому циклі */
  status?: CalculationLifecycleStatus;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  title,
  description,
  headerActions,
  input,
  results,
  setPanel,
  inputWidth = CALCULATOR_WIDTHS.input,
  mode = "analysis",
  status,
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

        {/* Calculator Grid */}
        {/* Mobile: single column, Desktop: sidebar + content */}
        <div
          className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,min-content)_minmax(0,1fr)]"
          style={{
            gridTemplateColumns: `minmax(0, ${inputWidth}) minmax(0, 1fr)`,
          }}
        >
          {/* Input Panel: 420px fixed */}
          <InputPanel width={inputWidth}>{input}</InputPanel>

          {/* Results + Set Panel: flexible, stacked vertically */}
          <ResultsWrapper>
            <ResultsPanel mode={mode} status={status}>
              {results}
            </ResultsPanel>
            {setPanel && <SetPanel>{setPanel}</SetPanel>}
          </ResultsWrapper>
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
    <div
      className="lg:sticky lg:top-6 lg:self-start space-y-4 w-full max-w-full lg:max-w-none bg-surface rounded-lg p-4 shadow-sm"
      style={{ width, flexShrink: 0 }}
      role="region"
      aria-label="Панель вводу"
    >
      {/* Без внутрішніх max-width - діти розтягуються на 100% */}
      {children}
    </div>
  );
};

/**
 * ResultsWrapper - контейнер для результатів + комплекту
 * Stack results and set panel vertically
 */
export interface ResultsWrapperProps {
  children: React.ReactNode;
}

export const ResultsWrapper: React.FC<ResultsWrapperProps> = ({ children }) => {
  return <div className="space-y-4 min-w-0">{children}</div>;
};

/**
 * SetPanel - панель комплекту стелажів
 * Відповідає за: вертикальне складання, відступи
 * Розташування: під результатами (на всю ширину контенту)
 */
export interface SetPanelProps {
  children: React.ReactNode;
}

export const SetPanel: React.FC<SetPanelProps> = ({ children }) => {
  return (
    <div
      className="space-y-4 min-w-0 bg-surface rounded-lg p-4 shadow-sm"
      role="region"
      aria-label="Комплект стелажів"
    >
      {children}
    </div>
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
  /** Режим роботи */
  mode?: CalculatorMode;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  children,
  status = "idle",
  mode = "analysis",
}) => {
  // Toast-сповіщення при зміні статусу
  const prevStatusRef = useRef<CalculationLifecycleStatus>("idle");

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    // Не показуємо toast при першому рендері або якщо статус не змінився
    if (prevStatus === status) return;

    // Показуємо toast тільки для важливих змін
    if (status === "calculating") {
      toast.loading("Розрахунок...", { id: "calculation" });
    } else if (status === "ready") {
      toast.success("Розрахунок виконано", { id: "calculation" });
    } else if (status === "editing" && prevStatus === "ready") {
      toast.dismiss("calculation");
    }

    // Cleanup toast при розмонтуванні
    return () => {
      if (status === "calculating") {
        toast.dismiss("calculation");
      }
    };
  }, [status]);

  return (
    <div
      className="space-y-4 min-w-0 bg-surface rounded-lg p-4 shadow-sm"
      role="region"
      aria-label="Результати розрахунку"
    >
      {/* Results Content (mode affects composition) */}
      <ResultsContent mode={mode}>{children}</ResultsContent>
    </div>
  );
};

/**
 * Статус розрахунку в життєвому циклі
 */
export type CalculationLifecycleStatus =
  | "idle"
  | "editing"
  | "calculating"
  | "ready";

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
  mode = "analysis",
}) => {
  return (
    <section
      className={cn(
        "space-y-4",
        mode === "builder" && "bg-muted/30 rounded-lg p-4",
      )}
    >
      {children}
    </section>
  );
};
