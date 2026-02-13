import { activatePage } from "./pageManager.js";

export const initViewSwitcher = () => {
  const navButtons = document.querySelectorAll("header nav button");
  const views = document.querySelectorAll("main section");

  // --- Показуємо секцію з батареєю при першому завантаженні ---
  views.forEach((v) => (v.hidden = v.id !== "view-battery"));
  navButtons.forEach((btn) => {
    btn.classList.remove("active");
    btn.disabled = false;
  });

  const defaultPage = "battery";

  const defaultBtn = document.querySelector(`header nav button[data-view="${defaultPage}"]`);
  activatePage(defaultPage);
  defaultBtn.classList.add("active");
  defaultBtn.disabled = true;

  // --- Обробник перемикання ---
  navButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const viewToShow = btn.dataset.view;

      views.forEach((v) => (v.hidden = v.id !== "view-" + viewToShow));

      await activatePage(viewToShow);

      navButtons.forEach((b) => {
        b.classList.remove("active");
        b.disabled = false;
      });
      btn.classList.add("active");
      btn.disabled = true;
    });
  });
};
