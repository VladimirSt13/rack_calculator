// js/app/pages/batteryPage.js

import { createPageModule } from "../../ui/createPageModule.js";
import { initialBatteryState } from "./state/batteryState.js";
import { createState } from "../../state/createState.js";
import { initBatteryForm } from "./initBatteryForm.js";
import { createBatteryActions } from "./state/batteryAction.js";
import { createBatterySelectors } from "./state/batterySelectors.js";
import { render } from "./render.js";
import { PAGES } from "../../config/app.config.js";

const batteryState = createState({ ...initialBatteryState });
let unsubscribe = null;
export const batterySelectors = createBatterySelectors(batteryState);
export const batteryActions = createBatteryActions(batteryState, initialBatteryState);

export const batteryPage = createPageModule({
  id: PAGES.BATTERY,

  init: () => {},

  activate: (addListener) => {
    // Підписка на зміни state для рендера таблиці
    unsubscribe = batteryState.subscribe(() => render(batterySelectors));
    // Скидання state і форми
    batteryActions.reset();

    // Ініціалізація подій форми
    initBatteryForm({ addListener, batteryActions, batterySelectors });
  },

  deactivate: () => {
    // Видаляємо всі лісенери
    unsubscribe?.();
  },
});
