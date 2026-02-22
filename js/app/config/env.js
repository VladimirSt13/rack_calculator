// js/app/config/env.js

/**
 * @typedef {Object} EnvConfig
 * @property {string} API_BASE_URL
 * @property {string} NODE_ENV
 * @property {boolean} DEBUG
 * @property {string} APP_VERSION
 * @property {string} BUILD_TIME
 * @property {Record<string, boolean>} FEATURES
 */

/** @type {EnvConfig} */
export const env = Object.freeze({
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  NODE_ENV: import.meta.env.MODE || 'development',
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  APP_VERSION: __APP_VERSION__ || 'dev',
  BUILD_TIME: __BUILD_TIME__ || '',
  FEATURES: {
    NEW_CALCULATOR: import.meta.env.VITE_FEATURE_NEW_CALC === 'true',
    ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
    CACHE: import.meta.env.VITE_FEATURE_CACHE !== 'false',
    ERROR_REPORTING: import.meta.env.VITE_FEATURE_ERROR_REPORTING === 'true',
  },
});

/**
 * Перевірка чи запущено в dev режимі
 * @returns {boolean}
 */
export const isDev = () => env.NODE_ENV === 'development';

/**
 * Перевірка чи запущено в production
 * @returns {boolean}
 */
export const isProd = () => env.NODE_ENV === 'production';

/**
 * Отримати URL для API endpoint
 * @param {string} endpoint
 * @returns {string}
 */
export const apiUrl = (endpoint) => {
  const base = env.API_BASE_URL.replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');
  return `${base}/${path}`;
};

export default { env, isDev, isProd, apiUrl };
