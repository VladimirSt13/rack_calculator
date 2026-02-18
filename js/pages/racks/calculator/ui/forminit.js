"js/pages/racks/ui/forminit.js";

import { clearBeamsUI } from "./beams.js";
import { getRacksRefs } from "./dom.js";

/**
 * Скидання форми racks до початкового стану
 * @returns {void}
 */
export const resetRackForm = (rackSelectors) => {
  const refs = getRacksRefs();

  // Очищаємо UI для балок
  clearBeamsUI();

  // Оновлюємо значення input/select відповідно до state через селектори
  refs.rackForm.querySelectorAll("input, select").forEach((el) => {
    const key = el.id;

    switch (key) {
      case "floors":
        el.value = rackSelectors.getFloors() ?? "";
        break;

      case "rows":
        el.value = rackSelectors.getRows() ?? "";
        break;

      case "beamsPerRow":
        el.value = rackSelectors.getBeamsPerRow() ?? "";
        break;

      case "verticalSupports":
        el.value = rackSelectors.getVerticalSupports() ?? "";
        break;

      case "supports":
        el.value = rackSelectors.getSupports() ?? "";
        break;
    }
  });

  // Блокування вертикальних стійок, якщо поверхів менше 2
  refs.verticalSupports.disabled = rackSelectors.getFloors() < 2;
};
