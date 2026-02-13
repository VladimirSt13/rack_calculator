// main.js

import { initViewSwitcher } from "./ui/viewSwitcher.js";
import "./racks/racks.js";
import "./battery/battery.js";

document.addEventListener("DOMContentLoaded", () => {
  initViewSwitcher();
});
