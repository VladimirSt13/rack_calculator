// js/pages/index.js
import { batteryPage } from "./battery/page.js";
import { rackPage } from "./racks/page.js";
import { registerPage } from "../ui/router.js";

const pages = [batteryPage, rackPage];

export const registerAllPages = () => {
  pages.forEach((page) => registerPage(page));
};
