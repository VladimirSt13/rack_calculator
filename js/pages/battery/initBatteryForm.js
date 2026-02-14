import { battRefs } from "./ui/dom.js";
import { validateBatteryForm } from "./validateBatteryForm.js";
import { renderErrors } from "./ui/formInit.js";

import { updateBatteryState } from "./actions/batteryFormAction.js";

export const initBatteryForm = ({ addListener }) => {
  // Скидання кнопки та форми
  battRefs.batteryCalculateBtn.disabled = false;
  battRefs.batteryForm.reset();

  // Підключаємо submit
  addListener(battRefs.batteryForm, "submit", (e) => {
    e.preventDefault();

    const { valid, errors, values } = validateBatteryForm();
    renderErrors(errors);

    if (!valid) {
      return;
    }

    // Форма валідна — можна робити подальший розрахунок
    updateBatteryState(values);
  });
};
