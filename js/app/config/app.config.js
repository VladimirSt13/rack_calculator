// @ts-check
// js/app/config/app.config.js

// Імпортуємо селектори з централізованого файлу
import { SELECTORS as ALL_SELECTORS } from './selectors.js';

/**
 * @typedef {Object} PageIds
 * @property {string} BATTERY
 * @property {string} RACK
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} DEFAULT_PAGE - сторінка за замовчуванням
 * @property {string} APP_ID - id головного контейнера
 * @property {string} NAV_CONTAINER - селектор контейнера навігації
 * @property {string} LINK_SELECTOR - селектор посилань для роутера
 */

// ===== PAGE IDS =====
/** @type {PageIds} */
export const PAGES = Object.freeze({
  BATTERY: 'battery',
  RACK: 'rack',
});

// ===== APP CONFIG =====
/** @type {AppConfig} */
export const APP_CONFIG = Object.freeze({
  DEFAULT_PAGE: PAGES.RACK,
  APP_ID: 'app',
  NAV_CONTAINER: "[data-js='site-nav']",
  LINK_SELECTOR: '[data-view]',
});

// ===== SELECTORS (re-export from selectors.js) =====
/**
 * Для зворотної сумісності експортуємо тільки глобальні селектори
 * @type {Selectors}
 */
export const SELECTORS = Object.freeze({
  app: `#${APP_CONFIG.APP_ID}`,
  navContainer: APP_CONFIG.NAV_CONTAINER,
  linkSelector: APP_CONFIG.LINK_SELECTOR,
});

// ===== ROUTER CONFIG HELPER =====
/**
 * Створює конфігурацію для роутера
 * @param {Partial<AppConfig>} [overrides]
 * @returns {{ routes: {}, defaultRoute: string, effects: any }}
 */
export const createRouterConfig = (overrides = {}) => ({
  routes: {}, // Заповнюється через registerRoutes()
  defaultRoute: overrides.DEFAULT_PAGE || APP_CONFIG.DEFAULT_PAGE,
  effects: null, // Заповнюється через createRouterEffects()
});

export default {
  PAGES,
  APP_CONFIG,
  SELECTORS,
  ALL_SELECTORS,
  createRouterConfig,
};
