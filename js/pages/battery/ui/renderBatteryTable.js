// js/pages/battery/ui/renderBatteryTable.js

import { batteryTableRowTemplate, emptyBatteryTableTemplate } from "./templates/batteryTableTemplate.js";

/**
 * Рендер таблиці результатів
 * @param {HTMLElement} table
 * @param {Array} results
 * @returns {void}
 */
export const renderBatteryTable = (table, results) => {
  if (!table) return;

  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  const headers = [
    "№",
    "Поверхи",
    "Ряди",
    "Довжина стелажа, мм",
    "Ширина стелажа, мм",
    "Висота стелажа, мм",
    "Варіанти прольотів",
  ];

  thead.innerHTML = "<tr>" + headers.map((h) => `<th>${h}</th>`).join("") + "</tr>";

  if (!Array.isArray(results) || results.length === 0) {
    tbody.innerHTML = emptyBatteryTableTemplate(headers.length);
    return;
  }

  tbody.innerHTML = results.map((rack, index) => batteryTableRowTemplate(rack, index)).join("");
};
