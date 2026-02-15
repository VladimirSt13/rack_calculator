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
  const mainContent = document.getElementById("app");
  if (!container) return console.warn(`Container ${containerSelector} not found`);

  const pageIds = getRegisteredPages();
  if (!pageIds.length) return;

  // очищаємо контейнер і генеруємо кнопки
  container.innerHTML = "";
  pageIds.forEach((id) => {
    const btn = document.createElement("button");
    btn.dataset.view = id;
    btn.textContent = id;
    container.appendChild(btn);

    btn.addEventListener("click", async () => {
      await navigate(id);
      showPage(id);

      // активна кнопка
      container.querySelectorAll("button").forEach((b) => {
        b.classList.remove("active");
        b.disabled = false;
      });
      btn.classList.add("active");
      btn.disabled = true;
    });
  });

  // --- функція показу/приховування сторінки через hidden ---
  const showPage = (id) => {
    pageIds.forEach((pageId) => {
      const section = mainContent.querySelector(`#view-${pageId}`);
      if (section) {
        section.hidden = pageId !== id; // якщо не поточна сторінка — приховане
      }
    });
  };

  // навігація на дефолтну сторінку
  (async () => {
    await navigate(defaultPage);
    const defaultBtn = container.querySelector(`button[data-view="${defaultPage}"]`);
    if (defaultBtn) {
      defaultBtn.classList.add("active");
      defaultBtn.disabled = true;
    }
  })();
};
