// js/ui/eventManager.js

/**
 * Фабрика для створення EventManager для конкретного модуля/сторінки
 * @returns {{
 *   addListener: (target: EventTarget, event: string, handler: Function, options?: any) => void,
 *   removeAllListeners: () => void,
 *   countListeners: () => number
 * }}
 */
export const createEventManager = () => {
  // приватний Set listener’ів для цієї сторінки
  const listeners = new Set();

  /**
   * Додає listener і зберігає його в Set
   * @param {EventTarget} target - DOM елемент або EventTarget
   * @param {string} event - назва події
   * @param {Function} handler - функція обробника
   * @param {Object|boolean} [options] - опції addEventListener
   * @returns {void}
   */
  const addListener = (target, event, handler, options) => {
    if (!(target instanceof EventTarget)) {
      console.warn("addListener: target не є DOM елементом або EventTarget");
      return;
    }
    if (typeof event !== "string") {
      console.warn("addListener: event повинен бути рядком");
      return;
    }
    if (typeof handler !== "function") {
      console.warn("addListener: handler повинен бути функцією");
      return;
    }

    // перевірка на дублювання
    const exists = Array.from(listeners).some((l) => l.target === target && l.event === event && l.handler === handler);
    if (exists) return;

    try {
      target.addEventListener(event, handler, options);
      listeners.add({ target, event, handler, options });
    } catch (e) {
      console.warn("addListener помилка:", e);
    }
  };

  /**
   * Видаляє всі listener’и цієї сторінки
   * @returns {void}
   */
  const removeAllListeners = () => {
    listeners.forEach(({ target, event, handler, options }) => {
      try {
        target.removeEventListener(event, handler, options);
      } catch (e) {
        console.warn("removeAllListeners помилка:", e);
      }
    });
    listeners.clear();
  };

  /**
   * Повертає кількість активних listener’ів
   * @returns {number}
   */
  const countListeners = () => listeners.size;

  return { addListener, removeAllListeners, countListeners };
};
