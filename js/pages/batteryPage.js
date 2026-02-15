// js/pages/batteryPage.js

import { createPageModule } from "../ui/createPageModule.js";
import { initialBatteryState } from "./battery/state/batteryState.js";
import { createState } from "../state/createState.js";
import { initBatteryForm } from "./battery/initBatteryForm.js";
import { createBatteryActions } from "./battery/state/batteryAction.js";
import { createBatterySelectors } from "./battery/state/batterySelectors.js";
import { render } from "./battery/render.js";

const batteryState = createState({ ...initialBatteryState });
let unsubscribe = null;
export const batterySelectors = createBatterySelectors(batteryState);
export const batteryActions = createBatteryActions(batteryState, initialBatteryState);

export const batteryPage = createPageModule({
  id: "battery",

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
