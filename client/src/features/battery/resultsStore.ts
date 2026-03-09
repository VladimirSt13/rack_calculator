import { create } from 'zustand';

import type { ComponentItem } from '@rack-calculator/shared';

export interface PriceInfo {
  type: string;
  label: string;
  value: number;
}

export interface BatteryVariant {
  _index: number;
  name: string;
  width: number;
  height: number;
  length: number;
  totalLength?: number;  // Розрахункова довжина стелажа
  floors: number;
  rows: number;
  supportType: string;
  combination: number[];
  beams: number;
  batteriesPerRow?: number;  // Кількість акумуляторів в ряду
  prices?: PriceInfo[];
  components?: Record<string, ComponentItem | ComponentItem[]>;  // Компоненти стелажа
  rackConfigId?: number;  // ID конфігурації в БД (нова інтеграція)
}

export interface BatteryResultsState {
  variants: BatteryVariant[];
  selectedVariant: BatteryVariant | null;
  isLoading: boolean;
  error: string | null;
}

export interface BatteryResultsActions {
  setVariants: (variants: BatteryVariant[]) => void;
  setSelectedVariant: (variant: BatteryVariant | null) => void;
  clear: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialResultsState: BatteryResultsState = {
  variants: [],
  selectedVariant: null,
  isLoading: false,
  error: null,
};

export const useBatteryResultsStore = create<BatteryResultsState & BatteryResultsActions>((set) => ({
  ...initialResultsState,

  setVariants: (variants) => set({ variants, isLoading: false, error: null }),
  setSelectedVariant: (variant) => set({ selectedVariant: variant }),
  clear: () => set(initialResultsState),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
}));

export default useBatteryResultsStore;
