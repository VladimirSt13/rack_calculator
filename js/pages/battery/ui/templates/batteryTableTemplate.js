// js/pages/battery/ui/templates/batteryTableTemplate.js

/**
 * Генерує шаблон заголовка таблиці
 * @param {Array<string>} headers - Массив назв колонок
 * @returns {string} HTML рядка <tr> для thead
 */
export const batteryTableHeaderTemplate = (headers) => `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;

/**
 * Генерує HTML рядок для ряду таблиці результатів
 * @param {{ rack: Object, index: number }} - об'єкт з результатом
 * @returns {string} HTML рядка <tr> для tbody
 * @prop {Object} rack - об'єкт з результатом
 * @prop {number} index - індекс результату
 */
export const batteryTableRowTemplate = ({ rack, index }) => {
  console.log("🚀 ~ rack->", rack);
  const spansHTML = (rack.topSpans ?? [])
    .slice(0, 10)
    .map((span) => {
      return `<div>${span.combination.join(" + ")} [${span.beams} балок]</div>`;
    })
    .join("");

  const recommendedClass = rack.spans?.some((v) => v.isRecommended) ? "recommended" : "";

  return `
    <tr class="${recommendedClass}">
      <td>${index + 1}</td>
      <td>${rack.floors}</td>
      <td>${rack.rows}</td>
      <td>${rack.length}</td>
      <td>${rack.width}</td>
      <td>${rack.height}</td>
      <td>${spansHTML}</td>
    </tr>
  `;
};

/**
 * HTML для порожньої таблиці
 * @param {number} colSpan
 * @returns {string}
 */
export const emptyBatteryTableTemplate = (colSpan) => `
  <tr>
    <td colspan="${colSpan}" style="text-align:center">
      Немає варіантів
    </td>
  </tr>
`;
