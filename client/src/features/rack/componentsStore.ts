import { create } from 'zustand';
import type { SupportComponent, SpanComponent, VerticalSupportComponent } from './priceComponentsApi';

export interface RackComponentsState {
  supports: SupportComponent[];
  spans: SpanComponent[];
  verticalSupports: VerticalSupportComponent[];
  isLoading: boolean;
  error: string | null;
}

export interface RackComponentsActions {
  setComponents: (components: {
    supports: SupportComponent[];
    spans: SpanComponent[];
    verticalSupports: VerticalSupportComponent[];
  }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

const initialState: RackComponentsState = {
  supports: [],
  spans: [],
  verticalSupports: [],
  isLoading: false,
  error: null,
};

export const useRackComponentsStore = create<RackComponentsState & RackComponentsActions>((set) => ({
  ...initialState,

  setComponents: ({ supports, spans, verticalSupports }) =>
    set({ supports, spans, verticalSupports, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () => set(initialState),
}));

export default useRackComponentsStore;
