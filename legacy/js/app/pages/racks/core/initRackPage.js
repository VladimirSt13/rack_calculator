// js/app/pages/racks/core/initRackPage.js

import { loadPrice, getPrice } from '../../../core/priceState.js';

/**
 * Ініціалізація сторінки стелажа: завантаження прайсу та налаштування опцій
 * @param {import('../../../core/createState.js').StateInstance} state
 * @returns {Promise<boolean>}
 */
export const initRackPage = async (state) => {
  try {
    state.updateField('isLoading', true);

    const price = await loadPrice();

    if (!price) {
      state.updateField('error', 'Ціни не завантажено');
      state.updateField('isLoading', false);
      return false;
    }

    state.updateField('price', price);
    state.updateField('supportsOptions', Object.keys(price.supports || {}));
    state.updateField('verticalSupportsOptions', Object.keys(price.vertical_supports || {}));
    state.updateField('spanOptions', Object.keys(price.spans || {}));
    state.updateField('isLoading', false);

    console.log('[RackPage] Price loaded successfully');
    return true;
  } catch (error) {
    console.error('[RackPage] Failed to load price:', error);
    state.updateField('error', 'Не вдалося завантажити прайс');
    state.updateField('isLoading', false);
    return false;
  }
};

export default initRackPage;
