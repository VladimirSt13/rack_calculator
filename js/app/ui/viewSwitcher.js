// js/ui/viewSwitcher.js
import { navigate, getRegisteredPages } from "./router.js";

/**
 * Ініціалізація автоматичної навігації між сторінками
 * @param {string} containerSelector - селектор для контейнера кнопок
 * @param {string} defaultPage - сторінка за замовчуванням
 * @returns {void}
 */
export const initViewSwitcher = (containerSelector = "header nav", defaultPage = "battery") => {
  const container = document.querySelector(containerSelector);

  if (!container) return console.warn(`Container ${containerSelector} not found`);

  const pageIds = getRegisteredPages();
  if (!pageIds.length) return;

  // очищаємо контейнер і генеруємо кнопки
  container.innerHTML = "";
  pageIds.forEach((id) => {
    const btn = document.createElement("button");
    btn.classList.add("nav-btn");
    btn.dataset.view = id;
    btn.textContent = id;
    container.appendChild(btn);

    btn.addEventListener("click", async () => {
      await navigate(id);

      // активна кнопка
      container.querySelectorAll("button").forEach((b) => {
        b.classList.remove("active");
        b.disabled = false;
      });
      btn.classList.add("active");
      btn.disabled = true;
    });
  });

  // навігація на дефолтну сторінку
  const initDefaultPage = async () => {
    await navigate(defaultPage);
    const defaultBtn = container.querySelector(`button[data-view="${defaultPage}"]`);
    if (defaultBtn) {
      defaultBtn.classList.add("active");
      defaultBtn.disabled = true;
    }
  };

  initDefaultPage();
};
