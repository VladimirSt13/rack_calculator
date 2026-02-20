// js/app/pages/racks/set/ui/rackSetModal.js

import { renderRackSet } from "./renderRackSet.js";

/**
 * Ініціалізує модальне вікно комплекту
 * @param {Object} rackSetCtx - Контекст rackSet з state та actions
 */
export const initRackSetModal = (rackSetCtx) => {
  const { state, actions, selectors } = rackSetCtx;

  const modal = document.getElementById("rackSetModal");
  const content = modal?.querySelector(".modal__content");
  const openBtn = document.getElementById("openRackSetModal");
  const closeBtn = document.getElementById("closeModal");

  if (!modal || !content || !openBtn || !closeBtn) return;

  let lastFocusedElement = null;

  /** Отримати фокусовані елементи в модалці */
  const getFocusableElements = () =>
    content.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );

  /** Trap focus для accessibility */
  const trapFocus = (e) => {
    if (e.key !== "Tab") return;

    const focusable = getFocusableElements();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /** Анімація відкриття/закриття + Рендер контенту */
  const render = (s) => {
    if (s.isModalOpen) {
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lastFocusedElement = document.activeElement;

      // 🔥 Рендеримо таблицю комплекту всередині модалки
      const tableContainer = modal.querySelector("#modalRackSetTable");
      const summaryContainer = modal.querySelector("#modalRackSetSummary");

      if (tableContainer && summaryContainer) {
        renderRackSet({
          actions,
          selectors,
          refs: {
            rackSetTable: tableContainer,
            rackSetSummary: summaryContainer,
          },
          // Заглушка для редагування (реалізуємо на наступному кроці)
          onEditRack: null,
          mode: "modal",
        });
      }

      // трохи затримки, щоб DOM оновився перед фокусом
      setTimeout(() => {
        const focusable = getFocusableElements();
        focusable[0]?.focus();
      }, 50);

      document.addEventListener("keydown", trapFocus);
    } else {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";

      document.removeEventListener("keydown", trapFocus);

      // Очищаем контент при закрытии (опционально, чтобы сбросить события)
      const tableContainer = modal.querySelector("#modalRackSetTable");
      const summaryContainer = modal.querySelector("#modalRackSetSummary");
      if (tableContainer) tableContainer.innerHTML = "";
      if (summaryContainer) summaryContainer.innerHTML = "";

      lastFocusedElement?.focus();
    }
  };

  /** Підписка на state */
  state.subscribe(render);

  /** Події кнопок */
  openBtn.addEventListener("click", () => actions.openModal());
  closeBtn.addEventListener("click", () => actions.closeModal());

  /** Клік на бекдроп */
  modal.addEventListener("click", (e) => {
    if (e.target === modal) actions.closeModal();
  });

  /** ESC */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") actions.closeModal();
  });
};
