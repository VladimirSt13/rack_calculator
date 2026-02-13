import { render } from "../render.js";

const initialRackState = {
  floors: 1,
  verticalSupports: "",
  supports: "",
  rows: 1,
  beamsPerRow: 2,
  beams: new Map(),
};

// Проксі для Map
const createProxiedMap = (map) => {
  return new Proxy(map, {
    get(target, prop, receiver) {
      const value = target[prop];

      // Якщо це функція Map — прив’язуємо її до оригінального Map
      if (typeof value === "function") {
        return (...args) => {
          const result = value.apply(target, args);

          // Викликаємо render тільки для змінюючих методів
          if (["set", "delete", "clear"].includes(prop)) {
            render();
          }

          return result;
        };
      }

      return value;
    },
  });
};

const state = {
  ...initialRackState,
  beams: createProxiedMap(initialRackState.beams),
};

export const rackState = new Proxy(state, {
  set(target, prop, value) {
    target[prop] = value;
    render();
    return true;
  },
});

// Скидання стану
export const resetRackState = () => {
  rackState.floors = initialRackState.floors;
  rackState.rows = initialRackState.rows;
  rackState.beamsPerRow = initialRackState.beamsPerRow;
  rackState.supports = initialRackState.supports;
  rackState.verticalSupports = initialRackState.verticalSupports;

  rackState.beams.clear(); // працює коректно
};
