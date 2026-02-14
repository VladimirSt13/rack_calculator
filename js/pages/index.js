// js/pages/index.js
import { batteryPage } from "./battery.js";
import { rackPage } from "./rackPage.js";
import { registerPage } from "../ui/router.js";

const pages = [batteryPage, rackPage];

export const registerAllPages = () => {
  pages.forEach((page) => registerPage(page));
};
