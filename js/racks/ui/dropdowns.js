import { getRacksRefs } from "./dom.js";
import { generateDropdownOptionsHTML } from "./templates/dropdown.js";

// --- Заповнення селектів ---
export const populateDropdowns = (verticalSupports, supports) => {
  const refs = getRacksRefs();

  refs.verticalSupports.innerHTML = generateDropdownOptionsHTML(verticalSupports);
  refs.supports.innerHTML = generateDropdownOptionsHTML(supports);
};
