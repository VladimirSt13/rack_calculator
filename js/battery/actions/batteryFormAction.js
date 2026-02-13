import { generateRackVariants } from "../core/batteryRackCalculator.js";
import { batteryState, initialBatteryState } from "../state/batteryState.js";

export const updateBatteryState = (values) => {
  // Оновлюємо прості властивості форми
  Object.entries(values).forEach(([key, value]) => (batteryState[key] = value));

  const variants = generateRackVariants(
    { width: values.width, length: values.length, height: values.height },
    values.count,
    values.gap,
  );

  batteryState.results.length = 0;
  batteryState.results.push(...variants);
};

export const addBatteryResults = (racksArray) => {
  batteryState.results.push(...racksArray);
};

// Скидання state
export const resetBatteryState = () => {
  Object.entries(initialBatteryState).forEach(([key, value]) => {
    if (key === "results") {
      batteryState.results.length = 0;
    } else {
      batteryState[key] = value;
    }
  });
};
