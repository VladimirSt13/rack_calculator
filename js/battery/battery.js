import { registerPageModule } from "../ui/pageManager.js";
import { initBatteryForm } from "./initBatteryForm.js";
import { removeAllListeners } from "../ui/eventManager.js";
// import { createLiveStatePanel } from "../ui/liveStatePanel.js";
// import { batteryState } from "./state/batteryState.js";

// export let batteryStateLivePanel;

const init = () => {};
const activate = () => {
  initBatteryForm();
  // if (!batteryStateLivePanel) batteryStateLivePanel = createLiveStatePanel({ title: "Battery State" });
  // batteryStateLivePanel.render(batteryState);
};

const deactivate = () => {
  removeAllListeners();
  // batteryStateLivePanel.destroy();
};

registerPageModule({ id: "battery", init, activate, deactivate });
