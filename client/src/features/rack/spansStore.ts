import { create } from "zustand";

export interface SpanItem {
  id: number;
  item: string; // код балки з прайсу (напр. '1000', '1200')
  quantity: number;
}

export interface SpansState {
  spans: SpanItem[];
  nextId: number;
}

export interface SpansActions {
  addSpan: () => void;
  updateSpan: (id: number, updates: Partial<SpanItem>) => void;
  removeSpan: (id: number) => void;
  reset: () => void;
}

const initialSpansState: SpansState = {
  spans: [],
  nextId: 1,
};

export const useRackSpansStore = create<SpansState & SpansActions>((set) => ({
  ...initialSpansState,

  addSpan: () =>
    set((state) => ({
      spans: [...state.spans, { id: state.nextId, item: "", quantity: 1 }],
      nextId: state.nextId + 1,
    })),

  updateSpan: (id, updates) =>
    set((state) => ({
      spans: state.spans.map((span) =>
        span.id === id ? { ...span, ...updates } : span,
      ),
    })),

  removeSpan: (id) =>
    set((state) => ({
      spans: state.spans.filter((span) => span.id !== id),
    })),

  reset: () => set(initialSpansState),
}));

export default useRackSpansStore;
