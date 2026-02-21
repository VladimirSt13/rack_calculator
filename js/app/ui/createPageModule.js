// js/ui/createPageModule.js
import { createEventManager } from "./eventManager.js";

/**
 * Створює стандартний шаблон сторінки
 * @param {Object} config
 * @param {string} config.id - id сторінки
 * @param {Function} [config.resetForm] - функція скидання UI форми
 * @param {Function} [config.init] - додатковий init
 * @param {Function} [config.activate] - додатковий activate
 * @param {Function} [config.deactivate] - додатковий deactivate
 * @returns {Object} page module для реєстрації в router
 */
export const createPageModule = ({
  id,
  resetForm,
  init = () => {},
  activate: customActivate = () => {},
  deactivate: customDeactivate = () => {},
}) => {
  const { addListener, removeAllListeners } = createEventManager();

  return {
    id,

    init: async () => {
      await init();
    },

    activate: () => {
      // Скидання форми, якщо є
      resetForm?.();

      // Додатковий activate
      customActivate(addListener);
    },

    deactivate: () => {
      // Очистка всіх лісенерів
      removeAllListeners();

      // Додатковий deactivate
      customDeactivate(addListener);
    },

    addListener,
  };
};
