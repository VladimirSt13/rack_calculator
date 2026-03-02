// js/app/pages/racks/features/form/initForm.js

import { query } from '../../../../effects/dom.js';
import { RACK_SELECTORS } from '../../../../config/selectors.js';

/**
 * @typedef {Object} InitFormParams
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} formContext
 * @property {string[]} supportsOptions
 * @property {string[]} verticalSupportsOptions
 */

/**
 * Ініціалізація форми: заповнення dropdowns + логіка блокування verticalSupports
 * @param {InitFormParams} params
 * @returns {{ unsubscribe: () => void }}
 */
export const initForm = ({ formContext, supportsOptions, verticalSupportsOptions }) => {
  // ===== POPULATE DROPDOWNS =====
  const populateDropdown = (selector, options, placeholder = 'Виберіть...') => {
    const el = query(selector)();
    if (!el) {
      return;
    }
    el.innerHTML = `
      <option value="" disabled selected>${placeholder}</option>
      ${options.map((opt) => `<option value="${opt}">${opt}</option>`).join('')}
    `;
  };

  populateDropdown(RACK_SELECTORS.form.supports, supportsOptions);
  populateDropdown(RACK_SELECTORS.form.verticalSupports, verticalSupportsOptions);

  // ===== VERTICAL SUPPORTS BLOCKING LOGIC =====
  const verticalSupportsEl = query(RACK_SELECTORS.form.verticalSupports)();

  const updateVerticalSupportsState = () => {
    const floors = formContext.selectors.getField('floors');
    if (!verticalSupportsEl) {
      return;
    }

    if (floors === 1) {
      // Скидаємо значення і блокуємо
      verticalSupportsEl.value = '';
      verticalSupportsEl.disabled = true;
    } else {
      // Розблоковуємо
      verticalSupportsEl.disabled = false;
    }
  };

  // Початковий стан
  updateVerticalSupportsState();

  // Підписка на зміни форми
  const unsubscribe = formContext.subscribe((newState) => {
    if (newState.form?.floors !== undefined) {
      updateVerticalSupportsState();
    }
  });

  return { unsubscribe };
};

export default initForm;
