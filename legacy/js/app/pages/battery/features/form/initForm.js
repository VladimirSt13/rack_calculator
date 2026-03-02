// js/app/pages/battery/features/form/initForm.js
import {
  populateFormSelects,
  setFormValuesToDOM,
} from './validateForm.js';

/**
 * Ініціалізує форму battery page
 * @param {Object} params
 * @param {Object} params.formContext - battery form context
 * @param {Object} params.selectors - BATTERY_SELECTORS.form (містить root, length, width, etc.)
 * @param {Object} params.effects - EffectRegistry
 * @param {Object} params.formConfig - конфігурація форми (formConfig з batteryPageState)
 */
export const initBatteryForm = ({ formContext, selectors, effects, formConfig }) => {
  const formEl = effects.get('form', 'root');
  if (!formEl) {
    return;
  }

  // 1. Заповнення селектів опціями з конфігурації
  populateFormSelects(formConfig, selectors, effects);

  // 2. Ініціалізація форми з state (після заповнення селектів)
  const formState = formContext.selectors.getForm();
  
  // Використовуємо requestAnimationFrame для гарантованого оновлення DOM
  requestAnimationFrame(() => {
    setFormValuesToDOM(formState, selectors, effects);
  });

  // Примітка: обробка submit та calculate виконується через InteractiveElement
  // (data-action="calculate" на кнопці, data-action="updateField" на полях)
};
