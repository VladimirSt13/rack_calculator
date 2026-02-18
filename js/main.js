// js/main.js
import { initViewSwitcher } from "./ui/viewSwitcher.js";
import { registerAllPages } from "./pages/index.js";
import { APP_CONFIG, SELECTORS } from "./config/app.config.js";

document.addEventListener("DOMContentLoaded", async () => {
  // --- централізована реєстрація сторінок ---
  await registerAllPages();

  // --- ініціалізація viewSwitcher після реєстрації сторінок ---
  initViewSwitcher(SELECTORS.NAV, APP_CONFIG.DEFAULT_PAGE);
});
