/* eslint-disable no-console */
// js/app/pages/racks/page.js

import { PAGES } from '../../config/app.config.js';
import { createPageModule } from '../../ui/createPageModule.js';
import { createState } from '../../state/createState.js';

// Calculator imports
import { initialRackCalcState } from './calculator/state/rackCalcState.js';
import { createRackCalcActions } from './calculator/state/rackCalcActions.js';
import { createRackCalcSelectors } from './calculator/state/rackCalcSelectors.js';
import { calculateComponents } from './calculator/core/calculator.js';
import { loadPrice } from './calculator/state/priceState.js';
import {
  addToSetButtonRenderer,
  componentsTableRenderer,
  rackNameRenderer,
} from './calculator/renderer/rackCalcRenderer.js';
import {
  getRackCalcSelectors,
  populateDropdown,
  updateAddToSetButton,
  updateComponentsTable,
  updateRackName,
} from './calculator/effects/rackCalcEffects.js';

// Rack Set imports
import { initialRackSetState } from './set/state/rackSetState.js';
import { createRackSetActions } from './set/state/rackSetActions.js';
import { createRackSetSelectors } from './set/state/rackSetSelectors.js';
import {
  rackSetModalRenderer,
  rackSetSummaryRenderer,
  rackSetTableRenderer,
} from './set/renderer/rackSetRenderer.js';
import {
  getRackSetSelectors,
  setButtonDisabled,
  toggleModal,
  updateModalContent,
  updatePageSummary,
  updatePageTable,
} from './set/effects/rackSetEffects.js';

// ===== TYPEDEFS =====

/**
 * @typedef {import('./calculator/state/rackCalcState.js').RackState} RackState
 * @typedef {import('./set/state/rackSetState.js').RackSetState} RackSetState
 * @typedef {import('../../ui/createPageModule.js').PageDependencies} PageDeps
 */

// ===== PAGE-LEVEL STATE =====

/** @type {import('../../state/createState.js').StateInstance<{ price: any, isLoading: boolean, error: string | null }>} */
const pageState = createState({
  price: null,
  isLoading: false,
  error: null,
});

const serializeForm = (form) => {
  if (!form) {
    return '';
  }
  return JSON.stringify({
    ...form,
    // Перетворюємо Map на масив, якщо потрібно
    beams: form.beams instanceof Map ? Array.from(form.beams.values()) : form.beams,
  });
};
// ===== CALCULATOR CONTEXT =====

/**
 * Creates isolated calculator context with state + actions + selectors
 * @returns {{
 *   state: import('../../state/createState.js').StateInstance<RackState>,
 *   actions: ReturnType<typeof createRackCalcActions>,
 *   selectors: ReturnType<typeof createRackCalcSelectors>,
 *   init: (opts: { price: any, onStateChange: (s: RackState) => void }) => void,
 *   destroy: () => void
 * }}
 */
const createCalculatorContext = () => {
  const state = createState({ ...initialRackCalcState });
  const actions = createRackCalcActions(state, initialRackCalcState);
  const selectors = createRackCalcSelectors(state);

  /** @type {(() => void) | null} */
  let unsubscribe = null;
  /** @type {any} */
  let priceRef = null;

  const init = ({ price, onStateChange }) => {
    priceRef = price;
    let prevFormSerialized = null;
    let prevRackJSON = '';

    unsubscribe = state.subscribe((currentState) => {
      const { form } = currentState;
      const currentFormSerialized = serializeForm(form);

      if (prevFormSerialized === currentFormSerialized) {
        return;
      }

      prevFormSerialized = currentFormSerialized;
      if (!price || Object.keys(price).length === 0 || !form) {
        return;
      }

      const rackConfig = {
        floors: form.floors,
        rows: form.rows,
        beams: [...form.beams.values()].map((beam) => ({ ...beam })),
        supports: form.supports,
        verticalSupports: form.verticalSupports,
        beamsPerRow: form.beamsPerRow,
      };

      const canCalculate =
        rackConfig.floors &&
        (rackConfig.floors === 1 || rackConfig.verticalSupports) &&
        rackConfig.rows &&
        rackConfig.supports &&
        rackConfig.beams.length > 0 &&
        rackConfig.beams.every((b) => b.item && b.quantity);

      if (!canCalculate) {
        if (selectors.getCurrentRack() !== null) {
          actions.clearCurrentRack();
          onStateChange?.(state);
        }
        return;
      }

      const { newRack } = calculateComponents({ rackConfig, price: priceRef });
      console.log('🚀 ~ newRack->', newRack);
      console.log('🚀 ~ prevRackJSON->', prevRackJSON);
      if (newRack) {
        const newRackJSON = JSON.stringify(newRack);
        if (newRackJSON !== prevRackJSON) {
          prevRackJSON = newRackJSON;
          actions.batchCurrentRack(newRack);
          onStateChange?.(state);
        }
      }
    });
  };

  const destroy = () => {
    unsubscribe?.();
    unsubscribe = null;
  };

  return { state, actions, selectors, init, destroy };
};

// ===== RACK SET CONTEXT =====

/**
 * Creates isolated rack set context
 * @returns {{
 *   state: import('../../state/createState.js').StateInstance<RackSetState>,
 *   actions: ReturnType<typeof createRackSetActions>,
 *   selectors: ReturnType<typeof createRackSetSelectors>,
 *   destroy: () => void
 * }}
 */
const createRackSetContext = () => {
  const state = createState({ ...initialRackSetState });
  const actions = createRackSetActions(state, initialRackSetState);
  const selectors = createRackSetSelectors(state);

  /** @type {(() => void) | null} */
  let unsubscribe = null;

  const init = ({ onStateChange }) => {
    unsubscribe = state.subscribe((currentState) => {
      onStateChange?.(currentState);
    });
  };

  const destroy = () => {
    unsubscribe?.();
    unsubscribe = null;
  };

  return { state, actions, selectors, init, destroy };
};

// ===== MODAL SUB-MODULE =====

/**
 * @param {ReturnType<typeof createRackSetContext>} rackSetCtx
 * @param {Function} addListener - curried addListener from deps
 * @returns {{ activate: () => void, deactivate: () => void }}
 */
const createRackSetModalModule = (rackSetCtx, addListener) => {
  const { state, actions, selectors: setSelectors } = rackSetCtx;
  const dom = getRackSetSelectors();

  let modalUnsubscribe = null;

  const activate = () => {
    // Subscribe to state for re-rendering
    modalUnsubscribe = state.subscribe((s) => {
      // Update modal content if open
      if (s.isModalOpen) {
        const html = rackSetModalRenderer.toHTML(s);
        updateModalContent(html)();
        setButtonDisabled(dom.modalExportBtn, setSelectors.isEmpty())();
      }
      // Toggle visibility
      toggleModal(s.isModalOpen)();
    });

    // Event: Close button
    const closeBtn = dom.modalCloseBtn();
    if (closeBtn) {
      addListener(closeBtn)('click')(() => actions.closeModal());
    }

    // Event: Export button (placeholder)
    const exportBtn = dom.modalExportBtn();
    if (exportBtn) {
      addListener(exportBtn)('click')(() => {
        const data = setSelectors.getAll();
        console.log('[RackSet] Export:', data);
        // TODO: implement actual export
      });
    }

    // Event: Close on backdrop click
    const modalEl = dom.modalRoot();
    if (modalEl) {
      addListener(modalEl)('click')((e) => {
        if (e.target === modalEl) {
          actions.closeModal();
        }
      });
    }

    // Event: Close on Escape
    addListener(document)('keydown')((e) => {
      if (e.key === 'Escape' && setSelectors.isModalOpen()) {
        actions.closeModal();
      }
    });

    // Focus trap when modal opens
    const focusTrap = (e) => {
      if (!setSelectors.isModalOpen() || e.key !== 'Tab') {
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
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    addListener(document)('keydown')(focusTrap);

    // Initial render if already open
    if (setSelectors.isModalOpen()) {
      const html = rackSetModalRenderer.toHTML(state.get());
      updateModalContent(html)();
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

// ===== PAGE MODULE =====

export const rackPage = createPageModule({
  id: PAGES.RACK,

  lifecycle: {
    onInit: async () => {
      const price = await loadPrice();
      pageState.updateField('price', price);
    },

    /** @param {PageDeps} deps */
    onActivate: (deps) => {
      const { addListener } = deps;
      const price = pageState.get().price;

      if (!price) {
        pageState.updateField('error', 'Ціни не завантажено');
        return;
      }

      // ===== INIT CALCULATOR =====
      const calculator = createCalculatorContext();
      calculator.init({
        price,
        onStateChange: (state) => {
          const nameEl = getRackCalcSelectors().rackName();
          const tableEl = getRackCalcSelectors().componentsTable();
          const btnEl = getRackCalcSelectors().addToSetBtn();

          if (nameEl) {
            rackNameRenderer.render(nameEl)(state);
          }
          if (tableEl) {
            componentsTableRenderer.render(tableEl)(state);
          }
          if (btnEl) {
            const btnState = addToSetButtonRenderer.toHTML(state);
            updateAddToSetButton(btnState)();
          }
        },
      });

      // Populate dropdowns
      populateDropdown(
        getRackCalcSelectors().verticalSupports,
        Object.keys(price.vertical_supports),
      )();
      populateDropdown(getRackCalcSelectors().supports, Object.keys(price.supports))();

      // ===== INIT RACK SET =====
      const rackSet = createRackSetContext();
      rackSet.init({
        onStateChange: (state) => {
          const tableEl = getRackSetSelectors().rackSetTable();
          const summaryEl = getRackSetSelectors().rackSetSummary();
          if (tableEl) {
            rackSetTableRenderer.render(tableEl)(state);
          }
          if (summaryEl) {
            rackSetSummaryRenderer.render(summaryEl)(state);
          }
        },
      });

      // Init modal sub-module
      const modalModule = createRackSetModalModule(rackSet, addListener);
      modalModule.activate();

      // ===== EVENT HANDLERS =====

      /** @param {InputEvent} e */
      const handleFormInput = (e) => {
        const target = /** @type {HTMLInputElement | HTMLSelectElement} */ (e.target);
        if (!target.matches('input, select')) {
          return;
        }

        const { id, value, tagName } = target;
        switch (id) {
          case 'rack-floors':
            calculator.actions.updateFloors(value);
            break;
          case 'rack-rows':
            calculator.actions.updateRows(value);
            break;
          case 'rack-beamsPerRow':
            calculator.actions.updateBeamsPerRow(value);
            break;
          case 'rack-verticalSupports':
            calculator.actions.updateVerticalSupports(value);
            break;
          case 'rack-supports':
            calculator.actions.updateSupports(value);
            break;
          default: {
            const row = target.closest('.beam-row');
            if (!row) {
              return;
            }
            const beamId = Number(row.dataset.id);
            if (tagName === 'SELECT') {
              calculator.actions.updateBeam(beamId, { item: value || '' });
            }
            if (tagName === 'INPUT') {
              calculator.actions.updateBeam(beamId, { quantity: Number(value) || null });
            }
          }
        }
      };

      /** Add new beam row */
      const handleAddBeam = () => {
        const beamId = calculator.actions.addBeam();
        const container = getRackCalcSelectors().beamsContainer();
        if (!container) {
          return;
        }

        const beamsData = Object.keys(price.beams);
        const rowHTML = `
          <div class="beam-row" data-id="${beamId}">
            <select>
              <option value="" disabled selected>Виберіть...</option>
              ${beamsData.map((b) => `<option value="${b}">${b}</option>`).join('')}
            </select>
            <input type="number" min="1" max="10" />
            <button class="icon-btn icon-btn--remove" type="button" aria-label="Видалити проліт"></button>
          </div>`;
        container.insertAdjacentHTML('beforeend', rowHTML);
      };

      /** Remove beam (delegation) */
      const handleBeamRemove = (/** @type {MouseEvent} */ e) => {
        if (!e.target.matches('.icon-btn--remove')) {
          return;
        }
        const row = e.target.closest('.beam-row');
        if (!row) {
          return;
        }
        const beamId = Number(row.dataset.id);
        calculator.actions.removeBeam(beamId);
        row.remove();
      };

      /** Add calculated rack to set */
      const handleAddToSet = () => {
        const rack = calculator.selectors.getCurrentRack();
        if (!rack) {
          return;
        }
        const qty = Number(prompt('Введіть кількість стелажів', '1')) || 1;
        rackSet.actions.addRack({ rack, qty });
      };

      /** Handle rack set quantity controls (delegation) */
      const handleRackSetAction = (/** @type {MouseEvent} */ e) => {
        const controls = e.target.closest('[data-js="qty-controls"]');
        if (!controls) {
          return;
        }
        const id = controls.dataset.id;
        const action = e.target.dataset.action;
        if (!id || !action) {
          return;
        }
        const item = rackSet.selectors.getById(id);
        if (!item) {
          return;
        }
        switch (action) {
          case 'increase':
            rackSet.actions.updateQty(id, item.qty + 1);
            break;
          case 'decrease':
            rackSet.actions.updateQty(id, item.qty - 1);
            break;
          case 'remove':
            rackSet.actions.removeRack(id);
            break;
        }
      };

      /** Toggle details in modal */
      const handleToggleDetails = (/** @type {MouseEvent} */ e) => {
        if (!e.target.matches('[data-js="toggle-details"]')) {
          return;
        }
        const id = e.target.dataset.id;
        rackSet.actions.toggleExpanded(id);
      };

      /** Open modal */
      const handleOpenModal = () => rackSet.actions.openModal();

      // ===== REGISTER EVENTS =====
      const formEl = getRackCalcSelectors().form();
      const addBeamBtn = getRackCalcSelectors().addBeamBtn();
      const addToSetBtn = getRackCalcSelectors().addToSetBtn();
      const rackSetTableEl = getRackSetSelectors().rackSetTable();
      const openModalBtn = getRackSetSelectors().openModalBtn();

      if (formEl) {
        addListener(formEl)('input')(handleFormInput);
        addListener(formEl)('click')(handleBeamRemove);
      }
      if (addBeamBtn) {
        addListener(addBeamBtn)('click')(handleAddBeam);
      }
      if (addToSetBtn) {
        addListener(addToSetBtn)('click')(handleAddToSet);
      }
      if (rackSetTableEl) {
        addListener(rackSetTableEl)('click')(handleRackSetAction);
        addListener(rackSetTableEl)('click')(handleToggleDetails);
      }
      if (openModalBtn) {
        addListener(openModalBtn)('click')(handleOpenModal);
      }

      // ===== INITIAL RENDER =====
      const calcState = calculator.state.get();
      const setName = getRackCalcSelectors().rackName();
      const setTable = getRackCalcSelectors().componentsTable();
      if (setName) {
        rackNameRenderer.render(setName)(calcState);
      }
      if (setTable) {
        componentsTableRenderer.render(setTable)(calcState);
      }

      const rackSetState = rackSet.state.get();
      const pageTable = getRackSetSelectors().rackSetTable();
      const pageSummary = getRackSetSelectors().rackSetSummary();
      if (pageTable) {
        rackSetTableRenderer.render(pageTable)(rackSetState);
      }
      if (pageSummary) {
        rackSetSummaryRenderer.render(pageSummary)(rackSetState);
      }

      // ===== CLEANUP =====
      return () => {
        calculator.destroy();
        rackSet.destroy();
        modalModule.deactivate();
        // events.removeAllListeners() called automatically by createPageModule
      };
    },

    onDeactivate: () => {
      // Additional cleanup if needed
    },
  },
});

export default rackPage;
