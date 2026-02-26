// js/app/config/selectors.js

/**
 * ===== GLOBAL SELECTORS =====
 * Загальні елементи, доступні на всіх сторінках
 */
export const GLOBAL_SELECTORS = {
  // Навігація
  siteNav: '.header__nav',
  navLink: '[data-view]',

  // Головний контейнер
  app: '#app',

  // Модалки (загальні)
  modalClose: '[data-js="modal-close"]',
};

/**
 * ===== RACK PAGE SELECTORS =====
 * Сторінка "Розрахунок стелажа"
 */
export const RACK_SELECTORS = {
  // ===== PAGE CONTAINER =====
  page: '[data-js="page-rack"]',

  // ===== FORM FEATURE =====
  form: {
    root: '[data-js="rackForm"]',
    floors: '[data-js="rack-floors"]',
    verticalSupports: '[data-js="rack-verticalSupports"]',
    supports: '[data-js="rack-supports"]',
    rows: '[data-js="rack-rows"]',
    beamsPerRow: '[data-js="rack-beamsPerRow"]',
  },

  // ===== SPANS FEATURE (dynamic) =====
  spans: {
    group: '[data-js="rack-spansGroup"]',
    container: '[data-js="rack-spansContainer"]',
    addBtn: '[data-js="rack-addSpan"]',
    // Динамічні елементи всередині container:
    // .span-row[data-id] — рядок прольоту
    // .span-select[data-id] — select для вибору
    // .span-quantity[data-id] — input для кількості
    // .span-remove[data-id] — кнопка видалення
  },

  // ===== RESULTS FEATURE =====
  results: {
    name: '[data-js="rackName"]',
    componentsTable: '[data-js="rack-componentsTable"]',
    totalPrice: '[data-js="rack-totalPrice"]',
    totalWithoutIsolators: '[data-js="rack-totalWithoutIsolators"]',
    zeroBase: '[data-js="rack-zeroBase"]',
    addToSetBtn: '[data-js="rack-addToSetBtn"]',
  },

  // ===== SET FEATURE =====
  set: {
    table: '[data-js="rack-setTable"]',
    summary: '[data-js="rack-setSummary"]',
    openModalBtn: '[data-js="rack-openSetModalBtn"]',
  },
};

/**
 * ===== RACK SET MODAL SELECTORS =====
 * Модалка комплекту стелажів
 */
export const RACK_SET_MODAL_SELECTORS = {
  root: '[data-js="modal-rackSet"]',
  table: '[data-js="modal-rackSetTable"]',
  summary: '[data-js="modal-rackSetSummary"]',
  closeBtn: '[data-js="modal-close"]',
  exportBtn: '[data-js="modal-export"]',
};

/**
 * ===== BATTERY PAGE SELECTORS =====
 * Сторінка "Підбір під акумулятор"
 */
export const BATTERY_SELECTORS = {
  // ===== PAGE CONTAINER =====
  page: '[data-js="page-battery"]',

  // ===== FORM FEATURE =====
  form: {
    root: '[data-js="batteryForm"]',
    length: '[data-js="battery-length"]',
    gap: '[data-js="battery-gap"]',
    width: '[data-js="battery-width"]',
    height: '[data-js="battery-height"]',
    weight: '[data-js="battery-weight"]',
    count: '[data-js="battery-count"]',
    calculateBtn: '[data-js="battery-calculateBtn"]',
  },

  // ===== RESULTS FEATURE =====
  results: {
    table: '[data-js="battery-resultsTable"]',
    tableBody: '[data-js="battery-resultsBody"]',
  },
};

/**
 * ===== COMBINED SELECTORS MAP =====
 * Для зручного імпорту в EffectRegistry / PageContext
 * @type {Record<string, Record<string, string>>}
 */
export const SELECTORS = {
  global: GLOBAL_SELECTORS,
  rack: RACK_SELECTORS,
  rackModal: RACK_SET_MODAL_SELECTORS,
  battery: BATTERY_SELECTORS,
};

/**
 * Helper: отримати селектор за шляхом (для динамічного доступу)
 * @param {string} page - 'rack' | 'battery' | 'global'
 * @param {string} feature - 'form' | 'spans' | 'results' | 'set'
 * @param {string} name - назва елемента
 * @returns {string | undefined}
 *
 * @example
 * getSelector('rack', 'form', 'floors') // → '[data-js="rack-floors"]'
 */
export const getSelector = (page, feature, name) => {
  const pageSelectors = SELECTORS[page];
  if (!pageSelectors?.[feature]?.[name]) {
    console.warn(`[selectors] Not found: ${page}.${feature}.${name}`);
    return undefined;
  }
  return pageSelectors[feature][name];
};

/**
 * Helper: отримати всі селектори для фичі
 * @param {string} page
 * @param {string} feature
 * @returns {Record<string, string> | undefined}
 *
 * @example
 * getFeatureSelectors('rack', 'form') // → { floors: '[data-js="..."]', ... }
 */
export const getFeatureSelectors = (page, feature) => SELECTORS[page]?.[feature];

export default SELECTORS;
