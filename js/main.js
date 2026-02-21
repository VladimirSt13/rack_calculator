// js/main.js
import { initViewSwitcher } from "./app/ui/viewSwitcher.js";
import { registerAllPages } from "./app/pages/index.js";
import { APP_CONFIG, SELECTORS } from "./app/config/app.config.js";

document.addEventListener("DOMContentLoaded", async () => {
  // --- централізована реєстрація сторінок ---
  await registerAllPages();

  // --- ініціалізація viewSwitcher після реєстрації сторінок ---
  initViewSwitcher(SELECTORS.NAV, APP_CONFIG.DEFAULT_PAGE);
});
