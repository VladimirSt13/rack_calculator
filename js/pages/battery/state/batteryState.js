// state/batteryState.js
import { createState } from "../../../state/createState.js";

// Початкові значення
export const initialBatteryState = {
  width: 200,
  length: 108,
  height: 600,
  weight: 50,
  gap: 10,
  count: 26,
  results: [], // результати розрахунку стелажів
};

export const createBatteryState = () => createState({ ...initialBatteryState });
