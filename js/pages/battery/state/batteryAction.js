// js/pages/battery/actions/batteryFormAction.js

/**
 * Фабрика actions для сторінки батарей
 * @param {Object} stateInstance - інстанс state сторінки
 * @param {Object} initialState - початковий state
 * @returns {Object} batteryActions
 */
export const createBatteryActions = (stateInstance, initialState) => ({
  /**
   * Оновлення полів state
   * @param {Object} values
   */
  updateFields(values) {
    Object.entries(values).forEach(([key, value]) => stateInstance.updateField(key, value));
  },

  /**
   * Додає масив результатів до існуючих
   * @param {Array} resultsArray
   */
  addResults(resultsArray) {
    const state = stateInstance.get();
    stateInstance.updateField("results", [...resultsArray]);
  },

  /**
   * Скидання state до початкового
   */
  reset() {
    const resetValues = { ...initialState, results: [] };
    stateInstance.set(resetValues);
  },
});
