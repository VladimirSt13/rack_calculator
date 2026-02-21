// js/app/pages/racks/render.js
import { generateComponentsTableHTML } from "./templates/componentsTable.js";
import { generateRackNameHTML } from "./templates/rackName.js";
import { updateRackName, updateComponentsTable } from "./rack.js";

/**
 * Renders the rack components based on the provided selectors and refs.
 *
 * @param {Object} options - The options object.
 * @param {Object} options.selectors - The selectors object containing methods to retrieve data.
 * @param {Object} options.refs - The refs object containing references to DOM elements.
 * @return {void}
 */
export const render = ({ selectors, getRefs }) => {
  const refs = getRefs();
  try {
    const currentRack = selectors.getCurrentRack();

    if (!currentRack) {
      updateRackName({ refs, html: "---" });
      updateComponentsTable({ refs, html: "<p>Недостатньо даних.</p>" });
      return;
    }

    const { components, totalCost, description, abbreviation } = currentRack;

    updateRackName({
      refs,
      html: generateRackNameHTML({ description, abbreviation }),
    });
    updateComponentsTable({
      refs,
      html: generateComponentsTableHTML({
        components,
        totalCost,
      }),
    });
  } catch (err) {
    console.warn(err);
    if (refs?.rackName) refs.rackName.innerHTML = "Помилка відображення";
    if (refs?.componentsTable) refs.componentsTable.innerHTML = "<p>Неможливо визначити компоненти.</p>";
  }
};
