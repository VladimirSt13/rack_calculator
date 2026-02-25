// js/app/pages/racks/core/initRackPage.js

/**
 * Ініціалізація сторінки стелажа: завантаження прайсу
 * @param {import('../../core/createState.js').StateInstance<import('../page.js').RackPageState>} state
 * @returns {Promise<boolean>}
 */
export const initRackPage = async (state) => {
  try {
    state.updateField('isLoading', true);

    // Динамічний імпорт для уникнення циклічних залежностей
    const { loadPrice } = await import('../features/priceState.js');
    const price = await loadPrice();

    if (!price) {
      state.updateField('error', 'Ціни не завантажено');
      return;
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
