import { calculateComponents } from "../core/calculator.js";
import { rackState } from "../state/rackState.js";
import { refs } from "./dom.js";

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
    if (!components) return;

    const tableRows = Object.values(components)
        .flatMap((comp) => {
            if (Array.isArray(comp)) {
                return comp.map(
                    (c) => `
                    <tr>
                        <td>${c.name}</td>
                        <td>${c.amount}</td>
                        <td>${c.price}</td>
                        <td>${c.price * c.amount}</td>
                    </tr>`,
                );
            } else {
                return `
                    <tr>
                        <td>${comp.name}</td>
                        <td>${comp.amount}</td>
                        <td>${comp.price}</td>
                        <td>${comp.price * comp.amount}</td>
                    </tr>`;
            }
        })
        .join("");

    const isolatorsTotal =
        (components.isolators?.amount || 0) *
        (components.isolators?.price || 0);

    refs.componentsTable.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Компонент</th>
                    <th>Кількість</th>
                    <th>Ціна за одиницю</th>
                    <th>Загальна вартість</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        <p class="total">Загальна вартість без ізоляторів: ${totalCost - isolatorsTotal}</p>
        <p class="total">Загальна вартість: ${totalCost}</p>
        <p class="total">Нульова ціна АЕ (+ПДВ +націнка): ${Math.round(totalCost * 1.2 * 1.2)}</p>
    `;
};
