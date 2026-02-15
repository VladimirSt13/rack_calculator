// js/ui/router.js

/**
 * Map сторінок: key = id сторінки, value = модуль { init, activate, deactivate, onStateChange }
 * @type {Map<string, Object>}
 */
const modules = new Map();

let currentPage = null;

/**
 * Реєстрація сторінки в Router
 * @param {Object} page - модуль сторінки
 * @param {string} page.id - id сторінки
 * @param {Function} page.init - init сторінки
 * @param {Function} page.activate - activate сторінки
 * @param {Function} page.deactivate - deactivate сторінки
 * @param {Function} [page.onStateChange] - callback при зміні state
 * @returns {void}
 */
export const registerPage = ({ id, init, activate, deactivate, onStateChange }) => {
  if (!id) throw new Error("Page must have an id");
  modules.set(id, { init, activate, deactivate, onStateChange, initialized: false });
};

/**
 * Перехід на сторінку
 * @param {string} id - id сторінки
 * @returns {Promise<void>}
 */
export const navigate = async (id) => {
  console.log(`Navigating to page ${id}`);
  const page = modules.get(id);
  if (!page) return console.warn(`Page ${id} not found`);

  if (currentPage) {
    const prev = modules.get(currentPage);
    prev?.deactivate?.();
  }

  if (!page.initialized) {
    await page.init();
    page.initialized = true;
  }

  await page.activate();
  currentPage = id;
};

/**
 * Отримати список зареєстрованих сторінок
 * @returns {string[]}
 */
export const getRegisteredPages = () => Array.from(modules.keys());

/**
 * Проксований state сторінок для реактивності
 * @type {Object}
 */
export const pageState = new Proxy(
  {},
  {
    set(target, key, value) {
      target[key] = value;
      const page = modules.get(key);
      page?.onStateChange?.(value);
      return true;
    },
  },
);
