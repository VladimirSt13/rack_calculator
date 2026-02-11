import { calculateComponents } from "../core/calculator.js";
import { rackState } from "../state/rackState.js";
import { refs } from "./dom.js";

// --- Рендер ---
export const render = () => {
  const { floors, rows, support, beams } = rackState;
  const beamsArray = Array.from(beams.values());
  const isComplete =
    floors && rows && support && beamsArray.length > 0 && beamsArray.every((v) => v.item && v.quantity);

  if (!isComplete) {
    refs.rackName.textContent = "---";
    refs.componentsTable.innerHTML = `<p>Недостатньо даних.</p>`;
    return;
  }
  const { currentRack } = calculateComponents({ ...rackState, beams: beamsArray });
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
  if (!components) return;

  const tableRows = Object.keys(components)
    .map((c) => {
      if (Array.isArray(components[c])) {
        return components[c].map(
          (comp) => `
          <tr>
            <td>${comp.name}</td>
            <td>${comp.amount}</td>
            <td>${comp.price}</td>
            <td>${comp.price * comp.amount}</td>
          </tr>
        `,
        );
      } else {
        return `
        <tr>
          <td>${components[c].name}</td>
          <td>${components[c].amount}</td>
          <td>${components[c].price}</td>
          <td>${components[c].price * components[c].amount}</td>
        </tr>
      `;
      }
    })
    .join("");

  refs.componentsTable.innerHTML = `<table>
            <thead>
            <tr>
            <th>Компонент</th>
            <th>Кількість</th>
            <th>Ціна за одиницю</th>
            <th>Загальна вартість</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
           </table>
           <p class="total">Загальна вартість без ізоляторів: ${totalCost - (components.isolators?.amount * components.isolators?.price || 0)}</p>
           <p class="total">Загальна вартість: ${totalCost}</p>
           <p class="total">Нульова ціна АЕ (+ПДВ +націнка): ${totalCost * 1.2 * 1.2}</p>        
           `;
};
