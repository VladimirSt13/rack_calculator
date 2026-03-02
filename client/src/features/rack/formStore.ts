import { create } from 'zustand';

export interface RackFormState {
  floors: number;
  verticalSupports: string;
  supports: string;
  rows: number;
  beamsPerRow: number;
}

export interface RackFormActions {
  setFloors: (floors: number) => void;
  setVerticalSupports: (supports: string) => void;
  setSupports: (supports: string) => void;
  setRows: (rows: number) => void;
  setBeamsPerRow: (beams: number) => void;
  reset: () => void;
}

const initialFormState: RackFormState = {
  floors: 1,
  verticalSupports: '',
  supports: '',
  rows: 1,
  beamsPerRow: 2,
};

export const useRackFormStore = create<RackFormState & RackFormActions>((set) => ({
  ...initialFormState,

  setFloors: (floors) => set({ floors }),
  setVerticalSupports: (supports) => set({ verticalSupports: supports }),
  setSupports: (supports) => set({ supports }),
  setRows: (rows) => set({ rows }),
  setBeamsPerRow: (beams) => set({ beamsPerRow: beams }),
  reset: () => set(initialFormState),
}));

export default useRackFormStore;
