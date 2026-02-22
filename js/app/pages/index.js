// js/app/pages/index.js

import { batteryPage } from './battery/page.js';
import { rackPage } from './racks/page.js';

/**
 * @typedef {Object} PageModule
 * @property {string} id - унікальний ідентифікатор сторінки
 * @property {() => Promise<void>} [init] - ініціалізація (виконується один раз)
 * @property {(ctx: import('../ui/router.js').RouterContext) => void} [activate] - активація сторінки
 * @property {(ctx: import('../ui/router.js').RouterContext) => void} [deactivate] - деактивація сторінки
 * @property {(state: any) => void} [onStateChange] - реакція на зміну стану
 */

/**
 * @typedef {Object} RoutesConfig
 * @property {Record<string, PageModule>} routes - мапа маршрутів
 * @property {string[]} pageOrder - порядок сторінок (для навігації)
 */

/**
 * Мапа всіх сторінок додатку
 * @type {Record<string, PageModule>}
 */
const PAGE_REGISTRY = Object.freeze({
  battery: batteryPage,
  rack: rackPage,
  // Додавайте нові сторінки тут:
  // reports: reportsPage,
});

/**
 * Pure: валідує сторінку перед реєстрацією
 * @param {string} id
 * @param {PageModule} page
 * @returns {{ valid: boolean, error?: string }}
 */
const validatePage = (id, page) => {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: `Page id must be a non-empty string, got: ${id}` };
  }

  if (!page || typeof page !== 'object') {
    return { valid: false, error: `Page "${id}" must be an object` };
  }

  if (page.id && page.id !== id) {
    return { valid: false, error: `Page id mismatch: config="${id}", page.id="${page.id}"` };
  }

  // Опціональні, але бажані методи
  const hasLifecycle = page.init || page.activate || page.deactivate;
  if (!hasLifecycle) {
    console.warn(`[Pages] Page "${id}" has no lifecycle methods (init/activate/deactivate)`);
  }

  return { valid: true };
};

/**
 * Pure: фільтрує валідні сторінки
 * @param {Record<string, PageModule>} registry
 * @returns {Record<string, PageModule>}
 */
const getValidPages = (registry) => {
  const valid = {};

  for (const [id, page] of Object.entries(registry)) {
    const validation = validatePage(id, page);
    if (validation.valid) {
      valid[id] = page;
    } else {
      console.error(`[Pages] ${validation.error}`);
    }
  }

  return valid;
};

/**
 * Pure: повертає порядок сторінок для навігації
 * @param {Record<string, PageModule>} pages
 * @returns {string[]}
 */
const getPageOrder = (pages) => Object.keys(pages);

/**
 * Pure: повертає конфігурацію маршрутів для роутера
 * @returns {Promise<RoutesConfig>}
 */
export const registerAllPages = async () => {
  // Підтримка lazy loading (якщо сторінки завантажуються динамічно)
  // Приклад:
  // const dynamicPages = await import('./reports/page.js');
  // PAGE_REGISTRY.reports = dynamicPages.reportsPage;

  const validPages = getValidPages(PAGE_REGISTRY);

  if (Object.keys(validPages).length === 0) {
    console.warn('[Pages] No valid pages registered');
  }

  return Object.freeze({
    routes: Object.freeze(validPages),
    pageOrder: Object.freeze(getPageOrder(validPages)),
  });
};

/**
 * Helper: отримує сторінку за id (для тестів / debug)
 * @param {string} id
 * @returns {PageModule | undefined}
 */
export const getPageById = (id) => PAGE_REGISTRY[id];

/**
 * Helper: перевіряє чи зареєстрована сторінка
 * @param {string} id
 * @returns {boolean}
 */
export const hasPage = (id) => id in PAGE_REGISTRY;

/**
 * Helper: отримує список всіх ID сторінок
 * @returns {string[]}
 */
export const getAllPageIds = () => Object.keys(PAGE_REGISTRY);

export default {
  registerAllPages,
  getPageById,
  hasPage,
  getAllPageIds,
};

/**
 * @typedef {Object} RouterContext
 * @property {string|null} currentRoute
 * @property {Record<string, import('../ui/router.js').Route>} routes
 * @property {import('../ui/router.js').RouterConfig['effects']} effects
 */
