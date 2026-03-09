import { create } from 'zustand';

import type { ComponentItem } from '@rack-calculator/shared';

export interface PriceInfo {
  type: string;
  label: string;
  value: number;
}

export interface RackConfig {
  floors: number;
  rows: number;
  beamsPerRow: number;
  supports?: string | null;
  verticalSupports?: string | null;
  spans?: number[] | null;
  braces?: string | null;
}

export interface BatteryVariant {
  _index?: number;
  rackConfigId?: number;
  name: string;
  config: RackConfig;
  components: Record<string, ComponentItem | ComponentItem[]>;
  prices: PriceInfo[];
  totalCost: number;
  // Додаткові поля для UI
  span?: number;
  spansCount?: number;
  totalLength?: number;
  combination: number[];
  beams: number;
  batteriesPerRow?: number;
  excessLength?: number;
  isBest?: boolean;
  index?: number;
  quantity?: number;  // Для комплектів
  setId?: number;     // Для комплектів
}

export interface BatteryResultsState {
  variants: BatteryVariant[];
  selectedVariant: BatteryVariant | null;
  requiredLength?: number;  // Розрахункова довжина стелажа
  isLoading: boolean;
  error: string | null;
}

export interface BatteryResultsActions {
  setVariants: (variants: BatteryVariant[]) => void;
  setRequiredLength: (length: number) => void;
  setSelectedVariant: (variant: BatteryVariant | null) => void;
  clear: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialResultsState: BatteryResultsState = {
  variants: [],
  selectedVariant: null,
  requiredLength: undefined,
  isLoading: false,
  error: null,
};

export const useBatteryResultsStore = create<BatteryResultsState & BatteryResultsActions>((set) => ({
  ...initialResultsState,

  setVariants: (variants) => set({ variants, isLoading: false, error: null }),
  setRequiredLength: (length) => set({ requiredLength: length }),
  setSelectedVariant: (variant) => set({ selectedVariant: variant }),
  clear: () => set(initialResultsState),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
}));

export default useBatteryResultsStore;
