// js/pages/rackPage.js
import { createPageModule } from "../ui/createPageModule.js";
import { initialRackState } from "./racks/calculator/state/rackState.js";
import { createRackActions } from "./racks/calculator/state/rackActions.js";
import { createRackSelectors } from "./racks/calculator/state/rackSelectors.js";
import { resetRackForm } from "./racks/calculator/ui/forminit.js";
import { initFormEvents } from "./racks/calculator/events/formEvents.js";
import { loadPrice } from "./racks/calculator/state/priceState.js";
import { populateDropdowns } from "./racks/calculator/ui/dropdowns.js";
import { render } from "./racks/render.js";
import { createState } from "../state/createState.js";
import { PAGES } from "../config/app.config.js";
import { initialRackSetState } from "./racks/set/state/rackSetState.js";
import { createRackSetActions } from "./racks/set/state/rackSetActions.js";
import { createRackSetSelectors } from "./racks/set/state/rackSetSelectors.js";

import { initRackSetControls } from "./racks/set/events/initRackSetControls.js";
import { renderRackSet } from "./racks/set/ui/renderRackSet.js";

let componentsPrice = null;

// Створюємо state, селектори та actions прямо на сторінці
const rackState = createState({ ...initialRackState });
let unsubscribeRackCalc = null;
export const rackSelectors = createRackSelectors(rackState);
export const rackActions = createRackActions(rackState, initialRackState);

const rackSetState = createState(initialRackSetState);
let unsubscribeRackSet = null;
export const rackSetSelectors = createRackSetSelectors(rackSetState);
export const rackSetActions = createRackSetActions(rackSetState, initialRackSetState);

export const rackPage = createPageModule({
  id: PAGES.RACK,

  init: async () => {
    if (!componentsPrice) {
      componentsPrice = await loadPrice();
    }
  },

  activate: (addListener) => {
    // Скидаємо state і форму
    rackState.reset();
    rackSetState.reset();
    resetRackForm(rackSelectors);

    // Ініціалізація подій форми
    initFormEvents({ price: componentsPrice, addListener, rackActions });
    renderRackSet();
    initRackSetControls();

    // Наповнення dropdown-ів, якщо ціни завантажені
    if (componentsPrice) {
      populateDropdowns(Object.keys(componentsPrice.vertical_supports), Object.keys(componentsPrice.supports));
    }

    // Підписка на зміни state для рендера
    rackState.subscribe(() => render(rackSelectors));
    rackSetState.subscribe(() => renderRackSet(rackSetSelectors));
  },

  deactivate: () => {
    // resetForm і видалення лісенерів обробляються в createPageModule
    unsubscribeRackCalc?.();
    unsubscribeRackSet?.();
  },
});
