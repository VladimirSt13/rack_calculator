import { getDb } from '../db/index.js';

/**
 * Сервіс для роботи з прайсами
 */

const REQUIRED_PRICE_KEYS = ['supports', 'spans', 'vertical_supports', 'diagonal_brace', 'isolator'];

/**
 * Валідувати структуру прайсу
 * @param {Object} data - Дані прайсу
 * @returns {string|null} Повідомлення про помилку або null якщо валідно
 */
export const validatePriceData = (data) => {
  if (!data || typeof data !== 'object') {
    return 'Invalid price data: must be an object';
  }

  const hasRequired = REQUIRED_PRICE_KEYS.some(key => key in data);

  if (!hasRequired) {
    return `Invalid price structure: must contain at least one of ${REQUIRED_PRICE_KEYS.join(', ')}`;
  }

  return null;
};

/**
 * Отримати актуальний прайс з БД
 * @returns {Object|null} Дані прайсу або null
 */
export const getPrice = async () => {
  const db = await getDb();

  const priceRecord = db.prepare('SELECT data, updated_at FROM prices ORDER BY id DESC LIMIT 1').get();

  if (!priceRecord) {
    return null;
  }

  return {
    data: JSON.parse(priceRecord.data),
    updatedAt: priceRecord.updated_at,
  };
};

/**
 * Отримати дані прайсу (тільки data)
 * @returns {Promise<Object>} Дані прайсу
 */
export const getCurrentPriceData = async () => {
  const db = await getDb();

  const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();

  if (!priceRecord) {
    throw new Error('Price data not found');
  }

  return JSON.parse(priceRecord.data);
};

/**
 * Оновити прайс-лист
 * @param {Object} data - Дані прайсу
 * @returns {Object} Оновлений прайс
 */
export const updatePrice = async (data) => {
  const db = await getDb();

  const result = db.prepare('INSERT INTO prices (data) VALUES (?)').run(JSON.stringify(data));

  return db.prepare('SELECT data, updated_at FROM prices WHERE id = ?').get(result.lastInsertRowid);
};

/**
 * Завантажити прайс з файлу
 * @param {Object} data - Дані прайсу
 * @returns {Object} Завантажений прайс
 */
export const uploadPrice = async (data) => {
  const db = await getDb();

  const result = db.prepare('INSERT INTO prices (data) VALUES (?)').run(JSON.stringify(data));

  return db.prepare('SELECT data, updated_at FROM prices WHERE id = ?').get(result.lastInsertRowid);
};

export default {
  validatePriceData,
  getPrice,
  getCurrentPriceData,
  updatePrice,
  uploadPrice,
};
