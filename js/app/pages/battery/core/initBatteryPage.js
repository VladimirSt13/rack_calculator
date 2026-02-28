// js/app/pages/battery/core/initBatteryPage.js

/**
 * Ініціалізація сторінки battery: завантаження прайсу
 * @param {import('../../../core/createState.js').StateInstance<import('./batteryPageState.js').BatteryPageState>} state
 * @returns {Promise<boolean>}
 */
export const initBatteryPage = async (state) => {
  try {
    state.updateField('isLoading', true);

    // Динамічний імпорт для уникнення циклічних залежностей
    const { loadPrice } = await import('../../racks/features/priceState.js');
    const price = await loadPrice();

    if (!price) {
      state.updateField('error', 'Ціни не завантажено');
      return false;
    }

    state.updateField('price', price);
    state.updateField('isLoading', false);

    console.log('[BatteryPage] Price loaded successfully');
    return true;
  } catch (error) {
    console.error('[BatteryPage] Failed to load price:', error);
    state.updateField('error', 'Не вдалося завантажити прайс');
    state.updateField('isLoading', false);
    return false;
  }
};

export default initBatteryPage;
