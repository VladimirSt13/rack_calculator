// js/pages/racks/set/state/rackSetSelectors.js

/**
 * Фабрика селекторів для комплекту стелажів
 * @param {Object} stateInstance - інстанс createState
 * @returns {Object}
 */
export const createRackSetSelectors = (stateInstance) => ({
  /**
   * Отримати повний state
   */
  getState() {
    return stateInstance.get();
  },

  /**
   * Отримати всі стелажі
   */
  getAll() {
    return stateInstance.get().racks;
  },

  /**
   * Кількість стелажів
   */
  getCount() {
    return stateInstance.get().racks.length;
  },

  /**
   * Загальна вартість комплекту
   */
  getTotalCost() {
    return stateInstance.get().racks.reduce((sum, rack) => sum + (rack.totalCost || 0), 0);
  },

  /**
   * Чи комплект порожній
   */
  isEmpty() {
    return stateInstance.get().racks.length === 0;
  },
});
