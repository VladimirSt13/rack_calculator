// js/pages/battery/ui/renderBatteryTable.js

import {
  batteryTableHeaderTemplate,
  batteryTableRowTemplate,
  emptyBatteryTableTemplate,
} from "./templates/batteryTableTemplate.js";

/**
 * Ініціалізація таблиці результатів
 * @param {HTMLElement} table - Таблиця результатів
 *
 * Функція ініціаліза таблицю результатів, додаючи заголовок
 * за допомогою batteryTableHeaderTemplate та порожній рядок за допомогою
 * emptyBatteryTableTemplate
 */
export const initBatteryTable = (table) => {
  if (!table) return;
  const headers = ["№", "Розах. довжина", "Тип", "Варіанти прольотів"];
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  if (thead) thead.innerHTML = batteryTableHeaderTemplate(headers);
  if (tbody) tbody.innerHTML = emptyBatteryTableTemplate(headers.length);
};

/**
 * Рендер таблиці результатів
 * @param {HTMLElement} table - Таблиця результатів
 * @param {Array<Object>} results - Масив результатів
 *
 * Функція рендерить таблицю результатів, додаючи заголовок
 * за допомогою batteryTableHeaderTemplate та порожній рядок за допомогою
 * emptyBatteryTableTemplate
 */

export const renderBatteryTable = ({ tableRef, results = [] }) => {
  if (!tableRef) return;
  const tbody = tableRef.querySelector("tbody");
  if (!tbody) return;
  const resultsTable =
    results.length > 0
      ? results.map((rack, index) => batteryTableRowTemplate({ rack, index })).join("")
      : emptyBatteryTableTemplate(tbody.closest("table").querySelectorAll("th").length);
  tbody.innerHTML = resultsTable;
};
