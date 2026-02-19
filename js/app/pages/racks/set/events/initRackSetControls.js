// js/app/pages/racks/set/events/initRackSetControls.js

/**
 * Initializes the controls for the rack set.
 *
 * @param {Object} options - The options object.
 * @param {Function} options.addListener - The function to register event listeners.
 * @param {Object} options.rackSet - The rack set object.
 * @return {void}
 */
export const initRackSetControls = ({ addListener, rackSet, onEditRack }) => {
  const { actions, getRefs } = rackSet;
  const refs = getRefs();

  // editBtn.addEventListener("click", () => {
  //   onEditRack?.(r.rack);
  // });

  // removeBtn.addEventListener("click", () => {
  //   actions.removeRack(r.id);
  // });
};
