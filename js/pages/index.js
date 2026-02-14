// js/pages/index.js
import { batteryPage } from "./battery.js";
import { rackPage } from "./racks.js";
import { registerPage } from "../ui/router.js";

const pages = [batteryPage, rackPage];

export const registerAllPages = () => {
  pages.forEach((page) => registerPage(page));
};
