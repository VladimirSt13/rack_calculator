// --- Генератор таблиці компонентів ---
export const generateComponentsTableHTML = ({ components, totalCost, isolatorsCost }) => {
  if (!components) return "";

  // Функція для одного рядка
  const rowHTML = (c) => `
    <tr>
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
    <p class="price">Загальна вартість без ізоляторів: ${totalWithoutIsolators}</p>
    <p class="total">Загальна вартість: ${totalCost}</p>
    <p class="zero-cost">Нульова ціна АЕ (+ПДВ +націнка): ${zeroCost}</p>
  `;
};
