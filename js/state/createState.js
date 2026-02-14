/**
 * Створює інстанс state з геттерами, actions і підпискою
 * @param {Object} initialData - початковий стан
 * @returns {Object} state API
 */
export const createState = (initialData = {}) => {
  let state = { ...initialData };
  const subscribers = new Set();

  /**
   * Отримати копію всього state
   * @returns {Object}
   */
  const get = () => ({ ...state });

  /**
   * Оновити state через updater (action)
   * @param {Function|Object} updater - нові поля або callback
   * @returns {void}
   */
  const set = (updater) => {
    const newState = typeof updater === "function" ? updater({ ...state }) : updater;
    state = { ...state, ...newState };
    subscribers.forEach((fn) => fn({ ...state }));
  };

  /**
   * Підписка на зміни state
   * @param {Function} fn - callback на зміни state
   * @returns {Function} unsubscribe
   */
  const subscribe = (fn) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn); // відписка
  };

  /**
   * Скидання state на початковий
   * @returns {void}
   */
  const reset = () => {
    state = { ...initialData };
    subscribers.forEach((fn) => fn({ ...state }));
  };

  /**
   * Оновити конкретне поле
   * @param {string} field - ключ поля
   * @param {*} value - нове значення
   * @returns {void}
   */
  const updateField = (field, value) => set((prev) => ({ ...prev, [field]: value }));

  return { get, set, subscribe, reset, updateField };
};
