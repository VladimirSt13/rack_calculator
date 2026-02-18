// js/pages/racks/set/state/rackSetActions.js

/**
 * Фабрика actions для сторінки racks
 * @param {Object} stateInstance - інстанс state сторінки
 * @param {Object} initialState - початковий state
 * @returns {Object} rackActions - об'єкт з методами actions для сторінки racks
 */
export const createRackSetActions = (stateInstance, initialState) => ({
  /**
   * Додати стелаж до комплекту
   * @param {Object} rack - повний currentRack
   */
  addRack(rack) {
    if (!rack) return;

    const state = stateInstance.get();
    const next = [...state.racks, structuredClone(rack)];

    stateInstance.updateField("racks", next);
  },

  /**
   * Видалити стелаж за індексом
   * @param {number} index
   */
  removeRack(index) {
    const state = stateInstance.get();
    if (index < 0 || index >= state.racks.length) return;

    const next = state.racks.filter((_, i) => i !== index);
    stateInstance.updateField("racks", next);
  },

  /**
   * Очистити комплект
   */
  clear() {
    stateInstance.updateField("racks", []);
  },

  /**
   * Додати декілька стелажів одним викликом
   * @param {Array<Object>} racks
   */
  addMany(racks = []) {
    if (!Array.isArray(racks) || !racks.length) return;

    stateInstance.batch(() => {
      const state = stateInstance.get();
      stateInstance.updateField("racks", [...state.racks, ...racks.map((r) => structuredClone(r))]);
    });
  },

  /**
   * Замінити весь комплект
   * @param {Array<Object>} racks
   */
  replaceAll(racks = []) {
    stateInstance.updateField(
      "racks",
      racks.map((r) => structuredClone(r)),
    );
  },

  /**
   * Скинути до початкового стану
   */
  reset() {
    stateInstance.set({ ...initialState });
  },
});
