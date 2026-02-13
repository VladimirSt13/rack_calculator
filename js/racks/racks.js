// racks.js
import { initFormEvents } from "./events/formEvents.js";
import { loadPrice } from "./state/priceState.js";
import { populateDropdowns } from "./ui/dropdowns.js";
import { resetForm } from "./ui/forminit.js";

let componentsPrice = null;

export const initRackPage = async () => {
  if (!componentsPrice) {
    componentsPrice = await loadPrice();
  }

  resetForm();
  populateDropdowns(Object.keys(componentsPrice.vertical_supports), Object.keys(componentsPrice.supports));

  initFormEvents(componentsPrice);
};
