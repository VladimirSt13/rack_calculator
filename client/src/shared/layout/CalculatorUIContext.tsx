import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { CalculatorMode } from "./CalculatorPage";

/**
 * Стан розрахунку в життєвому циклі
 */
export type CalculationState = "idle" | "editing" | "calculating" | "ready";

/**
 * Активна секція в панелі результатів
 */
export type ActiveSection = "summary" | "details" | "visualization" | null;

/**
 * UI-контекст калькулятора
 */
export interface CalculatorUIContextValue {
  /** Режим відображення (analysis/builder) */
  mode: CalculatorMode;
  /** Змінити режим */
  setMode: (mode: CalculatorMode) => void;

  /** Стан розрахунку */
  calculationState: CalculationState;
  /** Встановити стан розрахунку */
  setCalculationState: (state: CalculationState) => void;

  /** Активна секція */
  activeSection: ActiveSection;
  /** Встановити активну секцію */
  setActiveSection: (section: ActiveSection) => void;

  /** Чи відкрито панель деталей */
  isDetailsOpen: boolean;
  /** Перемкнути панель деталей */
  toggleDetails: () => void;
}

const CalculatorUIContext = createContext<CalculatorUIContextValue | undefined>(
  undefined,
);

export interface CalculatorUIProviderProps {
  children: React.ReactNode;
  /** Початковий режим */
  defaultMode?: CalculatorMode;
}

export const CalculatorUIProvider: React.FC<CalculatorUIProviderProps> = ({
  children,
  defaultMode = "analysis",
}) => {
  // Mode state
  const [mode, setMode] = useState<CalculatorMode>(defaultMode);

  // Calculation state
  const [calculationState, setCalculationState] =
    useState<CalculationState>("idle");

  // Active section state
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  // Details panel state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleDetails = useCallback(() => {
    setIsDetailsOpen((prev) => !prev);
  }, []);

  const value = useMemo<CalculatorUIContextValue>(
    () => ({
      mode,
      setMode,
      calculationState,
      setCalculationState,
      activeSection,
      setActiveSection,
      isDetailsOpen,
      toggleDetails,
    }),
    [mode, calculationState, activeSection, isDetailsOpen, toggleDetails],
  );

  return (
    <CalculatorUIContext.Provider value={value}>
      {children}
    </CalculatorUIContext.Provider>
  );
};

/**
 * Hook для доступу до CalculatorUIContext
 */
export const useCalculatorUI = (): CalculatorUIContextValue => {
  const context = useContext(CalculatorUIContext);

  if (context === undefined) {
    throw new Error(
      "useCalculatorUI must be used within a CalculatorUIProvider",
    );
  }

  return context;
};

/**
 * Hook для безпечного доступу (повертає null замість помилки)
 */
export const useCalculatorUIOptional = (): CalculatorUIContextValue | null => {
  return useContext(CalculatorUIContext) ?? null;
};
