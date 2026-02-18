// js/pages/battery/state/batterySelectors.js

/**
 * Фабрика селекторів для state батарей
 * @param {Object} stateInstance - інстанс batteryState
 * @returns {{
 *   getFormValues: () => {
 *     width: number,
 *     length: number,
 *     height: number,
 *     weight: number,
 *     gap: number,
 *     count: number
 *   },
 *   getResults: () => Array<{
 *     floors: number,
 *     rows: number,
 *     rackLength: number,
 *     width: number,
 *     height: number,
 *     spans?: Array<{
 *       type: 'BEST_FIT' | 'SYMMETRIC' | 'BALANCED',
 *       combo: number[],
 *       isRecommended?: boolean
 *     }>
 *   }>,
 *   hasResults: () => boolean
 * }} batterySelectors
 */
export const createBatterySelectors = (stateInstance) => ({
  /**
   * Отримати всі значення форми
   * @returns {{
   *   width: number,
   *   length: number,
   *   height: number,
   *   weight: number,
   *   gap: number,
   *   count: number
   * }} копія значень форми
   */
  getFormValues() {
    const state = stateInstance.get();

    const { width, length, height, weight, gap, count } = state;

    return { width, length, height, weight, gap, count };
  },

  /**
   * Отримати результати розрахунку
   * @returns {Array<{
   *   floors: number,
   *   rows: number,
   *   rackLength: number,
   *   width: number,
   *   height: number,
   *   spans?: Array<{
   *     type: 'BEST_FIT' | 'SYMMETRIC' | 'BALANCED',
   *     combo: number[],
   *     isRecommended?: boolean
   *   }>
   * }>} масив конфігурацій стелажів
   */
  getResults() {
    const state = stateInstance.get();
    return Array.isArray(state.results) ? [...state.results] : [];
  },

  /**
   * Перевірка наявності результатів
   * @returns {boolean} true, якщо результати існують
   */
  hasResults() {
    return stateInstance.get().results.length > 0;
  },
});
