"js/pages/racks/ui/forminit.js";

import { clearBeamsUI } from "./beams.js";
import { racksCalcRefs } from "../../page.js";

/**
 * Скидання форми racks до початкового стану
 * @returns {void}
 */
export const resetRackForm = ({ selectors, getRefs }) => {
  // Очищаємо UI для балок
  const refs = getRefs();
  clearBeamsUI(refs);

  // Оновлюємо значення input/select відповідно до state через селектори
  racksCalcRefs.rackForm.querySelectorAll("input, select").forEach((el) => {
    const key = el.id;

    switch (key) {
      case "floors":
        el.value = selectors.getFloors() ?? "";
        break;

      case "rows":
        el.value = selectors.getRows() ?? "";
        break;

      case "beamsPerRow":
        el.value = selectors.getBeamsPerRow() ?? "";
        break;

      case "verticalSupports":
        el.value = selectors.getVerticalSupports() ?? "";
        break;

      case "supports":
        el.value = selectors.getSupports() ?? "";
        break;
    }
  });

  // Блокування вертикальних стійок, якщо поверхів менше 2
  refs.verticalSupports.disabled = selectors.getFloors() < 2;
};
