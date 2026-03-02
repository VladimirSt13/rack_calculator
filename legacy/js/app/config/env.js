// // js/app/config/env.js

// /**
//  * @typedef {Object} EnvConfig
//  * @property {string} API_BASE_URL
//  * @property {string} NODE_ENV
//  * @property {boolean} DEBUG
//  * @property {string} APP_VERSION
//  * @property {string} BUILD_TIME
//  * @property {Record<string, boolean>} FEATURES
//  */

// /** @type {EnvConfig} */
// export const env = Object.freeze({
//   API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
//   NODE_ENV: import.meta.env.MODE || 'development',
//   DEBUG: import.meta.env.VITE_DEBUG === 'true',
//   APP_VERSION: __APP_VERSION__ || 'dev',
//   BUILD_TIME: __BUILD_TIME__ || '',
//   FEATURES: {
//     NEW_CALCULATOR: import.meta.env.VITE_FEATURE_NEW_CALC === 'true',
//     ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
//     CACHE: import.meta.env.VITE_FEATURE_CACHE !== 'false',
//     ERROR_REPORTING: import.meta.env.VITE_FEATURE_ERROR_REPORTING === 'true',
//   },
// });

// /**
//  * Перевірка чи запущено в dev режимі
//  * @returns {boolean}
//  */
// export const isDev = () => env.NODE_ENV === 'development';

// /**
//  * Перевірка чи запущено в production
//  * @returns {boolean}
//  */
// export const isProd = () => env.NODE_ENV === 'production';

// /**
//  * Отримати URL для API endpoint
//  * @param {string} endpoint
//  * @returns {string}
//  */
// export const apiUrl = (endpoint) => {
//   const base = env.API_BASE_URL.replace(/\/$/, '');
//   const path = endpoint.replace(/^\//, '');
//   return `${base}/${path}`;
// };

// export default { env, isDev, isProd, apiUrl };

// js/app/config/env.js

/**
 * @typedef {Object} EnvConfig
 * @property {boolean} isDev - чи dev режим
 * @property {boolean} isProd - чи production режим
 * @property {boolean} isTest - чи test режим
 * @property {boolean} debug - чи увімкнено debug
 * @property {boolean} debugLogging - чи увімкнено логування
 * @property {string} nodeEnv - значення NODE_ENV
 */

/**
 * Перевіряє, чи запущено додаток у dev режимі
 * @returns {boolean}
 */
export const isDev = () => {
  // Перевірка через Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEV || import.meta.env.MODE === 'development';
  }

  // Перевірка через Node.js process (для сумісності)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development';
  }

  // Fallback: вважаємо dev за замовчуванням
  return true;
};

/**
 * Перевіряє, чи запущено додаток у production режимі
 * @returns {boolean}
 */
export const isProd = () => !isDev();

/**
 * Перевіряє, чи запущено додаток у test режимі
 * @returns {boolean}
 */
export const isTest = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.MODE === 'test';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'test';
  }
  return false;
};

/**
 * Перевіряє, чи увімкнено debug режим
 * @returns {boolean}
 */
export const isDebug = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEBUG === 'true' || isDev();
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.DEBUG === 'true' || isDev();
  }
  return isDev();
};

/**
 * Перевіряє, чи увімкнено логування
 * @returns {boolean}
 */
export const isDebugLogging = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEBUG_LOGGING === 'true' || isDev();
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.DEBUG_LOGGING === 'true' || isDev();
  }
  return isDev();
};

/**
 * Отримує значення NODE_ENV
 * @returns {string}
 */
export const getNodeEnv = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.MODE || 'development';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV || 'development';
  }
  return 'development';
};

/**
 * Безпечний логер: працює тільки в dev/debug режимі
 * @param {string} namespace - простір імен (напр. '[Form]', '[Router]')
 * @param  {...any} args - аргументи для console.log
 * @returns {void}
 */
export const log = (namespace, ...args) => {
  if (isDebugLogging()) {
    console.log(namespace, ...args);
  }
};

/**
 * Безпечний warn логер: працює тільки в dev/debug режимі
 * @param {string} namespace
 * @param  {...any} args
 * @returns {void}
 */
export const warn = (namespace, ...args) => {
  if (isDebugLogging()) {
    console.warn(namespace, ...args);
  }
};

/**
 * Безпечний error логер: працює завжди (навіть в production)
 * @param {string} namespace
 * @param  {...any} args
 * @returns {void}
 */
export const error = (namespace, ...args) => {
  console.error(namespace, ...args);
};

/**
 * @type {EnvConfig}
 */
export const env = Object.freeze({
  isDev: isDev(),
  isProd: isProd(),
  isTest: isTest(),
  debug: isDebug(),
  debugLogging: isDebugLogging(),
  nodeEnv: getNodeEnv(),
});

export default {
  isDev,
  isProd,
  isTest,
  isDebug,
  isDebugLogging,
  getNodeEnv,
  log,
  warn,
  error,
  env,
};
