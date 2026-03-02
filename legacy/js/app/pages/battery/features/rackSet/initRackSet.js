// js/app/pages/battery/features/rackSet/initRackSet.js

import { query } from '../../../../effects/dom.js';
import { BATTERY_SELECTORS } from '../../../../config/selectors.js';
import { renderBatterySetTable, renderBatterySetSummary } from '../../effects/renderBatterySetTable.js';
import { useModal } from '../../../../ui/modal/useModal.js';
import { log } from '../../../../config/env.js';

/**
 * @typedef {Object} InitBatteryRackSetParams
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} batteryRackSetContext
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} resultsContext
 * @property {Function} addListener
 */

/**
 * Ініціалізація фічі комплекту стелажів для battery page:
 * - Підписка на зміни стану
 * - Рендер таблиці комплекту
 * - Обробка кнопки "Додати до комплекту" (через InteractiveElement)
 * @param {InitBatteryRackSetParams} params
 * @returns {{ unsubscribe: () => void }}
 */
export const initBatteryRackSet = ({
  batteryRackSetContext,
  resultsContext,
  addListener,
}) => {
  // ===== UI ELEMENTS =====
  const setCard = document.querySelector('[data-js="battery-setCard"]');
  const setTableContainer = query(BATTERY_SELECTORS.set.table)();
  const setSummaryContainer = query(BATTERY_SELECTORS.set.summary)();
  const openSetModalBtn = query(BATTERY_SELECTORS.set.openModalBtn)();

  // ===== MODAL HOOKS =====
  const modal = useModal();

  // ===== RENDER SET TABLE & SUMMARY =====
  const batterySetUnsubscribe = batteryRackSetContext.subscribe((newState) => {
    const variants = newState.variants;
    const isEmpty = variants.length === 0;
    const totalCost = batteryRackSetContext.selectors.getTotalCost();
    const totalItems = batteryRackSetContext.selectors.getTotalItems();

    // Рендер таблиці комплекту (compact режим для сторінки)
    if (setTableContainer) {
      renderBatterySetTable(variants, setTableContainer, true, 'compact');
    }

    // Рендер підсумку
    if (setSummaryContainer) {
      renderBatterySetSummary(totalCost, totalItems, setSummaryContainer, true);
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

    log('[BatteryPage] Battery set updated:', {
      variantsCount: variants.length,
      totalCost,
      totalItems,
      isEmpty,
    });
  });

  // ===== ADD TO SET BUTTON HANDLER (делегована обробка) =====
  // Обробка кліків на кнопки "Додати до комплекту" в таблиці варіантів
  const handleAddToSet = (e) => {
    const target = e.target.closest('[data-action="addVariantToSet"]');
    if (!target) return;

    const variantIndex = target.dataset.variantIndex;
    if (variantIndex === undefined) return;

    e.preventDefault();

    // Отримуємо варіант з resultsContext
    const resultsData = resultsContext.selectors.getResults() || [];
    const allVariants = resultsData.flatMap((r) => r.variantsWithPrice || []);
    const variantToAdd = allVariants[parseInt(variantIndex, 10)];

    if (variantToAdd) {
      batteryRackSetContext.actions.addVariant({ variant: variantToAdd });
      log('[BatteryRackSet] Added variant to set:', variantToAdd.name);
    }
  };

  // Додаємо обробник на контейнер результатів (делегування)
  const resultsOutput = document.querySelector(BATTERY_SELECTORS.results.output);
  if (resultsOutput) {
    resultsOutput.addEventListener('click', handleAddToSet);
  }

  return {
    unsubscribe: batterySetUnsubscribe,
  };
};

export default initBatteryRackSet;
