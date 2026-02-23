// js/app/pages/racks/handlers/setHandler.js

/**
 * @typedef {Object} SetHandlerDeps
 * @property {ReturnType<import('../set/context.js').createRackSetContext>} rackSet
 * @property {ReturnType<import('../calculator/context.js').createCalculatorContext>} [calculator]
 */

/**
 * Add calculated rack to set
 * @param {SetHandlerDeps} deps
 */
export const handleAddToSet = ({ calculator, rackSet }) => {
  const rack = calculator?.selectors?.getCurrentRack?.();
  if (!rack) {
    return;
  }
  const qty = Number(prompt('Введіть кількість стелажів', '1')) || 1;
  rackSet.actions.addRack({ rack, qty });
};

/**
 * Handle rack set quantity controls (delegation)
 * @param {MouseEvent} e
 * @param {SetHandlerDeps} deps
 */
export const handleRackSetAction = (e, { rackSet }) => {
  const controls = e.target.closest('[data-js="qty-controls"]');
  if (!controls) {
    return;
  }
  const id = controls.dataset.id;
  const action = e.target.dataset.action;
  if (!id || !action) {
    return;
  }
  const item = rackSet.selectors.getById(id);
  if (!item) {
    return;
  }

  switch (action) {
    case 'increase':
      rackSet.actions.updateQty(id, item.qty + 1);
      break;
    case 'decrease':
      rackSet.actions.updateQty(id, item.qty - 1);
      break;
    case 'remove':
      rackSet.actions.removeRack(id);
      break;
  }
};

/**
 * Toggle details in modal
 * @param {MouseEvent} e
 * @param {SetHandlerDeps} deps
 */
export const handleToggleDetails = (e, { rackSet }) => {
  if (!e.target.matches('[data-js="toggle-details"]')) {
    return;
  }
  const id = e.target.dataset.id;
  rackSet.actions.toggleExpanded(id);
};

/**
 * Open modal
 * @param {SetHandlerDeps} deps
 */
export const handleOpenModal = ({ rackSet }) => rackSet.actions.openModal();
