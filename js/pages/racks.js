// js/pages/racks.js
import { createEventManager } from "../ui/eventManager.js";
import { initFormEvents } from "./racks/events/formEvents.js";
import { loadPrice } from "./racks/state/priceState.js";
import { rackActions } from "./racks/state/rackActions.js";
import { populateDropdowns } from "./racks/ui/dropdowns.js";
import { resetRackForm } from "./racks/ui/forminit.js";
import { rackState } from "./racks/state/rackState.js";
import { render } from "./racks/render.js";

let componentsPrice = null;
const { addListener, removeAllListeners } = createEventManager();

rackState.subscribe(render);

export const rackPage = {
  id: "rack",

  init: async () => {
    console.log("Rack page initialized");
    if (!componentsPrice) componentsPrice = await loadPrice();
  },

  activate: () => {
    console.log("Rack page activated");
    rackActions.reset();
    resetRackForm();
    initFormEvents({ price: componentsPrice, addListener });

    if (componentsPrice) {
      populateDropdowns(Object.keys(componentsPrice.vertical_supports), Object.keys(componentsPrice.supports));
    }
  },

  deactivate: () => {
    console.log("Rack page deactivated");
    resetRackForm();
    removeAllListeners(); // очищаємо всі обробники
  },

  onStateChange: (state) => {
    console.log("Rack state updated:", state);
  },
};
