// js/app/ui/initIcons.js

import { iconChevronRight, iconDownload, iconFile, iconGrid, iconPlus, iconX } from './icons/index.js';

/**
 * @typedef {Object} IconConfig
 * @property {string} selector - CSS селектор для елемента
 * @property {Function} iconFn - функція іконки
 * @property {Object} [props] - властивості для іконки
 */

/**
 * Ініціалізує іконки в HTML елементах через data-атрибути
 * @param {IconConfig[]} iconConfigs
 */
export const initIcons = (iconConfigs = []) => {
  iconConfigs.forEach(({ selector, iconFn, props = {} }) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el) {
        el.innerHTML = iconFn(props);
      }
    });
  });
};

/**
 * Ініціалізує всі іконки на сторінці
 */
export const initAllIcons = () => {
  // Іконка "Додати проліт" (кнопка)
  const addSpanBtn = document.querySelector('[data-js="rack-addSpan"][data-icon="plus"]');
  if (addSpanBtn) {
    addSpanBtn.innerHTML = iconPlus({ size: 16 });
  }

  // Іконка "Додати до комплекту" (кнопка з span)
  const addToSetSpan = document.querySelector('[data-js="rack-addToSetBtn"] span[data-icon="plus"]');
  if (addToSetSpan) {
    addToSetSpan.innerHTML = iconPlus({ size: 16 });
  }

  // Іконка "Комплект стелажів" (card icon)
  const setCardIcon = document.querySelector('[data-js="rack-setCard"] .card__icon[data-icon="file"]');
  if (setCardIcon) {
    setCardIcon.innerHTML = iconFile({ size: 20 });
  }

  // Іконка "Стелаж" (result card)
  const resultsCardIcon = document.querySelector('[data-js="rack-resultsCard"] .card__icon[data-icon="grid"]');
  if (resultsCardIcon) {
    resultsCardIcon.innerHTML = iconGrid({ size: 20 });
  }

  // Іконка "Переглянути комплект" (кнопка з span)
  const viewSetSpan = document.querySelector('[data-js="rack-openSetModalBtn"] span[data-icon="chevron-right"]');
  if (viewSetSpan) {
    viewSetSpan.innerHTML = iconChevronRight({ size: 16 });
  }

  // Іконка "Закрити модалку" (кнопка)
  const modalCloseBtns = document.querySelectorAll('[data-js="modal-close"][data-icon="x"]');
  modalCloseBtns.forEach((el) => {
    el.innerHTML = iconX({ size: 20 });
  });

  // Іконка "Експортувати" (кнопка з span)
  const exportSpan = document.querySelector('[data-js="modal-export"] span[data-icon="download"]');
  if (exportSpan) {
    exportSpan.innerHTML = iconDownload({ size: 16 });
  }
};

export default initAllIcons;
