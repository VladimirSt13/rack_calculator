import { create } from 'zustand';
import { RackCalculationResult } from './resultsStore';

export interface RackSetItem extends RackCalculationResult {
  setId: number;
  quantity: number;
}

export interface RackSetState {
  racks: RackSetItem[];
  nextId: number;
}

export interface RackSetActions {
  addRack: (rack: RackCalculationResult, quantity?: number) => void;
  updateRackQuantity: (setId: number, quantity: number) => void;
  removeRack: (setId: number) => void;
  clear: () => void;
}

const initialSetState: RackSetState = {
  racks: [],
  nextId: 1,
};

export const useRackSetStore = create<RackSetState & RackSetActions>((set) => ({
  ...initialSetState,

  addRack: (rack, quantity = 1) =>
    set((state) => ({
      racks: [
        ...state.racks,
        { ...rack, setId: state.nextId, quantity },
      ],
      nextId: state.nextId + 1,
    })),

  updateRackQuantity: (setId, quantity) =>
    set((state) => ({
      racks: state.racks.map((r) =>
        r.setId === setId ? { ...r, quantity } : r
      ),
    })),

  removeRack: (setId) =>
    set((state) => ({
      racks: state.racks.filter((r) => r.setId !== setId),
    })),

  clear: () => set(initialSetState),
}));

export default useRackSetStore;
