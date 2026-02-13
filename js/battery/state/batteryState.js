// state/batteryState.js
import { battRefs } from "../ui/dom.js";
import { renderBatteryTable } from "../ui/templates/batteryRackTable.js";

// Початкові значення
export const initialBatteryState = {
  width: 200,
  length: 108,
  height: 600,
  weight: 50,
  gap: 80,
  count: 26,
  results: [], // результати розрахунку стелажів
};

// Проксі для масиву results (щоб таблиця оновлювалась при push/clear тощо)
const createProxiedArray = (arr) =>
  new Proxy(arr, {
    get(target, prop) {
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

// Головний state в проксі
export const batteryState = new Proxy(
  {
    ...initialBatteryState,
    results: createProxiedArray(initialBatteryState.results),
  },
  {
    set(target, prop, value) {
      target[prop] = value;

      const battProp = `battery${prop.charAt(0).toUpperCase() + prop.slice(1)}`;

      // --- Оновлюємо інпути, якщо є відповідний ref ---
      if (battRefs[battProp] && battRefs[battProp].tagName === "INPUT") {
        battRefs[battProp].value = value;
      }

      // --- Якщо оновились results, рендеримо таблицю ---
      if (prop === "results") {
        renderBatteryTable(value);
      }

      return true;
    },
  },
);
