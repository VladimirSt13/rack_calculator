import { initBatteryPage } from "../battery/battery.js";
import { initRackPage } from "../racks/racks.js";

export const initViewSwitcher = () => {
  const navButtons = document.querySelectorAll("header nav button");
  const views = document.querySelectorAll("main section");

  // --- Показуємо секцію з батареєю при першому завантаженні ---
  views.forEach((v) => (v.hidden = v.id !== "view-battery"));
  navButtons.forEach((btn) => {
    btn.classList.remove("active");
    btn.disabled = false;
  });

  const defaultBtn = document.querySelector('header nav button[data-view="battery"]');
  defaultBtn.classList.add("active");
  defaultBtn.disabled = true;

  // --- Обробник перемикання ---
  navButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const viewToShow = btn.dataset.view;

      // Показуємо потрібну секцію
      views.forEach((v) => (v.hidden = v.id !== "view-" + viewToShow));

      // Ініціалізація сторінки
      switch (viewToShow) {
        case "rack":
          await initRackPage();
          break;
        case "battery":
          initBatteryPage();
          break;
        default:
          console.warn(`Немає ініціалізації для секції: ${viewToShow}`);
      }

      // Підсвічування і дизейбл кнопок
      navButtons.forEach((b) => {
        b.classList.remove("active");
        b.disabled = false; // <--- тепер правильно
      });
      btn.classList.add("active");
      btn.disabled = true; // кнопка активної сторінки неактивна
    });
  });
};
