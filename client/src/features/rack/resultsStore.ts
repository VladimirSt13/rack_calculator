import { create } from 'zustand';
import type { RackComponents } from '../../shared/core/rackCalculator';
import type { RackFormState } from './formStore';
import type { SpanItem } from '../../shared/core/rackCalculator';

export interface RackCalculationResult {
  name: string;
  tableHtml: string;
  total: number;
  totalWithoutIsolators: number;
  zeroBase: number;
  components: RackComponents;
  // Дані форми для редагування
  form: RackFormState;
  // Прольоти для підрахунку кількості
  spans: SpanItem[];
}

export interface RackResultsState {
  result: RackCalculationResult | null;
  isLoading: boolean;
  error: string | null;
}

export interface RackResultsActions {
  setResult: (result: RackCalculationResult) => void;
  clear: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialResultsState: RackResultsState = {
  result: null,
  isLoading: false,
  error: null,
};

export const useRackResultsStore = create<RackResultsState & RackResultsActions>((set) => ({
  ...initialResultsState,

  setResult: (result) => set({ result, isLoading: false, error: null }),
  clear: () => set(initialResultsState),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
}));

export default useRackResultsStore;
