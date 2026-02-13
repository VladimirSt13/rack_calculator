import { registerPageModule } from "../ui/pageManager.js";
import { initBatteryForm } from "./initBatteryForm.js";
import { removeAllListeners } from "../ui/eventManager.js";
import { resetBatteryState } from "./actions/batteryFormAction.js";

const init = () => {};
const activate = () => {
  initBatteryForm();
  resetBatteryState();
};

const deactivate = () => {
  removeAllListeners();
};

registerPageModule({ id: "battery", init, activate, deactivate });
