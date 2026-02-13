import { batteryState, initialBatteryState } from "../state/batteryState.js";

export const updateBatteryState = (values, livePanel) => {
  // Оновлюємо прості властивості форми
  Object.entries(values).forEach(([key, value]) => (batteryState[key] = value));

  if (livePanel) {
    const changedKey = Object.keys(values)[0]; // ключ, який змінювався, відповідно змінюємо заголовок панелі інформації про стан батареї
    livePanel.render(batteryState, changedKey);
  }
  // Якщо треба, можна одразу обчислити результати
  // batteryState.results.push(...calculateRacks(values));
};

export const addBatteryResults = (racksArray) => {
  batteryState.results.push(...racksArray);
};

export const resetBatteryState = () => {
  batteryState.width = initialBatteryState.width;
  batteryState.length = initialBatteryState.length;
  batteryState.height = initialBatteryState.height;
  batteryState.weight = initialBatteryState.weight;
  batteryState.gap = initialBatteryState.gap;
  batteryState.count = initialBatteryState.count;
  batteryState.results.length = 0; // очищуємо результати
};
