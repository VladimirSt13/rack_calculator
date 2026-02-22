// js/app/pages/racks/set/state/rackSetSelectors.js

/**
 * @param {import('../../../state/createState.js').StateInstance<import('./rackSetState.js').RackSetState>} stateInstance
 */
export const createRackSetSelectors = (stateInstance) => ({
  /** Full state snapshot */
  getState: () => stateInstance.get(),

  /** All racks array */
  getAll: () => stateInstance.get().racks,

  /** Count of unique rack configs */
  getCount: () => stateInstance.get().racks.length,

  /** Total items count (sum of qty) */
  getTotalItems: () => stateInstance.get().racks.reduce((sum, r) => sum + r.qty, 0),

  /** Grand total cost */
  getTotalCost: () =>
    stateInstance.get().racks.reduce((sum, r) => sum + (r.rack.totalCost || 0) * r.qty, 0),

  /** Is set empty */
  isEmpty: () => stateInstance.get().racks.length === 0,

  /** Get rack by id */
  getById: (id) => stateInstance.get().racks.find((r) => r.id === id) || null,

  /** Is modal open */
  isModalOpen: () => stateInstance.get().isModalOpen,

  /** Expanded rack id */
  getExpandedId: () => stateInstance.get().expandedRackId,
});

export default createRackSetSelectors;
