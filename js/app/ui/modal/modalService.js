// @ts-check
// js/app/ui/modal/modalService.js

import { createModal } from './createModal.js';

/**
 * @typedef {Object} ModalInstance
 * @property {ReturnType<typeof createModal>} api
 * @property {import('./createModal.js').ModalConfig} config
 */

/**
 * Сервіс для управління модалками
 * @returns {{
 *   open: (config: import('./createModal.js').ModalConfig) => ReturnType<typeof createModal>,
 *   close: (id?: string) => void,
 *   closeAll: () => void,
 *   hasOpen: () => boolean,
 *   getActive: () => ModalInstance | null,
 *   getAll: () => Map<string, ModalInstance>,
 *   destroy: (id: string) => void,
 *   destroyAll: () => void
 * }}
 */
export const createModalService = () => {
  /** @type {Map<string, ModalInstance>} */
  const modals = new Map();

  /** @type {string | null} */
  let activeModalId = null;

  return {
    /**
     * Створити та відкрити модалку
     * @param {import('./createModal.js').ModalConfig} config
     * @returns {ReturnType<typeof createModal>}
     */
    open: (config) => {
      const { id } = config;

      // Якщо модалка з таким ID вже існує - закриваємо її
      if (modals.has(id)) {
        modals.get(id).api.close();
      }

      // Створюємо нову модалку
      const modalApi = createModal({
        ...config,
        onClose: () => {
          config.onClose?.();
          if (activeModalId === id) {
            activeModalId = null;
          }
        },
      });

      // Зберігаємо інстанс
      const instance = { api: modalApi, config };
      modals.set(id, instance);
      activeModalId = id;

      // Відкриваємо
      modalApi.open();

      return modalApi;
    },

    /**
     * Закрити модалку по ID або активну
     * @param {string} [id] - ID модалки (якщо не вказано - закриваємо активну)
     */
    close: (id) => {
      const modalId = id || activeModalId;
      if (!modalId) {return;}

      const instance = modals.get(modalId);
      if (instance) {
        instance.api.close();
      }
    },

    /**
     * Закрити всі модалки
     */
    closeAll: () => {
      modals.forEach((instance) => {
        instance.api.close();
      });
      activeModalId = null;
    },

    /**
     * Перевірити чи є відкрита модалка
     * @returns {boolean}
     */
    hasOpen: () => {
      if (!activeModalId) {return false;}
      const instance = modals.get(activeModalId);
      return instance?.api.isOpen() ?? false;
    },

    /**
     * Отримати активну модалку
     * @returns {ModalInstance | null}
     */
    getActive: () => {
      if (!activeModalId) {return null;}
      return modals.get(activeModalId) || null;
    },

    /**
     * Отримати всі модалки
     * @returns {Map<string, ModalInstance>}
     */
    getAll: () => modals,

    /**
     * Знищити модалку (видалити з DOM та пам'яті)
     * @param {string} id
     */
    destroy: (id) => {
      const instance = modals.get(id);
      if (instance) {
        instance.api.destroy();
        modals.delete(id);
        if (activeModalId === id) {
          activeModalId = null;
        }
      }
    },

    /**
     * Знищити всі модалки
     */
    destroyAll: () => {
      modals.forEach((instance) => {
        instance.api.destroy();
      });
      modals.clear();
      activeModalId = null;
    },
  };
};

// Синглтон екземпляр сервісу
export const modalService = createModalService();

export default modalService;
