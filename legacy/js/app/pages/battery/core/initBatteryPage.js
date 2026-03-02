// js/app/pages/battery/core/initBatteryPage.js

import { loadPrice } from '../../../core/priceState.js';
import { BATTERY_FORM_CONFIG } from '../config/batteryConfig.js';

/**
 * Ініціалізація сторінки battery: завантаження прайсу та конфігурації
 * @param {import('../../../core/createState.js').StateInstance} state
 * @returns {Promise<boolean>}
 */
export const initBatteryPage = async (state) => {
  try {
    state.updateField('isLoading', true);

    const price = await loadPrice();

    if (!price) {
      state.updateField('error', 'Ціни не завантажено');
      state.updateField('isLoading', false);
      return false;
    }

    state.updateField('price', price);
    state.updateField('formConfig', BATTERY_FORM_CONFIG);
    state.updateField('isLoading', false);

    console.log('[BatteryPage] Configuration loaded successfully');
    return true;
  } catch (error) {
    console.error('[BatteryPage] Failed to load configuration:', error);
    state.updateField('error', 'Не вдалося завантажити конфігурацію');
    state.updateField('isLoading', false);
    return false;
  }
};

export default initBatteryPage;
