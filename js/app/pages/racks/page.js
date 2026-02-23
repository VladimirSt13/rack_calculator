/* eslint-disable no-console */
// js/app/pages/racks/page.js

import { PAGES } from '../../config/app.config.js';
import { createPageModule } from '../../ui/createPageModule.js';
import { createState } from '../../state/createState.js';
import { pageState } from './state/pageState.js';

// Calculator imports
import { loadPrice } from './calculator/state/priceState.js';
import {
  addToSetButtonRenderer,
  componentsTableRenderer,
  rackNameRenderer,
} from './calculator/renderer/renderer.js';
import {
  getRackCalcSelectors,
  populateDropdown,
  updateAddToSetButton,
  updateComponentsTable,
  updateRackName,
} from './calculator/effects/rackCalcEffects.js';

// Rack Set imports
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

import { createCalculatorContext } from './calculator/context.js';
import { handleAddBeam, handleBeamRemove, handleFormInput } from './handlers/formHandler.js';
import { onCalculatorStateChange } from './calculator/renderer/onStateChange.js';
import { createRackSetContext } from './set/context.js';
import { createRackSetModalModule } from './set/modal.js';
import {
  handleAddToSet,
  handleOpenModal,
  handleRackSetAction,
  handleToggleDetails,
} from './handlers/setHandler.js';
import { onRackSetStateChange } from './set/renderer/onStateChange.js';
import { initialRender } from './renderer/initialRender.js';
// ===== TYPEDEFS =====
/**
 * @typedef {import('./calculator/state/rackCalcState.js').RackState} RackState
 * @typedef {import('./set/state/rackSetState.js').RackSetState} RackSetState
 * @typedef {import('../../ui/createPageModule.js').PageDependencies} PageDeps
 */

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
      const { addListener, registerState } = deps;
      const price = pageState.get().price;

      if (!price) {
        pageState.updateField('error', 'Ціни не завантажено');
        return;
      }

      // ===== INIT CALCULATOR =====
      const calculator = createCalculatorContext();

      if (registerState) {
        registerState('rackCalculator', () => calculator?.state?.get() || null);
        registerState('rackForm', () => calculator?.state?.get?.().form || null);
      }

      calculator.init({
        price,
        onStateChange: onCalculatorStateChange,
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
        onStateChange: onRackSetStateChange,
      });

      // Init modal sub-module
      const modalModule = createRackSetModalModule(rackSet, addListener);
      modalModule.activate();

      // ===== REGISTER EVENTS =====
      const formEl = getRackCalcSelectors().form();
      const addBeamBtn = getRackCalcSelectors().addBeamBtn();
      const addToSetBtn = getRackCalcSelectors().addToSetBtn();
      const rackSetTableEl = getRackSetSelectors().rackSetTable();
      const openModalBtn = getRackSetSelectors().openModalBtn();

      if (formEl) {
        addListener(formEl)('input')((e) => handleFormInput(e, { calculator }));
        addListener(formEl)('click')((e) => handleBeamRemove(e, { calculator }));
      }
      if (addBeamBtn) {
        addListener(addBeamBtn)('click')(() =>
          handleAddBeam({ calculator, price }, () => getRackCalcSelectors().beamsContainer()),
        );
      }
      if (addToSetBtn) {
        addListener(addToSetBtn)('click')(() => handleAddToSet({ calculator, rackSet }));
      }
      if (rackSetTableEl) {
        addListener(rackSetTableEl)('click')((e) => handleRackSetAction(e, { rackSet }));
        addListener(rackSetTableEl)('click')((e) => handleToggleDetails(e, { rackSet }));
      }
      if (openModalBtn) {
        addListener(openModalBtn)('click')(() => handleOpenModal({ rackSet }));
      }

      // ===== INITIAL RENDER =====
      const calcState = calculator.state.get();
      const rackSetState = rackSet.state.get();
      initialRender({ calcState, rackSetState });

      // ===== CLEANUP =====
      return () => {
        calculator.destroy();
        rackSet.destroy();
        modalModule.deactivate();
      };
    },

    onDeactivate: () => {
      // Additional cleanup if needed
    },
  },
});

export default rackPage;
