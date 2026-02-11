// main.js

import { initFormEvents } from "./events/formEvents.js";
import { loadPrice } from "./state/priceState.js";
import { populateDropdowns } from "./ui/dropdowns.js";
import { resetForm } from "./ui/forminit.js";
import { render } from "./ui/render.js";

(async () => {
  const componentsPrice = await loadPrice();
  resetForm();
  populateDropdowns(Object.keys(componentsPrice.vertical_supports), Object.keys(componentsPrice.supports));

  initFormEvents(componentsPrice);

  render();
})();
