// racks.js
import { removeAllListeners } from "../ui/eventManager.js";
import { registerPageModule } from "../ui/pageManager.js";
import { initFormEvents } from "./events/formEvents.js";
import { loadPrice } from "./state/priceState.js";
import { resetRackState } from "./state/rackState.js";
import { populateDropdowns } from "./ui/dropdowns.js";
import { resetRackForm } from "./ui/forminit.js";

let componentsPrice = null;

const init = () => {};

const activate = async () => {
  if (!componentsPrice) componentsPrice = await loadPrice();
  initFormEvents(componentsPrice);
  resetRackForm();
  resetRackState();
  if (componentsPrice)
    populateDropdowns(Object.keys(componentsPrice.vertical_supports), Object.keys(componentsPrice.supports));
};

const deactivate = () => {
  resetRackState();
  resetRackForm();
  removeAllListeners();
};

registerPageModule({ id: "rack", init, activate, deactivate });
