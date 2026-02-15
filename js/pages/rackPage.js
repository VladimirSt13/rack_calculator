// js/pages/rackPage.js
import { createPageModule } from "../ui/createPageModule.js";
import { initialRackState } from "./racks/state/rackState.js";
import { createRackActions } from "./racks/state/rackActions.js";
import { createRackSelectors } from "./racks/state/rackSelectors.js";
import { resetRackForm } from "./racks/ui/forminit.js";
import { initFormEvents } from "./racks/events/formEvents.js";
import { loadPrice } from "./racks/state/priceState.js";
import { populateDropdowns } from "./racks/ui/dropdowns.js";
import { render } from "./racks/render.js";
import { createState } from "../state/createState.js";

let componentsPrice = null;

// Створюємо state, селектори та actions прямо на сторінці
const rackState = createState({ ...initialRackState });
let unsubscribe = null;
export const rackSelectors = createRackSelectors(rackState);
export const rackActions = createRackActions(rackState, initialRackState);

export const rackPage = createPageModule({
  id: "rack",

  init: async () => {
    if (!componentsPrice) {
      componentsPrice = await loadPrice();
    }
    unsubscribe = rackState.subscribe(() => render(rackSelectors));
  },

  activate: (addListener) => {
    // Скидаємо state і форму
    rackState.reset();
    resetRackForm(rackSelectors);

    // Ініціалізація подій форми
    initFormEvents({ price: componentsPrice, addListener, rackActions });

    // Наповнення dropdown-ів, якщо ціни завантажені
    if (componentsPrice) {
      populateDropdowns(Object.keys(componentsPrice.vertical_supports), Object.keys(componentsPrice.supports));
    }

    // Підписка на зміни state для рендера
    rackState.subscribe(() => render(rackSelectors));
  },

  deactivate: () => {
    // resetForm і видалення лісенерів обробляються в createPageModule
    unsubscribe?.();
  },
});
