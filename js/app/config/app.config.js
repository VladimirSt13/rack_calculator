// @ts-check
// js/app/config/app.config.js

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

/**
 * @typedef {Object} Selectors
 * @property {string} app - головний контейнер
 * @property {string} navContainer - навігація
 * @property {string} linkSelector - посилання для роутера
 * @property {Object} rack - селектори сторінки стелажа
 * @property {Object} battery - селектори сторінки батареї
 * @property {Object} modal - селектори модалок
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

// ===== SELECTORS (data-js based) =====
/** @type {Selectors} */
export const SELECTORS = Object.freeze({
  // Global
  app: `#${APP_CONFIG.APP_ID}`,
  navContainer: APP_CONFIG.NAV_CONTAINER,
  linkSelector: APP_CONFIG.LINK_SELECTOR,

  // Rack Page
  rack: {
    // Section
    section: "[data-js='section-rack']",

    // Form
    form: "[data-js='rackForm']",
    floors: "[data-js='rack-floors']",
    verticalSupports: "[data-js='rack-verticalSupports']",
    supports: "[data-js='rack-supports']",
    rows: "[data-js='rack-rows']",
    beamsPerRow: "[data-js='rack-beamsPerRow']",

    // Beams dynamic section
    beamsGroup: "[data-js='rack-beamsGroup']",
    beamsContainer: "[data-js='rack-beamsContainer']",
    addBeam: "[data-js='rack-addBeam']",

    // Results
    name: "[data-js='rackName']",
    componentsTable: "[data-js='rack-componentsTable']",
    price: "[data-js='rackPrice']",
    addToSetBtn: "[data-js='rack-addToSetBtn']",

    // Rack set
    setTable: "[data-js='rack-setTable']",
    setSummary: "[data-js='rack-setSummary']",
    openSetModalBtn: "[data-js='rack-openSetModalBtn']",
  },

  // Battery Page
  battery: {
    // Section
    section: "[data-js='section-battery']",

    // Form
    form: "[data-js='batteryForm']",
    length: "[data-js='battery-length']",
    gap: "[data-js='battery-gap']",
    width: "[data-js='battery-width']",
    height: "[data-js='battery-height']",
    weight: "[data-js='battery-weight']",
    count: "[data-js='battery-count']",
    calculateBtn: "[data-js='battery-calculateBtn']",

    // Results
    resultsTable: "[data-js='battery-resultsTable']",
    resultsBody: "[data-js='battery-resultsBody']",
  },

  // Modals
  modal: {
    rackSet: {
      root: "[data-js='modal-rackSet']",
      close: "[data-js='modal-rackSet-close']",
      cancel: "[data-js='modal-rackSet-cancel']",
      export: "[data-js='modal-rackSet-export']",
      table: "[data-js='modal-rackSetTable']",
      summary: "[data-js='modal-rackSetSummary']",
    },
  },

  // Common UI
  ui: {
    btnPrimary: '.btn--primary',
    btnOutline: '.btn--outline',
    iconBtn: '.icon-btn',
    dataTable: '.data-table',
    card: '.card',
  },
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

// ===== EXPORT MAP FOR CONVENIENCE =====
/**
 * Мапа всіх селекторів для швидкого доступу
 * @type {Selectors}
 */
export const selectors = SELECTORS;

export default {
  PAGES,
  APP_CONFIG,
  SELECTORS,
  createRouterConfig,
  selectors,
};
