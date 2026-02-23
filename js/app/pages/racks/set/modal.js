import { rackSetModalRenderer } from './renderer/rackSetRenderer.js';
import {
  getRackSetSelectors,
  setButtonDisabled,
  toggleModal,
  updateModalContent,
} from './effects/rackSetEffects.js';

/**
 * Modal sub-module for rack set
 * @param {ReturnType<import('./context.js').createRackSetContext>} rackSetCtx
 * @param {Function} addListener - curried addListener from deps
 * @returns {{ activate: () => void, deactivate: () => void }}
 */
export const createRackSetModalModule = (rackSetCtx, addListener) => {
  const { state, actions, selectors } = rackSetCtx;
  const dom = getRackSetSelectors();
  let modalUnsubscribe = null;

  const activate = () => {
    modalUnsubscribe = state.subscribe((s) => {
      if (s.isModalOpen) {
        const html = rackSetModalRenderer.toHTML(s);
        updateModalContent(html)();
        setButtonDisabled(dom.modalExportBtn, selectors.isEmpty())();
      }
      toggleModal(s.isModalOpen)();
    });

    // Close button
    const closeBtn = dom.modalCloseBtn();
    if (closeBtn) {
      addListener(closeBtn)('click')(() => actions.closeModal());
    }

    // Export button
    const exportBtn = dom.modalExportBtn();
    if (exportBtn) {
      addListener(exportBtn)('click')(() => {
        console.log('[RackSet] Export:', selectors.getAll());
        // TODO: implement actual export
      });
    }

    // Backdrop click
    const modalEl = dom.modalRoot();
    if (modalEl) {
      addListener(modalEl)('click')((e) => {
        if (e.target === modalEl) {
          actions.closeModal();
        }
      });
    }

    // Escape key
    addListener(document)('keydown')((e) => {
      if (e.key === 'Escape' && selectors.isModalOpen()) {
        actions.closeModal();
      }
    });

    // Focus trap
    const focusTrap = (e) => {
      if (!selectors.isModalOpen() || e.key !== 'Tab') {
        return;
      }
      const modal = dom.modalRoot();
      if (!modal) {
        return;
      }
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) {
        return;
      }
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    addListener(document)('keydown')(focusTrap);

    // Initial render
    if (selectors.isModalOpen()) {
      updateModalContent(rackSetModalRenderer.toHTML(state.get()))();
      toggleModal(true)();
    }
  };

  const deactivate = () => {
    modalUnsubscribe?.();
    modalUnsubscribe = null;
    toggleModal(false)();
  };

  return { activate, deactivate };
};
