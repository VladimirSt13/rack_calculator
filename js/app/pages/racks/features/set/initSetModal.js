// js/app/pages/racks/features/set/initSetModal.js

import { query } from '../../../../effects/dom.js';
import { RACK_SELECTORS, RACK_SET_MODAL_SELECTORS } from '../../../../config/selectors.js';
import { renderSetSummary, renderSetTable } from '../../effects/renderSetTable.js';
import { log } from '../../../../config/env.js';

/**
 * @typedef {Object} InitSetModalParams
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} setContext
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} resultsContext
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} formContext
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} spansContext
 * @property {Function} addListener
 */

/**
 * Ініціалізація модалки комплекту: handlers + підписка на зміни
 * @param {InitSetModalParams} params
 * @returns {{ unsubscribe: () => void }}
 */
export const initSetModal = ({
  setContext,
  resultsContext,
  formContext,
  spansContext,
  addListener,
}) => {
  // ===== MODAL ELEMENTS =====
  const modal = document.querySelector(RACK_SET_MODAL_SELECTORS.root);
  const modalTableContainer = document.querySelector(RACK_SET_MODAL_SELECTORS.table);
  const modalSummaryContainer = document.querySelector(RACK_SET_MODAL_SELECTORS.summary);
  const modalCloseBtns = document.querySelectorAll(RACK_SET_MODAL_SELECTORS.closeBtn);

  // ===== SET UI UPDATES =====
  const setTableContainer = query(RACK_SELECTORS.set.table)();
  const setSummaryContainer = query(RACK_SELECTORS.set.summary)();
  const openSetModalBtn = query(RACK_SELECTORS.set.openModalBtn)();

  const rackSetUnsubscribe = setContext.subscribe((newState) => {
    const racks = newState.racks;
    const isEmpty = racks.length === 0;
    const totalCost = setContext.selectors.getTotalCost();
    const totalItems = setContext.selectors.getTotalItems();

    // Рендер таблиці комплекту (compact режим для сторінки, ціни завжди показуємо)
    if (setTableContainer) {
      renderSetTable(racks, setTableContainer, true, 'compact');
    }

    // Рендер підсумку (завжди з цінами)
    if (setSummaryContainer) {
      renderSetSummary(totalCost, totalItems, setSummaryContainer, true);
    }

    // Активація кнопки "Переглянути комплект"
    if (openSetModalBtn) {
      openSetModalBtn.disabled = isEmpty;
      openSetModalBtn.setAttribute('aria-disabled', String(isEmpty));
      openSetModalBtn.dataset.state = isEmpty ? 'disabled' : 'ready';
    }

    log('[RackPage] Rack set updated:', {
      racksCount: racks.length,
      totalCost,
      totalItems,
      isEmpty,
    });
  });

  // ===== ADD TO SET BUTTON HANDLER =====
  const addToSetBtn = query(RACK_SELECTORS.results.addToSetBtn)();
  const handleAddToSet = () => {
    const rackData = resultsContext.selectors.getRack();
    const formConfig = formContext.selectors.getForm();
    const spansConfig = spansContext.selectors.getSpansArray();
    log('[RackPage] Add to set:', { rackData, formConfig, spansConfig });

    if (rackData && rackData.total > 0) {
      setContext.actions.addRack({ rack: rackData, formConfig, spansConfig });
    }
  };

  if (addToSetBtn) {
    addListener(addToSetBtn, 'click', handleAddToSet);
  }

  // ===== OPEN MODAL HANDLER =====
  const handleOpenSetModal = () => {
    const racks = setContext.selectors.getRacks();
    const totalCost = setContext.selectors.getTotalCost();
    const totalItems = setContext.selectors.getTotalItems();

    // Рендеринг таблиці в модалці (full режим з підтаблицями, ціни завжди показуємо)
    if (modalTableContainer) {
      renderSetTable(racks, modalTableContainer, true, 'full');
    }

    // Рендеринг підсумку в модалці (завжди з цінами)
    if (modalSummaryContainer) {
      renderSetSummary(totalCost, totalItems, modalSummaryContainer, true);
    }

    // Відкриття модалки
    if (modal) {
      modal.showModal();
      modal.dataset.state = 'open';
    }
  };

  const handleCloseModal = () => {
    if (modal) {
      modal.close();
      modal.dataset.state = 'closed';
    }
  };

  if (openSetModalBtn) {
    addListener(openSetModalBtn, 'click', handleOpenSetModal);
  }

  // Обробка закриття модалки
  modalCloseBtns.forEach((btn) => {
    addListener(btn, 'click', handleCloseModal);
  });

  // Закриття модалки по кліку на backdrop
  if (modal) {
    addListener(modal, 'click', (e) => {
      if (e.target === modal) {
        handleCloseModal();
      }
    });
  }

  return {
    unsubscribe: rackSetUnsubscribe,
  };
};

export default initSetModal;
