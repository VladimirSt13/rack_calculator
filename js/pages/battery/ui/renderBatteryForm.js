// js/pages/battery/ui/renderBatteryForm.js

import { getBatteryRefs } from "./dom.js";

/**
 * Оновлення значень полів форми
 * @param {Object} formValues
 * @returns {void}
 */
export const renderBatteryForm = (formValues) => {
  const battRefs = getBatteryRefs();
  Object.entries(formValues).forEach(([key, value]) => {
    if (battRefs[key]) {
      battRefs[key].value = value;
    }
  });
};
