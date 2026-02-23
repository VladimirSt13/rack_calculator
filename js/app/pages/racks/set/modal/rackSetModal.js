// js/app/pages/racks/set/modal/rackSetModal.js

import { createPageModule } from '../../../ui/createPageModule.js';
import { createState } from '../../state/createState.js';
import { initialRackSetState } from '../state/rackSetState.js';
import { createRackSetActions } from '../state/rackSetActions.js';
import { createRackSetSelectors } from '../state/rackSetSelectors.js';
import { rackSetModalRenderer } from '../renderer/rackSetRenderer.js';
import {
  getRackSetSelectors,
  setButtonDisabled,
  toggleModal,
  updateModalContent,
} from '../effects/rackSetEffects.js';

/**
 * Modal sub-module for rack set
 * Uses shared state from parent, but has its own lifecycle for DOM management
 */
export const createRackSetModal = (sharedState, sharedActions, sharedSelectors) => {
  // Local state for UI-only flags (if needed)
  const modalState = createState({ isReady: false });

  return createPageModule({
    id: 'rack-set-modal',

    lifecycle: {
      onActivate: ({ effects }) => {
        const selectors = getRackSetSelectors();

        // Subscribe to shared state for re-rendering
        const unsubscribe = sharedState.subscribe((state) => {
          // Update modal content when state changes
          const modalEl = selectors.modalRoot();
          if (modalEl && state.isModalOpen) {
            const html = rackSetModalRenderer.toHTML(state);
            updateModalContent(html)();

            // Update export button state
            const exportBtn = selectors.modalExportBtn();
            if (exportBtn) {
              setButtonDisabled(exportBtn, sharedSelectors.isEmpty())();
            }
          }
        });

        // Handle modal open/close via shared state
        const handleStateChange = (state) => {
          toggleModal(state.isModalOpen)();

          // Focus trap when modal opens
          if (state.isModalOpen) {
            requestAnimationFrame(() => {
              const closeBtn = selectors.modalCloseBtn();
              closeBtn?.focus();
            });
          }
        };

        const unsubscribeShared = sharedState.subscribe(handleStateChange);

        // Event: close modal
        const closeBtn = selectors.modalCloseBtn();
        if (closeBtn) {
          effects.addListener(closeBtn)('click')(() => {
            sharedActions.closeModal();
          });
        }

        // Event: export (placeholder)
        const exportBtn = selectors.modalExportBtn();
        if (exportBtn) {
          effects.addListener(exportBtn)('click')(() => {
            const data = sharedSelectors.getAll();
            console.log('Export rack set:', data);
            // TODO: implement actual export (JSON/PDF/CSV)
          });
        }

        // Event: close on backdrop click
        const modalEl = selectors.modalRoot();
        if (modalEl) {
          effects.addListener(modalEl)('click')((e) => {
            if (e.target === modalEl) {
              sharedActions.closeModal();
            }
          });
        }

        // Event: close on Escape key
        effects.addListener(document)('keydown')((e) => {
          if (e.key === 'Escape' && sharedSelectors.isModalOpen()) {
            sharedActions.closeModal();
          }
        });

        // Initial render
        const initialState = sharedState.get();
        if (initialState.isModalOpen) {
          const html = rackSetModalRenderer.toHTML(initialState);
          updateModalContent(html)();
          toggleModal(true)();
        }

        // Cleanup
        return () => {
          unsubscribe();
          unsubscribeShared();
          toggleModal(false)();
        };
      },

      onDeactivate: () => {
        // Ensure modal is closed when page deactivates
        sharedActions.closeModal();
      },
    },
  });
};

export default createRackSetModal;
