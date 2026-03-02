// js/app/pages/battery/features/results/initResults.js
import { renderBatteryVariants } from '../../effects/renderBatteryVariants.js';

/**
 * Ініціалізує UI результатів battery page
 * @param {Object} params
 * @param {Object} params.resultsContext - battery results context
 * @param {Object} params.selectors - BATTERY_SELECTORS.results
 * @param {Object} params.effects - EffectRegistry
 * @param {Function} params.getFormValues - функція для отримання значень форми
 */
export const initBatteryResults = ({ resultsContext, selectors, effects, getFormValues }) => {
  const outputEl = document.querySelector(selectors.output);
  if (!outputEl) {
    console.warn('[BatteryResults] Output element not found');
    return;
  }

  // Початковий рендер (порожнє повідомлення)
  const formValues = getFormValues?.() || {};
  renderBatteryVariants([], outputEl, formValues, effects);

  // Підписка на зміни результатів
  resultsContext.subscribe((newState) => {
    // Отримуємо актуальні значення форми
    const currentFormValues = getFormValues?.() || {};
    // Використовуємо effects для рендерингу
    renderBatteryVariants(newState.variants, outputEl, currentFormValues, effects);
  });
};
