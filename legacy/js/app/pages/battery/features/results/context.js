// js/app/pages/battery/features/results/context.js
import { createFeatureContext } from '../../../../core/FeatureContext.js';
import { initialBatteryResultsState } from './state.js';

/**
 * Створює FeatureContext для результатів battery
 * @returns {Object} batteryResultsContext
 */
export const createBatteryResultsContext = () =>
  createFeatureContext({
    name: 'batteryResults',
    initialState: initialBatteryResultsState,
    createActions: (state) => ({
      /**
       * Встановити результати розрахунку
       * @param {Array<Object>} variants - масив варіантів стелажів
       */
      setResults: (variants) => state.updateField('variants', Array.isArray(variants) ? variants : []),

      /**
       * Додати результати (append)
       * @param {Array<Object>} variants
       */
      addResults: (variants) => {
        const current = state.get().variants;
        state.updateField('variants', [...current, ...variants]);
      },

      /**
       * Очистити результати
       */
      clear: () => state.updateField('variants', []),
    }),
    createSelectors: (state) => ({
      /**
       * Отримати всі результати
       * @returns {Array<Object>}
       */
      getResults: () => state.get().variants,

      /**
       * Перевірити наявність результатів
       * @returns {boolean}
       */
      hasResults: () => state.get().variants.length > 0,

      /**
       * Отримати кількість результатів
       * @returns {number}
       */
      getCount: () => state.get().variants.length,
    }),
  });
