// js/app/pages/battery/features/results/initResults.js

/**
 * Ініціалізує UI результатів battery page
 * @param {Object} params
 * @param {Object} params.resultsContext - battery results context
 * @param {Object} params.selectors - BATTERY_SELECTORS.results (містить output, table, tableBody)
 * @param {Object} params.effects - EffectRegistry
 * @param {Function} params.renderCallback - callback для рендерингу таблиці
 */
export const initBatteryResults = ({ resultsContext, selectors, effects, renderCallback }) => {
  const outputEl = document.querySelector(selectors.output);
  if (!outputEl) {
    console.warn('[BatteryResults] Output element not found');
    return;
  }

  // Початковий рендер (порожнє повідомлення)
  renderCallback([], outputEl);

  // Підписка на зміни результатів
  resultsContext.subscribe((newState) => {
    // Використовуємо effects для рендерингу
    renderCallback(newState.results, outputEl, effects);
  });
};
