// @ts-check
// js/app/ui/modal/useModal.js

import { modalService } from './modalService.js';
import { log } from '../../config/env.js';

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
 * @typedef {Object} UseModalConfig
 * @property {string} id - Унікальний ID модалки
 * @property {string} [title] - Заголовок
 * @property {string} [description] - Підзаголовок
 * @property {string} content - HTML контент
 * @property {Array<ModalButton>} [buttons] - Кнопки футера
 * @property {() => void} [onOpen] - Callback при відкритті
 * @property {() => void} [onClose] - Callback при закритті
 * @property {boolean} [closeOnBackdrop=true] - Закриття по кліку на backdrop
 * @property {boolean} [closeOnEsc=true] - Закриття по ESC
 */

/**
 * @typedef {Object} UseModalReturn
 * @property {(config: UseModalConfig) => void} openModal - Відкрити модалку
 * @property {(id?: string) => void} closeModal - Закрити модалку
 * @property {() => boolean} isOpen - Чи відкрита модалка
 */

/**
 * Універсальний хук для управління модалками
 * @returns {UseModalReturn}
 */
export const useModal = () => {
  /**
   * Відкрити модалку
   * @param {UseModalConfig} config
   */
  const openModal = (config) => {
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

    log('[useModal] Opening modal:', id);

    modalService.open({
      id,
      title,
      description,
      content,
      buttons: buttons.map((btn) => ({
        ...btn,
        closeOnConfirm: btn.closeOnConfirm !== false,
      })),
      onOpen: () => {
        log('[useModal] Modal opened:', id);
        onOpen?.();
      },
      onClose: () => {
        log('[useModal] Modal closed:', id);
        onClose?.();
      },
      closeOnBackdrop,
      closeOnEsc,
    });
  };

  /**
   * Закрити модалку
   * @param {string} [id] - ID модалки (якщо не вказано - закриваємо активну)
   */
  const closeModal = (id) => {
    log('[useModal] Closing modal:', id || 'active');
    modalService.close(id);
  };

  /**
   * Чи відкрита модалка
   * @returns {boolean}
   */
  const isOpen = () => modalService.hasOpen();

  return {
    openModal,
    closeModal,
    isOpen,
  };
};

export default useModal;
