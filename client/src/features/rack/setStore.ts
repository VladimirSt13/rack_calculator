import { create } from "zustand";
import { RackCalculationResult, type PriceInfo } from "./resultsStore";

export interface RackSetItem extends RackCalculationResult {
  setId: number;
  rackConfigId?: number; // ID конфігурації в БД (новий підхід)
  quantity: number;
}

export { PriceInfo };

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
      // Перевіряємо чи вже існує такий самий стелаж (за назвою або rackConfigId)
      const existingIndex = state.racks.findIndex((r) =>
        r.rackConfigId
          ? r.rackConfigId === rack.rackConfigId
          : r.name === rack.name,
      );

      if (existingIndex !== -1) {
        // Якщо існує - збільшуємо кількість
        const updatedRacks = state.racks.map((r, index) =>
          index === existingIndex
            ? { ...r, quantity: r.quantity + quantity }
            : r,
        );
        return {
          racks: updatedRacks,
        };
      }

      // Якщо не існує - додаємо новий
      return {
        racks: [...state.racks, { ...rack, setId: state.nextId, quantity }],
        nextId: state.nextId + 1,
      };
    }),

  updateRackQuantity: (setId, quantity) =>
    set((state) => ({
      racks: state.racks.map((r) =>
        r.setId === setId ? { ...r, quantity } : r,
      ),
    })),

  removeRack: (setId) =>
    set((state) => ({
      racks: state.racks.filter((r) => r.setId !== setId),
    })),

  clear: () => set(initialSetState),
}));

export default useRackSetStore;
