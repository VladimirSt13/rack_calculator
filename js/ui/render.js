import { calculateComponents } from "../core/calculator.js";
import { rackState } from "../state/rackState.js";
import { refs } from "./dom.js";
import { generateComponentsTableHTML } from "./templates/componentsTable.js";

// --- Рендер ---
export const render = () => {
  const { floors, rows, supports, beams, verticalSupports } = rackState;

  // Безпечне перетворення Map у масив
  const beamsArray = [...beams.values()];

  // Перевірка на наявність всіх необхідних даних
  const isComplete =
    floors &&
    (floors === 1 || verticalSupports) &&
    rows &&
    supports &&
    beamsArray.length > 0 &&
    beamsArray.every((v) => v.item && v.quantity);

  if (!isComplete) {
    refs.rackName.textContent = "---";
    refs.componentsTable.innerHTML = `<p>Недостатньо даних.</p>`;
    return;
  }

  // Розрахунок компонентів
  const { currentRack } = calculateComponents({
    ...rackState,
    beams: beamsArray,
  });

  const { components, totalCost, description, abbreviation } = currentRack;

  renderRackName({ description, abbreviation });
  renderComponentsTable({ components, totalCost });
};

// --- Назва стелажа ---
const renderRackName = ({ description, abbreviation }) => {
  if (!description || !abbreviation) return;
  refs.rackName.textContent = `${description} ${abbreviation}`;
};

// --- Таблиця компонентів ---
const renderComponentsTable = ({ components, totalCost }) => {
  if (!components || !totalCost) return;

  const isolatorsCost = (components.isolators?.amount || 0) * (components.isolators?.price || 0);

  const table = generateComponentsTableHTML({ components, totalCost, isolatorsCost });

  refs.componentsTable.innerHTML = table;
};
