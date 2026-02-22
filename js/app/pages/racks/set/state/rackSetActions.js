// js/app/pages/racks/set/state/rackSetActions.js

import { generateRackId } from '../utils/generateRackId.js';

/**
 * @param {import('../../../state/createState.js').StateInstance<import('./rackSetState.js').RackSetState>} stateInstance
 * @param {import('./rackSetState.js').RackSetState} initialState
 */
export const createRackSetActions = (stateInstance, initialState) => ({
  /**
   * Add rack to set (merge if exists)
   * @param {{ rack: import('./rackSetState.js').RackSetItem['rack'], qty?: number }} payload
   */
  addRack: ({ rack, qty = 1 }) => {
    if (!rack) {
      return;
    }

    const id = generateRackId(rack);
    const { racks } = stateInstance.get();
    const existing = racks.find((r) => r.id === id);

    if (existing) {
      stateInstance.set({
        racks: racks.map((r) => (r.id === id ? { ...r, qty: r.qty + qty } : r)),
      });
    } else {
      stateInstance.set({
        racks: [...racks, { id, rack: structuredClone(rack), qty }],
      });
    }
  },

  /**
   * Remove rack by id
   * @param {string} id
   */
  removeRack: (id) => {
    const { racks } = stateInstance.get();
    stateInstance.set({ racks: racks.filter((r) => r.id !== id) });
  },

  /**
   * Update quantity
   * @param {string} id
   * @param {number} qty
   */
  updateQty: (id, qty) => {
    if (qty <= 0) {
      return actions.removeRack(id);
    }
    const { racks } = stateInstance.get();
    stateInstance.set({
      racks: racks.map((r) => (r.id === id ? { ...r, qty } : r)),
    });
  },

  /** Clear all racks */
  clear: () => stateInstance.updateField('racks', []),

  /** Reset to initial state */
  reset: () => stateInstance.set({ ...initialState }),

  /** Modal controls */
  openModal: () => stateInstance.updateField('isModalOpen', true),
  closeModal: () => stateInstance.updateField('isModalOpen', false),
  toggleExpanded: (id) => {
    const { expandedRackId } = stateInstance.get();
    stateInstance.updateField('expandedRackId', expandedRackId === id ? null : id);
  },
});
