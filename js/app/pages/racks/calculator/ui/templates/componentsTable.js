// js/pages/racks/ui/templates/componentsTable.js

// --- Генератор таблиці компонентів ---
export const generateComponentsTableHTML = ({
    components,
    totalCost,
    isolatorsCost,
}) => {
    if (!components) return "";

    // Функція для одного рядка
    const rowHTML = (c) => `
    <tr class="rack__components-table__row">
      <td>${c.name}</td>
      <td>${c.amount}</td>
      <td>${c.price}</td>
      <td>${c.amount * c.price}</td>
    </tr>`;

    // Генеруємо всі рядки: якщо компонент масив — генеруємо для кожного елемента, інакше один
    const tableRows = Object.values(components)
        .map((c) => (Array.isArray(c) ? c.map(rowHTML).join("") : rowHTML(c)))
        .join("");

    const totalWithoutIsolators = totalCost - (isolatorsCost || 0);
    const zeroCost = Math.round(totalCost * 1.2 * 1.2);

    return `
    <table class="rack__components-table__table">
      <thead>
        <tr class="rack__components-table__header">
          <th>Компонент</th>
          <th>Кількість</th>
          <th>Ціна за одиницю</th>
          <th>Загальна вартість</th>
        </tr>
      </thead>
       <tbody class="rack__components-table__body">
         ${tableRows}
      </tbody>
    </table>
    <div class="rack__price">
      <p class="price">Загальна вартість без ізоляторів: ${totalWithoutIsolators}</p>
      <p class="total">Загальна вартість: ${totalCost}</p>
      <p class="zero-cost">Нульова ціна АЕ (+ПДВ +націнка): ${zeroCost}</p>
    </div>
  `;
};
