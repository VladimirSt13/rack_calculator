// js/app/pages/racks/features/results/initResults.js

import { query } from '../../../../effects/dom.js';
import { RACK_SELECTORS } from '../../../../config/selectors.js';
import { log } from '../../../../config/env.js';

/**
 * @typedef {Object} InitResultsParams
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} resultsContext
 * @property {HTMLElement | null} addToSetBtn
 * @property {Function} addListener
 */

/**
 * Ініціалізація результатів: togglePrices handler + активація кнопки AddToSet
 * @param {InitResultsParams} params
 * @returns {{ unsubscribe: () => void }}
 */
export const initResults = ({ resultsContext, addToSetBtn, addListener }) => {
  // ===== TOGGLE PRICES CHECKBOX HANDLER =====
  const handleTogglePrices = (event) => {
    const showPrices = event.target.checked;
    resultsContext.actions.togglePrices(showPrices);

    // Зміна тексту лейбла
    const label = event.target.closest('.rack__price-toggle-label');
    if (label) {
      const textSpan = label.querySelector('.rack__price-toggle-text');
      if (textSpan) {
        textSpan.textContent = showPrices ? 'Приховати ціни' : 'Показати ціни';
      }
    }

    // Перемикання видимості цін через клас на wrapper
    const componentsTable = query(RACK_SELECTORS.results.componentsTable)();
    if (componentsTable) {
      const wrapper = componentsTable.querySelector('.rack__components-table-wrapper');
      if (wrapper) {
        if (showPrices) {
          wrapper.classList.remove('rack__prices-hidden');
        } else {
          wrapper.classList.add('rack__prices-hidden');
        }
      }
    }
  };

  // Делегування події для динамічно створеного чекбокса
  const pageContainer = query(RACK_SELECTORS.page)();
  if (pageContainer) {
    addListener(pageContainer, 'change', handleTogglePrices);
  }

  // ===== ADD TO SET BUTTON ACTIVATION =====
  const unsubscribe = resultsContext.subscribe((newState) => {
    // Активація кнопки "Додати до комплекту" при зміні результату
    if (newState.total !== undefined && addToSetBtn) {
      const hasValidResult = newState.total > 0 && newState.name;

      if (hasValidResult) {
        // Активуємо кнопку
        addToSetBtn.removeAttribute('disabled');
        addToSetBtn.removeAttribute('aria-disabled');
        addToSetBtn.dataset.state = 'ready';
        addToSetBtn.classList.remove('btn--disabled');
      } else {
        // Деактивуємо кнопку
        addToSetBtn.setAttribute('disabled', '');
        addToSetBtn.setAttribute('aria-disabled', 'true');
        addToSetBtn.dataset.state = 'disabled';
        addToSetBtn.classList.add('btn--disabled');
      }
    }
  });

  return { unsubscribe };
};

export default initResults;
