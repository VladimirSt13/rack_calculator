// js/app/ui/modal/createModal.js

import { iconX } from '../icons/icon-x.js';

/**
 * @typedef {'primary' | 'outline' | 'danger'} ButtonVariant
 */

/**
 * @typedef {Object} ModalButton
 * @property {string} text - Текст кнопки
 * @property {ButtonVariant} [variant='primary'] - Варіант стилю
 * @property {() => void | Promise<void>} [onClick] - Обробник кліку
 * @property {boolean} [closeOnConfirm=true] - Закрити модалку після кліку
 */

/**
 * @typedef {Object} ModalConfig
 * @property {string} id - Унікальний ID модалки
 * @property {string} [title] - Заголовок (опціонально)
 * @property {string} [description] - Підзаголовок (опціонально)
 * @property {string} content - HTML контент тіла модалки
 * @property {Array<ModalButton>} [buttons] - Кнопки футера
 * @property {() => void} [onOpen] - Callback при відкритті
 * @property {() => void} [onClose] - Callback при закритті
 * @property {boolean} [closeOnBackdrop=true] - Закриття по кліку на backdrop
 * @property {boolean} [closeOnEsc=true] - Закриття по ESC
 */

/**
 * @typedef {Object} ModalAPI
 * @property {() => void} open - Відкрити модалку
 * @property {() => void} close - Закрити модалку
 * @property {(content: string) => void} setContent - Оновити контент
 * @property {(title: string) => void} setTitle - Оновити заголовок
 * @property {(description: string) => void} setDescription - Оновити опис
 * @property {() => boolean} isOpen - Чи відкрита модалка
 * @property {() => void} destroy - Знищити модалку (видалити з DOM)
 */

/**
 * Створення універсальної модалки
 * @param {ModalConfig} config
 * @returns {ModalAPI}
 */
export const createModal = (config) => {
  const {
    id,
    title = '',
    description = '',
    content,
    buttons = [],
    onOpen,
    onClose,
    closeOnBackdrop = true,
    closeOnEsc = true,
  } = config;

  let modalElement = null;
  let isDestroyed = false;

  // ===== CREATE MODAL ELEMENT =====
  const createModalElement = () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'modal';
    dialog.dataset.modalId = id;
    dialog.setAttribute('aria-labelledby', `${id}-title`);
    if (description) {
      dialog.setAttribute('aria-describedby', `${id}-description`);
    }

    dialog.innerHTML = `
      <div class="modal__overlay"></div>
      <div class="modal__content">
        ${
          title || description
            ? `
        <div class="modal__header">
          <div>
            ${title ? `<h3 id="${id}-title" class="modal__title">${title}</h3>` : ''}
            ${description ? `<p id="${id}-description" class="modal__description">${description}</p>` : ''}
          </div>
          <button
            type="button"
            class="modal__close"
            data-modal-close
            aria-label="Закрити модальне вікно"
            data-icon="x"
          ></button>
        </div>
        `
            : ''
        }
        <div class="modal__body">
          ${content}
        </div>
        ${
          buttons.length > 0
            ? `
        <div class="modal__footer">
          ${buttons
            .map(
              (btn, index) => `
            <button
              type="button"
              class="btn btn--${btn.variant || 'primary'}"
              data-modal-btn="${index}"
              ${!btn.onClick && !btn.closeOnConfirm ? 'data-state="disabled"' : ''}
            >
              ${btn.text}
            </button>
          `,
            )
            .join('')}
        </div>
        `
            : ''
        }
      </div>
    `;

    return dialog;
  };

  // ===== EVENT HANDLERS =====
  const handleBackdropClick = (e) => {
    if (!closeOnBackdrop) {
      return;
    }
    if (e.target === modalElement || e.target.classList.contains('modal__overlay')) {
      api.close();
    }
  };

  const handleKeyDown = (e) => {
    if (!closeOnEsc) {
      return;
    }
    if (e.key === 'Escape' && api.isOpen()) {
      api.close();
    }
  };

  const handleButtonClose = () => {
    const closeBtn = modalElement?.querySelector('[data-modal-close]');
    if (closeBtn) {
      // Ініціалізація іконки X
      closeBtn.innerHTML = iconX({ size: 20 });
      closeBtn.addEventListener('click', api.close);
    }
  };

  const handleCustomButtons = () => {
    if (!modalElement) {
      return;
    }

    buttons.forEach((btn, index) => {
      const button = modalElement.querySelector(`[data-modal-btn="${index}"]`);
      if (!button) {
        return;
      }

      button.addEventListener('click', async () => {
        try {
          if (btn.onClick) {
            await btn.onClick();
          }
          // Закриваємо модалку, якщо closeOnConfirm не false
          if (btn.closeOnConfirm !== false) {
            api.close();
          }
        } catch (error) {
          console.error(`[Modal ${id}] Button onClick error:`, error);
        }
      });
    });
  };

  // ===== ATTACH EVENT{ LISTEN}ERS =====
  let eventListenersAttached = false;

  const attachEventListeners = () => {
    if (!modalElement || eventListenersAttached) {
      return;
    }

    modalElement.addEventListener('click', handleBackdropClick);
    document.addEventListener('keydown', handleKeyDown);

    // Додаємо слухачі на кнопки після того, як модалка в DOM
    setTimeout(() => {
      handleButtonClose();
      handleCustomButtons();
    }, 0);

    eventListenersAttached = true;
    console.log('[createModal] Event listeners attached for modal:', id);
  };

  const detachEventListeners = () => {
    if (!modalElement) {
      return;
    }

    modalElement.removeEventListener('click', handleBackdropClick);
    document.removeEventListener('keydown', handleKeyDown);
    eventListenersAttached = false;
  };

  // ===== MODAL API =====
  const api = {
    open: () => {
      if (isDestroyed) {
        console.warn(`[Modal ${id}] Cannot open - modal is destroyed`);
        return;
      }

      if (!modalElement) {
        modalElement = createModalElement();
        document.body.appendChild(modalElement);
      }

      // Додаємо слухачі при кожному відкритті (якщо ще не додані)
      attachEventListeners();

      modalElement.showModal();
      modalElement.dataset.state = 'open';
      onOpen?.();
    },

    close: () => {
      if (!modalElement || !api.isOpen()) {
        return;
      }

      modalElement.close();
      modalElement.dataset.state = 'closed';

      // Скидаємо прапорець слухачів
      eventListenersAttached = false;

      // Видаляємо модалку з DOM після закриття
      setTimeout(() => {
        if (modalElement && modalElement.parentNode) {
          modalElement.remove();
        }
        modalElement = null;
        detachEventListeners();
      }, 100);

      onClose?.();
    },

    setContent: (newContent) => {
      if (!modalElement) {
        return;
      }
      const body = modalElement.querySelector('.modal__body');
      if (body) {
        body.innerHTML = newContent;
      }
    },

    setTitle: (newTitle) => {
      if (!modalElement) {
        return;
      }
      const titleEl = modalElement.querySelector('.modal__title');
      if (titleEl) {
        titleEl.textContent = newTitle;
      }
    },

    setDescription: (newDescription) => {
      if (!modalElement) {
        return;
      }
      const descEl = modalElement.querySelector('.modal__description');
      if (descEl) {
        descEl.textContent = newDescription;
      }
    },

    isOpen: () => modalElement?.open === true,

    destroy: () => {
      if (isDestroyed) {
        return;
      }

      api.close();
      detachEventListeners();

      if (modalElement && modalElement.parentNode) {
        modalElement.remove();
      }

      modalElement = null;
      isDestroyed = true;
    },
  };

  return api;
};

export default createModal;
