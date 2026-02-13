// import { batteryStateLivePanel } from "../battery.js";
import { renderBatteryTable } from "../ui/templates/batteryRackTable.js";

export const initialBatteryState = {
  width: 0,
  length: 0,
  height: 0,
  weight: 0,
  gap: 10,
  count: 1,
  results: [], // результати розрахунку стелажів
};

// Проксі для масиву результатів (якщо знадобиться динамічне оновлення)
const createProxiedArray = (arr /*onChange*/) =>
  new Proxy(arr, {
    get(target, prop, receiver) {
      const value = target[prop];
      if (typeof value === "function") {
        return (...args) => {
          const result = value.apply(target, args);
          if (["push", "splice", "pop", "shift", "unshift", "clear"].includes(prop)) {
            renderBatteryTable(target);
            // onChange?.();
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
  /**
   * @param {Object} target - об'єкт, до якого здійснюється доступ
   * @param {string} prop - назва властивості, до якої здійснюється доступ
   * @param {*} value - значення, яке встановлюється для властивості
   * @returns {boolean} - true, якщо встановлення відбулося успішно
   */
  set(target, prop, value) {
    target[prop] = value;
    // render викликаємо лише для результатів, а не при зміні форми
    return true;
  },
});

// Скидання стану перед новим розрахунком
