import { calculateComponents } from "./core/calculator.js";
import { rackState } from "./state/rackState.js";
import { generateComponentsTableHTML } from "./ui/templates/componentsTable.js";
import { generateRackNameHTML } from "./ui/templates/rackName.js";
import { updateRackName, updateComponentsTable } from "./ui/rack.js";

export const render = () => {
  const { floors, rows, supports, beams, verticalSupports } = rackState;
  const beamsArray = [...beams.values()];

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

  const { currentRack } = calculateComponents({
    ...rackState,
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
