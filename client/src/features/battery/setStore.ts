import { create } from 'zustand';
import type { BatteryVariant } from './resultsStore';

export interface BatterySetItem extends BatteryVariant {
  setId: number;
  rackConfigId?: number;  // ID конфігурації в БД
  quantity: number;
}

export interface BatterySetState {
  racks: BatterySetItem[];
  nextId: number;
}

export interface BatterySetActions {
  addRack: (rack: BatteryVariant, quantity?: number) => void;
  updateRackQuantity: (setId: number, quantity: number) => void;
  removeRack: (setId: number) => void;
  clear: () => void;
}

const initialSetState: BatterySetState = {
  racks: [],
  nextId: 1,
};

export const useBatterySetStore = create<BatterySetState & BatterySetActions>((set) => ({
  ...initialSetState,

  addRack: (rack, quantity = 1) =>
    set((state) => {
      // Перевіряємо чи вже існує такий самий стелаж (за rackConfigId або назвою)
      const existingIndex = state.racks.findIndex((r) =>
        r.rackConfigId && rack.rackConfigId
          ? r.rackConfigId === rack.rackConfigId
          : r._index === rack._index
      );

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

export default useBatterySetStore;
