// js/app/pages/battery/features/form/initForm.js
import {
  getFormValuesFromDOM,
  renderFormErrors,
  setFormValuesToDOM,
  validateBatteryForm,
} from './validateForm.js';

/**
 * Ініціалізує форму battery page
 * @param {Object} params
 * @param {Object} params.formContext - battery form context
 * @param {Object} params.selectors - BATTERY_SELECTORS.form (містить root, length, width, etc.)
 * @param {Object} params.effects - EffectRegistry
 * @param {Function} params.addListener - функція для додавання слухачів
 * @param {Function} params.onCalculate - callback для розрахунку
 */
export const initBatteryForm = ({ formContext, selectors, effects, addListener, onCalculate }) => {
  const formEl = effects.get('form', 'root');
  if (!formEl) {
    return;
  }

  // Ініціалізація форми з state
  const formState = formContext.selectors.getForm();
  setFormValuesToDOM(formState, selectors, effects);

  // Обробка submit - запуск розрахунку
  addListener(formEl, 'submit', (e) => {
    e.preventDefault();

    const values = getFormValuesFromDOM(selectors, effects);
    const { valid, errors } = validateBatteryForm(values);

    renderFormErrors(errors, selectors, effects);

    if (!valid) {
      return;
    }

    // Оновлюємо state
    formContext.actions.updateFields(values);

    // Викликаємо розрахунок
    onCalculate(values);
  });
};
