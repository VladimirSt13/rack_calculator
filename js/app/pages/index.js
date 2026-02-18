// js/pages/index.js
import { batteryPage } from "./batteryPage.js";
import { rackPage } from "./racks/page.js";
import { registerPage } from "../ui/router.js";

const pages = [batteryPage, rackPage];

export const registerAllPages = () => {
    pages.forEach((page) => registerPage(page));
};
