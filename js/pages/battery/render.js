// js/pages/battery/render.js

import { getBatteryRefs } from "./ui/dom.js";
import { renderBatteryForm } from "./ui/renderBatteryForm.js";
import { renderBatteryTable } from "./ui/renderBatteryTable.js";

/**
 * Головний render сторінки battery
 * @param {Object} batterySelectors
 * @returns {void}
 */

let renderCount = 1;
export const render = (batterySelectors) => {
  renderCount++;
  console.log("🚀 ~ renderCount->", renderCount);
  const battRefs = getBatteryRefs();
  const formData = batterySelectors.getFormValues();

  renderBatteryForm(formData);

  const results = batterySelectors.getResults();

  renderBatteryTable(battRefs.batteryRackTable, results);
};
