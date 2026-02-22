// js/pages/battery/actions/batteryFormAction.js

/**
 * Фабрика actions для сторінки батарей
 * @param {Object} stateInstance - інстанс state сторінки
 * @param {Object} initialState - початковий state
 * @returns {Object} batteryActions
 */
export const createBatteryActions = (stateInstance, initialState) => ({
  /**
   * Batch-оновлення полів state
   * @param {Object} values - значення форми
   * @returns {void}
   */
  updateFields(values) {
    stateInstance.batch(() => {
      Object.entries(values).forEach(([key, value]) => {
        stateInstance.updateField(key, value);
      });

      // 🔥 очищення таблиці при зміні полів форми
      stateInstance.updateField('results', []);
    });
  },

  /**
   * Зберігає результати розрахунку
   * @param {Array} resultsArray - масив конфігурацій стелажів
   * @returns {void}
   */
  addResults(resultsArray) {
    stateInstance.batch(() => {
      stateInstance.updateField('results', Array.isArray(resultsArray) ? resultsArray : []);
    });
  },
  clearResults() {
    stateInstance.batch(() => {
      stateInstance.updateField('results', []);
    });
  },

  /**
   * Скидання state до початкового
   * @returns {void}
   */

  reset() {
    stateInstance.batch(() => {
      stateInstance.set({ ...initialState, results: [] });
    });
  },
});
