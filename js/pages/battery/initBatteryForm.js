import { getBatteryRefs } from "./ui/dom.js";
import { validateBatteryForm } from "./validateBatteryForm.js";
import { renderErrors } from "./ui/formErrors.js";
import { generateRackVariants } from "./core/rackBuilder.js";
import { debounce } from "../../utils/debounce.js";

export const initBatteryForm = ({ addListener, batteryActions, batterySelectors }) => {
  // Скидання кнопки та форми
  const refs = getBatteryRefs();
  refs.batteryCalculateBtn.disabled = false;
  refs.batteryForm.reset();

  const initialValues = batterySelectors.getFormValues();
  Object.entries(initialValues).forEach(([key, value]) => {
    const refKey = `battery${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    if (refs[refKey]) {
      refs[refKey].value = value ?? 0;
    }
  });

  addListener(
    refs.batteryForm,
    "input",
    debounce(() => {
      batteryActions.clearResults();
    }, 200),
  );

  // Підключаємо submit
  addListener(refs.batteryForm, "submit", (e) => {
    e.preventDefault();

    const { valid, errors, values } = validateBatteryForm();
    renderErrors(errors);

    if (!valid) {
      return;
    }

    // Форма валідна — можна робити подальший розрахунок
    batteryActions.updateFields(values);

    const element = {
      width: values.width,
      length: values.length,
      height: values.height,
      weight: values.weight,
    };

    const results = generateRackVariants({
      element,
      totalCount: values.count,
      gap: values.gap,
    });

    batteryActions.addResults(results);
  });
};
