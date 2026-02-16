// js/pages/battery/ui/templates/batteryTableTemplate.js

import { beamWord } from "../../../../utils/helpers.js";

/**
 * Генерує шаблон заголовка таблиці
 * @param {Array<string>} headers - Массив назв колонок
 * @returns {string} HTML рядка <tr> для thead
 */
export const batteryTableHeaderTemplate = (headers) => `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;

/**
 * Генерує HTML рядок для рядка таблиці результатів
 * @param {Object} obj - об'єкт з полями rack та index
 * @param {Object} obj.rack - об'єкт з полями flooors, rows, width, height, topSpans
 * @param {number} obj.index - індекс рядка
 * @returns {string} HTML рядок для рядка таблиці результатів
 */
export const batteryTableRowTemplate = ({ rack, index }) => {
  const rackTypeLeftSide = `L${rack.floors}A${rack.rows}-`;
  const rackTypeRightSide = `/${rack.width}${rack.floors > 1 ? `(${rack.height})` : ""}`;
  const amount = Math.min(rack.topSpans?.length ?? 0, 10);

  return (rack.topSpans ?? [])
    .slice(0, amount)
    .map((span, spanIndex) => {
      const spansLength = span.combination.reduce((acc, cur) => acc + cur, 0);
      const rackType = `${rackTypeLeftSide}${spansLength}${rackTypeRightSide}`;

      // Для першого span додаємо index, length та rackType
      const rowNumber =
        spanIndex === 0
          ? `
        <td rowspan="${amount}">${index + 1}</td>
        <td rowspan="${amount}">${rack.length}</td>
        `
          : "";

      return `
      <tr>
        ${rowNumber}
        <td>${rackType}</td>
        <td>${span.combination.join(" + ")} [${span.beams} ${beamWord(span.beams)}]</td>
      </tr>`;
    })
    .join("");
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
