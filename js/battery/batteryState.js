import { renderBatteryTable } from "./templates/batteryRackTable.js";

const initialBatteryState = {
  width: 0,
  length: 0,
  height: 0,
  weight: 0,
  gap: 10,
  count: 1,
  results: [], // результати розрахунку стелажів
};

// Проксі для масиву результатів (якщо знадобиться динамічне оновлення)
const createProxiedArray = (arr) =>
  new Proxy(arr, {
    get(target, prop, receiver) {
      const value = target[prop];
      if (typeof value === "function") {
        return (...args) => {
          const result = value.apply(target, args);
          if (["push", "splice", "pop", "shift", "unshift", "clear"].includes(prop)) {
            renderBatteryTable(target);
          }
          return result;
        };
      }
      return value;
    },
  });

const state = {
  ...initialBatteryState,
  results: createProxiedArray(initialBatteryState.results),
};

export const batteryState = new Proxy(state, {
  set(target, prop, value) {
    target[prop] = value;
    // render викликаємо лише для результатів, а не при зміні форми
    return true;
  },
});

// Скидання стану перед новим розрахунком
export const resetBatteryState = () => {
  batteryState.width = initialBatteryState.width;
  batteryState.length = initialBatteryState.length;
  batteryState.height = initialBatteryState.height;
  batteryState.weight = initialBatteryState.weight;
  batteryState.gap = initialBatteryState.gap;
  batteryState.count = initialBatteryState.count;
  batteryState.results.length = 0; // очищуємо результати
};
