// js/app/pages/racks/features/rackSet/initRackSet.js

import { query } from '../../../../effects/dom.js';
import { RACK_SELECTORS } from '../../../../config/selectors.js';
import { renderSetSummary, renderSetTable } from '../../effects/renderSetTable.js';
import { useModal } from '../../../../ui/modal/useModal.js';
import { useRackSetModal } from './useRackSetModal.js';
import { log } from '../../../../config/env.js';

/**
 * @typedef {Object} InitRackSetParams
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} rackSetContext
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} resultsContext
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} formContext
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} spansContext
 * @property {Function} addListener
 */

/**
 * Ініціалізація фічі комплекту стелажів:
 * - Підписка на зміни стану
 * - Рендер таблиці комплекту
 * - Обробка кнопки "Додати до комплекту"
 * @param {InitRackSetParams} params
 * @returns {{ unsubscribe: () => void }}
 */
export const initRackSet = ({
  rackSetContext,
  resultsContext,
  formContext,
  spansContext,
  addListener,
}) => {
  // ===== UI ELEMENTS =====
  const setCard = document.querySelector('[data-js="rack-setCard"]');
  const setTableContainer = query(RACK_SELECTORS.set.table)();
  const setSummaryContainer = query(RACK_SELECTORS.set.summary)();
  const openSetModalBtn = query(RACK_SELECTORS.set.openModalBtn)();
  const addToSetBtn = query(RACK_SELECTORS.results.addToSetBtn)();

  // ===== MODAL HOOKS =====
  const modal = useModal();  // Універсальний хук
  const { openSetModal } = useRackSetModal({
    rackSetContext,
    modal,
    onExport: () => {
      log('[RackSet] Export clicked');
      // TODO: Реалізувати експорт комплекту
    },
  });

  // ===== RENDER SET TABLE & SUMMARY (ТІЛЬКИ ДЛЯ СТОРІНКИ) =====
  const rackSetUnsubscribe = rackSetContext.subscribe((newState) => {
    const racks = newState.racks;
    const isEmpty = racks.length === 0;
    const totalCost = rackSetContext.selectors.getTotalCost();
    const totalItems = rackSetContext.selectors.getTotalItems();

    // Рендер таблиці комплекту (compact режим для сторінки)
    if (setTableContainer) {
      renderSetTable(racks, setTableContainer, true, 'compact');
    }

    // Рендер підсумку
    if (setSummaryContainer) {
      renderSetSummary(totalCost, totalItems, setSummaryContainer, true);
    }

    // Стан картки комплекту
    if (setCard) {
      setCard.dataset.state = isEmpty ? 'empty' : 'ready';
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
  const handleAddToSet = () => {
    const rackData = resultsContext.selectors.getRack();
    const formConfig = formContext.selectors.getForm();
    const spansConfig = spansContext.selectors.getSpansArray();
    log('[RackPage] Add to set:', { rackData, formConfig, spansConfig });

    if (rackData && rackData.total > 0) {
      rackSetContext.actions.addRack({ rack: rackData, formConfig, spansConfig });
    }
  };

  if (addToSetBtn) {
    addListener(addToSetBtn, 'click', handleAddToSet);
  }

  // ===== OPEN MODAL HANDLER =====
  if (openSetModalBtn) {
    addListener(openSetModalBtn, 'click', openSetModal);
  }

  return {
    unsubscribe: rackSetUnsubscribe,
  };
};

export default initRackSet;
