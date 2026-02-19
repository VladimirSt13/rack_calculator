// js/pages/racks/set/state/rackSetActions.js

import { generateRackId } from "../utils/generateRackId.js";

/**
 * Створіть actions для сторінки racks
 * @param {Object} stateInstance - інстанс state сторінки
 * @param {Object} initialState - початковий state
 * @returns {Object} rackSetActions
 * @property {function} addRack - додати стелаж до комплекту
 * @property {function} removeRack - видалити стелаж за індексом
 * @property {function} updateQty - оновити кількість стелажу в комплекті
 * @property {function} clear - очистити комплект
 * @property {function} reset - скинути до початкового стану
 */
export const createRackSetActions = (stateInstance, initialState) => {
  return {
    /**
     * Додати стелаж до комплекту
     * @param {Object} rack - повний currentRack
     */
    addRack({ rack, qty = 1 }) {
      if (!rack) return;
      const id = generateRackId(rack);
      const { racks } = stateInstance.get();

      const existing = racks.find((r) => r.id === id);

      if (existing) {
        stateInstance.set({
          racks: racks.map((r) => (r.id === id ? { ...r, qty: r.qty + qty } : r)),
        });
        return;
      }

      stateInstance.set({
        racks: [...racks, { id, rack: structuredClone(rack), qty }],
      });
    },

    /**
     * Видалити стелаж за індексом
     * @param {number} index
     */
    removeRack(id) {
      const { racks } = stateInstance.get();

      stateInstance.set({
        racks: racks.filter((r) => r.id !== id),
      });
    },

    /**
     * Update quantity of rack in rack set
     * @param {string} id - id of the rack to update
     * @param {number} qty - new quantity of the rack
     */
    updateQty(id, qty) {
      const { racks } = stateInstance.get();

      stateInstance.set({
        racks: racks.map((r) => (r.id === id ? { ...r, qty } : r)),
      });
    },

    /**
     * Очистити комплект
     */
    clear() {
      stateInstance.updateField("racks", []);
    },

    /**
     * Скинути до початкового стану
     */
    reset() {
      stateInstance.set({ ...initialState });
    },

    openModal() {
      stateInstance.updateField("isModalOpen", true);
    },
    closeModal() {
      stateInstance.updateField("isModalOpen", false);
    },
  };
};
