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
       * @param {Array<Object>} results - масив конфігурацій стелажів
       */
      setResults: (results) => state.updateField('results', Array.isArray(results) ? results : []),

      /**
       * Додати результати (append)
       * @param {Array<Object>} results
       */
      addResults: (results) => {
        const current = state.get().results;
        state.updateField('results', [...current, ...results]);
      },

      /**
       * Очистити результати
       */
      clear: () => state.updateField('results', []),
    }),
    createSelectors: (state) => ({
      /**
       * Отримати всі результати
       * @returns {Array<Object>}
       */
      getResults: () => state.get().results,

      /**
       * Перевірити наявність результатів
       * @returns {boolean}
       */
      hasResults: () => state.get().results.length > 0,

      /**
       * Отримати кількість результатів
       * @returns {number}
       */
      getCount: () => state.get().results.length,
    }),
  });
