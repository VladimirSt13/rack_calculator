// js/app/core/priceState.js

import { createState } from './createState.js';

/**
 * @typedef {Object} PriceData
 * @property {Object} supports - ціни на опори
 * @property {Object} spans - ціни на прольоти (балки)
 * @property {Object} vertical_supports - ціни на вертикальні стійки
 * @property {Object} diagonal_brace - ціни на розкоси
 * @property {Object} isolator - ціни на ізолятори
 */

/**
 * Глобальний стан прайс-листа
 * @type {import('./createState.js').StateInstance<{ price: PriceData | null, isLoading: boolean, error: string | null }>}
 */
export const priceState = createState({
  price: null,
  isLoading: false,
  error: null,
});

/**
 * Завантаження прайс-листа
 * @returns {Promise<PriceData | null>}
 */
export const loadPrice = async () => {
  if (priceState.get().price) {
    return priceState.get().price;
  }

  try {
    priceState.updateField('isLoading', true);
    priceState.updateField('error', null);

    const res = await fetch('price.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch price.json: ${res.status}`);
    }

    const priceData = await res.json();
    priceState.updateField('price', priceData);
    priceState.updateField('isLoading', false);

    console.log('[PriceState] Price loaded successfully');
    return priceData;
  } catch (error) {
    console.error('[PriceState] Failed to load price:', error);
    priceState.updateField('error', 'Не вдалося завантажити прайс');
    priceState.updateField('isLoading', false);
    return null;
  }
};

/**
 * Отримати прайс синхронно (після завантаження)
 * @returns {PriceData | null}
 */
export const getPrice = () => priceState.get().price;

/**
 * Оновити прайс (наприклад, після редагування)
 * @param {PriceData} newPrice
 */
export const updatePrice = (newPrice) => {
  priceState.updateField('price', newPrice);
};

export default priceState;
