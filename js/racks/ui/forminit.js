import { rackState, resetRackState } from "../state/rackState.js";
import { clearBeamsUI } from "./beams.js";
import { getRacksRefs } from "./dom.js";

export const resetRackForm = () => {
  const refs = getRacksRefs();
  resetRackState();
  clearBeamsUI();

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
