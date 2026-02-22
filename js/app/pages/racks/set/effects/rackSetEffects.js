// js/app/pages/racks/set/effects/rackSetEffects.js

import { query, setHTML, setState, toggleClass } from '../../../../effects/dom.js';
import { SELECTORS } from '../../../../config/app.config.js';

/**
 * Lazy selectors for rack set DOM elements
 * @returns {Record<string, () => HTMLElement | null>}
 */
export const getRackSetSelectors = () => ({
  // Page elements
  rackSetTable: () => document.querySelector(SELECTORS.rack.setTable),
  rackSetSummary: () => document.querySelector(SELECTORS.rack.setSummary),
  openModalBtn: () => document.querySelector(SELECTORS.rack.openSetModalBtn),

  // Modal elements
  modalRoot: () => document.querySelector(SELECTORS.modal.rackSet.root),
  modalTable: () => document.querySelector(SELECTORS.modal.rackSet.table),
  modalSummary: () => document.querySelector(SELECTORS.modal.rackSet.summary),
  modalCloseBtn: () => document.querySelector(SELECTORS.modal.rackSet.close),
  modalExportBtn: () => document.querySelector(SELECTORS.modal.rackSet.export),
});

/**
 * Lazy effect: update rack set table on page
 * @param {string} html
 * @returns {() => boolean}
 */
export const updatePageTable = (html) => {
  const selector = getRackSetSelectors().rackSetTable;
  return () => {
    const el = selector();
    return el ? setHTML(el, html)() : false;
  };
};

/**
 * Lazy effect: update rack set summary on page
 * @param {string} html
 * @returns {() => boolean}
 */
export const updatePageSummary = (html) => {
  const selector = getRackSetSelectors().rackSetSummary;
  return () => {
    const el = selector();
    return el ? setHTML(el, html)() : false;
  };
};

/**
 * Lazy effect: update modal content
 * @param {string} html
 * @returns {() => boolean}
 */
export const updateModalContent = (html) => {
  const selector = getRackSetSelectors().modalRoot;
  return () => {
    const el = selector();
    if (!el) {
      return false;
    }
    const body = el.querySelector('.modal__body');
    const footer = el.querySelector('.modal__footer');
    if (body && footer) {
      // Split content into body/footer
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newBody = doc.querySelector('[data-js="modal-body"]');
      const newFooter = doc.querySelector('.modal__footer');
      if (newBody) {
        body.innerHTML = newBody.innerHTML;
      }
      if (newFooter) {
        footer.innerHTML = newFooter.innerHTML;
      }
      return true;
    }
    return false;
  };
};

/**
 * Lazy effect: toggle modal visibility
 * @param {boolean} open
 * @returns {() => boolean}
 */
export const toggleModal = (open) => () => {
  const modal = getRackSetSelectors().modalRoot();
  if (!modal) {
    return false;
  }

  if (open) {
    modal.showModal?.(); // native <dialog>
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  } else {
    modal.close?.();
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  return true;
};

/**
 * Lazy effect: update button disabled state
 * @param {HTMLElement | (() => HTMLElement|null)} btnRef
 * @param {boolean} disabled
 * @returns {() => boolean}
 */
export const setButtonDisabled = (btnRef, disabled) => () => {
  const el = typeof btnRef === 'function' ? btnRef() : btnRef;
  if (!el) {
    return false;
  }
  el.disabled = disabled;
  el.setAttribute('aria-disabled', String(disabled));
  return true;
};

export default {
  getRackSetSelectors,
  updatePageTable,
  updatePageSummary,
  updateModalContent,
  toggleModal,
  setButtonDisabled,
};
