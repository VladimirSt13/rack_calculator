import { rackState, resetRackState } from "../state/rackState.js";
import { refs } from "./dom.js";

export const resetForm = () => {
  resetRackState();

  refs.rackForm.querySelectorAll("input, select").forEach((el) => {
    const key = el.id;
    if (key in rackState) {
      // незалежно input чи select — присвоюємо value
      el.value = rackState[key] ?? "";
    }
  });

  // Блокування вертикальних стійок, якщо поверхів менше 2
  refs.verticalSupports.disabled = rackState.floors < 2;
};
