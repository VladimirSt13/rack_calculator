// js/pages/battery.js
import { createEventManager } from "../ui/eventManager.js";
import { initBatteryForm } from "./battery/initBatteryForm.js";
import { resetBatteryState } from "./battery/actions/batteryFormAction.js";

const { addListener, removeAllListeners } = createEventManager();

export const batteryPage = {
  id: "battery",
  init: () => {
    console.log("Battery page initialized");
  },
  activate: () => {
    console.log("Battery page activated");
    initBatteryForm({ addListener });
    resetBatteryState();
  },
  deactivate: () => {
    console.log("Battery page deactivated");
    removeAllListeners(); // очищаємо всі обробники
  },
  onStateChange: (state) => {
    console.log("Battery state updated:", state);
  },
};
