// js/pages/racks/render.js
import { calculateComponents } from "./core/calculator.js";
import { generateComponentsTableHTML } from "./ui/templates/componentsTable.js";
import { generateRackNameHTML } from "./ui/templates/rackName.js";
import { updateRackName, updateComponentsTable } from "./ui/rack.js";

/**
 * Render сторінки racks на основі поточного state через передані selectors
 * @param {Object} rackSelectors - об'єкт селекторів сторінки
 */
export const render = (rackSelectors) => {
  const floors = rackSelectors.getFloors();
  const rows = rackSelectors.getRows();
  const supports = rackSelectors.getSupports();
  const verticalSupports = rackSelectors.getVerticalSupports();
  const beamsArray = rackSelectors.getBeams().map(([, b]) => b); // Map → масив

  // Перевірка на повноту даних
  const isComplete =
    floors &&
    (floors === 1 || verticalSupports) &&
    rows &&
    supports &&
    beamsArray.length > 0 &&
    beamsArray.every((b) => b.item && b.quantity);

  if (!isComplete) {
    updateRackName("---");
    updateComponentsTable("<p>Недостатньо даних.</p>");
    return;
  }

  // Розрахунок компонентів
  const { currentRack } = calculateComponents({
    floors,
    rows,
    supports,
    verticalSupports,
    beams: beamsArray,
  });

  const { components, totalCost, description, abbreviation } = currentRack;

  updateRackName(generateRackNameHTML({ description, abbreviation }));
  updateComponentsTable(
    generateComponentsTableHTML({
      components,
      totalCost,
      isolatorsCost: (components.isolators?.amount || 0) * (components.isolators?.price || 0),
    }),
  );
};
