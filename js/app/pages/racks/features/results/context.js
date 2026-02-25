// js/app/pages/racks/features/results/context.js

import { createFeatureContext } from '../../../../core/FeatureContext.js';
import { initialResultsState } from './state.js';

/**
 * @typedef {import('./state.js').ComponentItem} ComponentItem
 * @typedef {import('./state.js').ResultsState} ResultsState
 */

/**
 * Створює контекст результатів розрахунку
 * @returns {import('../../../../core/FeatureContext.js').FeatureContext<ResultsState>}
 */
export const createRackResultsContext = () =>
  createFeatureContext({
    name: 'results',
    initialState: initialResultsState,

    createActions: (state) => ({
      /**
       * Встановити результат розрахунку
       * @param {{ name: string, tableHtml: string, total: number, components: Object }} result
       */
      setResult: (result) => {
        state.set({
          ...result,
          lastCalculated: Date.now(),
        });
      },

      /**
       * Очистити результати
       */
      clear: () => {
        state.set(initialResultsState);
      },

      /**
       * Перемкнути видимість цін
       * @param {boolean} show
       */
      togglePrices: (show) => {
        state.updateField('showPrices', show);
      },
    }),

    createSelectors: (state) => ({
      /**
       * Отримати назву стелажа
       * @returns {string}
       */
      getName: () => state.get().name,

      /**
       * Отримати HTML таблиці компонентів
       * @returns {string}
       */
      getTableHtml: () => state.get().tableHtml,

      /**
       * Отримати загальну вартість
       * @returns {number}
       */
      getTotal: () => state.get().total,

      /**
       * Отримати компоненти
       * @returns {Object.<string, ComponentItem|ComponentItem[]>}
       */
      getComponents: () => state.get().components,

      /**
       * Отримати timestamp останнього розрахунку
       * @returns {number|null}
       */
      getLastCalculated: () => state.get().lastCalculated,

      /**
       * Перевірити чи є результат
       * @returns {boolean}
       */
      hasResult: () => state.get().total > 0 && state.get().name !== '',

      /**
       * Отримати повний об'єкт результату (для додавання до комплекту)
       * @returns {ResultsState}
       */
      getRack: () => state.get(),

      /**
       * Отримати дані для PageContext.collectInputData()
       * @returns {ResultsState}
       */
      getData: () => state.get(),

      /**
       * Отримати стан видимості цін
       * @returns {boolean}
       */
      getShowPrices: () => state.get().showPrices,
    }),
  });

export default createRackResultsContext;
