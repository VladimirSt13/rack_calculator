// js/app/pages/racks/set/ui/renderRackSet.js

import { aggregateRackSet } from "../core/aggregate.js";

/**
 * Рендер комплекту стелажів
 */
export const renderRackSet = ({ actions, selectors, refs, onEditRack }) => {
  const container = refs.rackSetTable;
  const summary = refs.rackSetSummary;

  if (!container || !summary) return;

  const racks = selectors.getAll();

  if (!racks.length) {
    container.innerHTML = "<p>Комплект порожній</p>";
    summary.innerHTML = "";
    return;
  }

  const aggregated = aggregateRackSet(racks);

  container.innerHTML = `
    <table class="rack-set-table">
      <thead>
        <tr>
          <th>№</th>
          <th>Назва</th>
          <th>Кількість</th>
          <th>Ціна за од.</th>
          <th>Сума</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        ${aggregated
          .map(
            (item, index) => `
              <tr data-id="${item.id}">
                <td>${index + 1}</td>
                <td>${item.rack.abbreviation}</td>
                <td>${item.qty}</td>
                <td>${item.rack.totalCost}</td>
                <td>${item.rack.totalCost * item.qty}</td>
                <td>
                  <button class="btn-decrease">-</button>
                  <button class="btn-increase">+</button>
               
                  <button class="btn-remove">Видалити</button>
                </td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;

  // --- Підсумок ---
  const total = aggregated.reduce((sum, r) => sum + r.rack.totalCost * r.qty, 0);
  summary.innerHTML = `<div class="rack-set-total"><strong>Загальна сума:</strong> ${total}</div>`;

  // --- Додаємо події кнопок ---
  const tbody = container.querySelector("tbody");

  tbody.querySelectorAll("tr").forEach((tr) => {
    const id = tr.dataset.id;
    const decreaseBtn = tr.querySelector(".btn-decrease");
    const increaseBtn = tr.querySelector(".btn-increase");

    const removeBtn = tr.querySelector(".btn-remove");

    decreaseBtn?.addEventListener("click", () => {
      const rack = racks.find((r) => r.id === id);
      if (!rack) return;

      const newQty = rack.qty - 1;
      if (newQty <= 0) {
        actions.removeRack(id);
      } else {
        actions.updateQty(id, newQty);
      }
    });

    increaseBtn?.addEventListener("click", () => {
      const rack = racks.find((r) => r.id === id);
      if (!rack) return;
      actions.updateQty(id, rack.qty + 1);
    });

    removeBtn?.addEventListener("click", () => {
      console.log("remove", id);
      actions.removeRack(id);
    });
  });
};
