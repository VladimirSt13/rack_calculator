import { rackState, resetRackState } from "../state/rackState.js";
import { refs } from "./dom.js";

export const resetForm = () => {
  resetRackState();
  // Очистка форми
  refs.rackForm.querySelectorAll("input").forEach((input) => {
    const key = input.id;
    if (key in rackState) rackState[key] = input.value = rackState[key] ?? null;
  });
  refs.rackForm.querySelectorAll("select").forEach((select) => {
    const key = select.id;
    if (key in rackState) rackState[key] = select.value = rackState[key] ?? "";
  });

  // Якщо поверхів менше 2, блокувати поле вибору вертикальних стійок
  refs.verticalSupport.disabled = true;
};
