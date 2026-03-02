// js/app/pages/racks/features/rackSet/useRackSetModal.js

import { log } from '../../../../config/env.js';
import { renderSetTable } from '../../effects/renderSetTable.js';

/**
 * @typedef {Object} UseRackSetModalParams
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} rackSetContext
 * @property {import('../../../../ui/modal/useModal.js').UseModalReturn} modal
 * @property {() => void} [onExport] - Callback при експорті
 */

/**
 * Хук для управління модалкою комплекту стелажів
 * @param {UseRackSetModalParams} params
 * @returns {{ openSetModal: () => void }}
 */
export const useRackSetModal = ({ rackSetContext, modal, onExport }) => {
  // ===== GENERATE MODAL CONTENT =====
  const generateModalContent = () => {
    const racks = rackSetContext.selectors.getRacks();
    const totalCost = rackSetContext.selectors.getTotalCost();
    const totalItems = rackSetContext.selectors.getTotalItems();

    const tableContainer = document.createElement('div');
    renderSetTable(racks, tableContainer, true, 'full');

    return `
      <div class="table-container">
        ${tableContainer.innerHTML}
      </div>
      <output class="result-total result-total--lg" style="margin-top: 1rem; display: block;">
        ${totalCost.toFixed(2)} ₴ (${totalItems} шт.)
      </output>
    `;
  };

  // ===== ATTACH MODAL EVENT LISTENERS (тільки для кнопок в таблиці) =====
  const attachModalEventListeners = () => {
    const tableContainer = document.querySelector('[data-modal-id="rackSet"] .table-container');
    if (!tableContainer) {
      log('[RackSetModal] Table container not found');
      return;
    }

    const increaseBtns = tableContainer.querySelectorAll('[data-action="increaseQty"]');
    const decreaseBtns = tableContainer.querySelectorAll('[data-action="decreaseQty"]');
    const removeBtns = tableContainer.querySelectorAll('[data-action="removeRack"]');

    // Збільшення - додаємо слухач тільки якщо ще не додано
    increaseBtns.forEach((btn) => {
      if (btn.__rackSetListenerAttached) {
        return;
      }

      const rackId = btn.dataset.rackid;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        log('[RackSetModal] Increase clicked:', rackId);
        if (rackId) {
          rackSetContext.actions.increaseQty(rackId);
          updateModalTable();
        }
      });
      btn.__rackSetListenerAttached = true;
    });

    // Зменшення
    decreaseBtns.forEach((btn) => {
      if (btn.__rackSetListenerAttached) {
        return;
      }

      const rackId = btn.dataset.rackid;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        log('[RackSetModal] Decrease clicked:', rackId);
        if (rackId) {
          rackSetContext.actions.decreaseQty(rackId);
          updateModalTable();
        }
      });
      btn.__rackSetListenerAttached = true;
    });

    // Видалення
    removeBtns.forEach((btn) => {
      if (btn.__rackSetListenerAttached) {
        return;
      }

      const rackId = btn.dataset.rackid;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        log('[RackSetModal] Remove clicked:', rackId);
        if (rackId) {
          rackSetContext.actions.removeRack(rackId);
          const updatedRacks = rackSetContext.selectors.getRacks();
          updateModalTable();
          // Якщо комплект порожній — закриваємо модалку
          if (updatedRacks.length === 0) {
            modal.closeModal('rackSet');
          }
        }
      });
      btn.__rackSetListenerAttached = true;
    });
  };

  // ===== UPDATE MODAL TABLE (оновлення контенту без закриття) =====
  const updateModalTable = () => {
    const tableContainer = document.querySelector('[data-modal-id="rackSet"] .table-container');
    const totalOutput = document.querySelector('[data-modal-id="rackSet"] .result-total--lg');

    if (!tableContainer) {
      return;
    }

    // Оновлюємо таблицю
    const racks = rackSetContext.selectors.getRacks();
    const newTableContainer = document.createElement('div');
    renderSetTable(racks, newTableContainer, true, 'full');
    tableContainer.innerHTML = newTableContainer.innerHTML;

    // Оновлюємо підсумок
    if (totalOutput) {
      const totalCost = rackSetContext.selectors.getTotalCost();
      const totalItems = rackSetContext.selectors.getTotalItems();
      totalOutput.textContent = `${totalCost.toFixed(2)} ₴ (${totalItems} шт.)`;
    }

    // Додаємо слухачі на нові кнопки
    setTimeout(() => {
      attachModalEventListeners();
    }, 0);
  };

  // ===== OPEN SET MODAL =====
  const openSetModal = () => {
    log('[RackSet] Open modal');

    modal.openModal({
      id: 'rackSet',
      title: 'Комплект стелажів',
      description: 'Перегляньте та відредагуйте ваш комплект стелажів',
      content: generateModalContent(),
      buttons: [
        {
          text: 'Закрити',
          variant: 'outline',
          closeOnConfirm: true,
        },
        {
          text: 'Експортувати',
          variant: 'primary',
          closeOnConfirm: false,
          onClick: onExport,
        },
      ],
      onOpen: () => {
        log('[RackSet] Modal opened');
        setTimeout(() => {
          attachModalEventListeners();
        }, 0);
      },
    });
  };

  return {
    openSetModal,
  };
};

export default useRackSetModal;
