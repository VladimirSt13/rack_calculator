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
    set((state) => {
      // Перевіряємо чи вже існує такий самий стелаж (за назвою)
      const existingIndex = state.racks.findIndex((r) => r.name === rack.name);
      
      if (existingIndex !== -1) {
        // Якщо існує - збільшуємо кількість
        const updatedRacks = state.racks.map((r, index) =>
          index === existingIndex
            ? { ...r, quantity: r.quantity + quantity }
            : r
        );
        return {
          racks: updatedRacks,
        };
      }
      
      // Якщо не існує - додаємо новий
      return {
        racks: [
          ...state.racks,
          { ...rack, setId: state.nextId, quantity },
        ],
        nextId: state.nextId + 1,
      };
    }),

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
