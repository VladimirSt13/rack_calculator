// js/pages/battery/ui/templates/batteryTableTemplate.js

const SPAN_ICONS = {
  BEST_FIT: "✅",
  SYMMETRIC: "🔹",
  BALANCED: "⚖",
};

/**
 * Генерує HTML рядка таблиці
 * @param {Object} rack
 * @param {number} index
 * @returns {string}
 */
export const batteryTableRowTemplate = (rack, index) => {
  const spansHTML = (rack.spans ?? [])
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
