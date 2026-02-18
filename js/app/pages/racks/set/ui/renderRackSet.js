import { aggregateRackSet } from "../core/aggregate.js";

/**
 * Рендер комплекту стелажів
 */
export const renderRackSet = ({ selectors, refs }) => {
  const container = refs.rackSetTable;
  const summary = refs.rackSetSummary;

  if (!container || !summary) return;

  const racks = rackSetSelectors.getAll();

  if (!racks.length) {
    container.innerHTML = "<p>Комплект порожній</p>";
    summary.innerHTML = "";
    return;
  }

  const aggregated = aggregateRackSet(racks);

  // --- таблиця ---
  container.innerHTML = `
    <table class="rack-set-table">
      <thead>
        <tr>
          <th>№</th>
          <th>Назва</th>
          <th>Кількість</th>
          <th>Ціна за од.</th>
          <th>Сума</th>
        </tr>
      </thead>
      <tbody>
        ${aggregated
          .map(
            (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice}</td>
                <td>${item.total}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;

  // --- підсумок ---
  const total = aggregated.reduce((sum, r) => sum + r.total, 0);

  summary.innerHTML = `
    <div class="rack-set-total">
      <strong>Загальна сума:</strong> ${total}
    </div>
  `;
};
