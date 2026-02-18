// js/app/pages/racks/render.js
import { calculateComponents } from "../core/calculator.js";
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
export const render = ({ selectors, price, getRefs }) => {
  try {
    const refs = getRefs();
    const floors = selectors.getFloors();
    const rows = selectors.getRows();
    const supports = selectors.getSupports();
    const verticalSupports = selectors.getVerticalSupports();
    const beamsArray = selectors.getBeams().map(([, b]) => b); // Map → масив

    // Перевірка на повноту даних
    const isComplete =
      floors &&
      (floors === 1 || verticalSupports) &&
      rows &&
      supports &&
      beamsArray.length > 0 &&
      beamsArray.every((b) => b.item && b.quantity);

    if (!isComplete) {
      updateRackName({ refs, html: "---" });
      updateComponentsTable({ refs, html: "<p>Недостатньо даних.</p>" });
      return;
    }

    const rackConfig = {
      floors,
      rows,
      supports,
      verticalSupports,
      beams: beamsArray,
    };

    // Розрахунок компонентів
    const { currentRack } = calculateComponents({ rackConfig, price });

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
    console.error(err);
    if (refs?.rackName) refs.rackName.innerHTML = "Помилка відображення";
    if (refs?.componentsTable) refs.componentsTable.innerHTML = "<p>Неможливо визначити компоненти.</p>";
  }
};
