import { create } from "zustand";

export enum SupportType {
  Straight = "straight",
  Step = "step",
}

export interface BatteryFormState {
  length: number;
  width: number;
  height: number;
  weight: number;
  gap: number;
  count: number;
  rows: number;
  floors: number;
  supportType: SupportType;
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
  setSupportType: (type: SupportType) => void;
  reset: () => void;
}

const initialFormState: BatteryFormState = {
  length: 108,
  width: 240,
  height: 480,
  weight: 28,
  gap: 10,
  count: 26,
  rows: 2,
  floors: 1,
  supportType: SupportType.Straight,
};

export const useBatteryFormStore = create<
  BatteryFormState & BatteryFormActions
>((set) => ({
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
