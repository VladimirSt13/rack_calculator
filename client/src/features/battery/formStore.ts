import { create } from 'zustand';

export interface BatteryFormState {
  length: number;
  width: number;
  height: number;
  weight: number;
  gap: number;
  count: number;
  rows: number;
  floors: number;
  supportType: string;
}

export interface BatteryFormActions {
  setLength: (length: number) => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
  setGap: (gap: number) => void;
  setCount: (count: number) => void;
  setRows: (rows: number) => void;
  setFloors: (floors: number) => void;
  setSupportType: (type: string) => void;
  reset: () => void;
}

const initialFormState: BatteryFormState = {
  length: 0,
  width: 0,
  height: 0,
  weight: 0,
  gap: 10,
  count: 1,
  rows: 1,
  floors: 1,
  supportType: 'straight',
};

export const useBatteryFormStore = create<BatteryFormState & BatteryFormActions>((set) => ({
  ...initialFormState,

  setLength: (length) => set({ length }),
  setWidth: (width) => set({ width }),
  setHeight: (height) => set({ height }),
  setWeight: (weight) => set({ weight }),
  setGap: (gap) => set({ gap }),
  setCount: (count) => set({ count }),
  setRows: (rows) => set({ rows }),
  setFloors: (floors) => set({ floors }),
  setSupportType: (type) => set({ supportType: type }),
  reset: () => set(initialFormState),
}));

export default useBatteryFormStore;
