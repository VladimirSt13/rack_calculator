// js/main.js
import { initViewSwitcher } from "./ui/viewSwitcher.js";
import { registerAllPages } from "./pages/index.js";

document.addEventListener("DOMContentLoaded", async () => {
  // --- централізована реєстрація сторінок ---
  await registerAllPages();

  // --- ініціалізація viewSwitcher після реєстрації сторінок ---
  initViewSwitcher("header nav", "battery");
});
