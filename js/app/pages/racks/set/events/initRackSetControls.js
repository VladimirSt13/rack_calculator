// js/app/pages/racks/set/events/initRackSetControls.js

/**
 * Initializes the controls for the rack set.
 *
 * @param {Object} options - The options object.
 * @param {Function} options.addListener - The function to register event listeners.
 * @param {Object} options.rackSet - The rack set object.
 * @return {void}
 */
export const initRackSetControls = ({ addListener, rackSet }) => {
  const { getRefs } = rackSet;
  const refs = getRefs();
  const btn = refs.addRackBtn;
  if (!btn) return;

  addListener(btn, "click", () => {
    // додаємо стелаж у state
    // для початку можемо додати тестовий об’єкт або скопіювати останній
    const newRack = {
      description: "Новий стелаж",
      abbreviation: `R${Date.now()}`, // унікальний ключ
      totalCost: 0,
      components: [],
    };

    rackSetActions.addRack(newRack); // додаємо через actions
  });
};
