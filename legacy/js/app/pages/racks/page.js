// js/app/pages/racks/page.js

import { PAGES } from '../../config/app.config.js';
import { createPageModule } from '../../ui/createPageModule.js';
import { createPageContext } from '../../core/PageContext.js';
import { createEffectRegistry } from '../../core/EffectRegistry.js';
import { createAutoHandler } from '../../core/InteractiveElement.js';
import { RACK_SELECTORS } from '../../config/selectors.js';

// DOM effects
import { query } from '../../effects/dom.js';

// Feature contexts
import { createRackFormContext } from './features/form/context.js';
import { createSpansContext } from './features/spans/context.js';
import { createRackResultsContext } from './features/results/context.js';
import { createRackSetContext } from './features/rackSet/context.js';

// Feature initializers
import { initForm } from './features/form/initForm.js';
import { initResults } from './features/results/initResults.js';
import { initRackSet } from './features/rackSet/initRackSet.js';
import { subscribeSpansDOM } from './features/spans/spansDOMUpdater.js';

// Calculator
import { calculateRack } from './core/calculator.js';

// Core
import { initRackPage } from './core/initRackPage.js';
import { pageState } from './core/rackPageState.js';

// Effects
import { renderRackResults } from './effects/renderResults.js';

import { log } from '../../config/env.js';

import { renderAllSpans } from './features/spans/domUtils.js';

const _pageState = new WeakMap();

// ===== PAGE MODULE =====

export const rackPage = createPageModule({
  id: PAGES.RACK,

  lifecycle: {
    onInit: () => initRackPage(pageState),

    /** Активація сторінки
     * @param {import('../../ui/createPageModule.js').PageDependencies} deps */
    onActivate: (deps) => {
      const { addListener } = deps;
      log('[RackPage] onActivate deps->', deps);
      if (_pageState.get(rackPage)?.isActivated) {
        log('[RackPage]', 'Already activated, skipping');
        return;
      }

      _pageState.set(rackPage, {
        isActivated: true,
        prevSpans: new Map(),
      });

      const { price, supportsOptions, verticalSupportsOptions, spanOptions } = pageState.get();
      log('[RackPage] onActivate', {
        price: !!price,
        supportsOptions,
        verticalSupportsOptions,
        spanOptions,
      });

      if (!price) {
        pageState.updateField('error', 'Ціни не завантажено');
        return;
      }

      // ===== 1. СТВОРЕННЯ FEATURE CONTEXTS =====
      const form = createRackFormContext();
      const spans = createSpansContext();
      const results = createRackResultsContext();
      const rackSet = createRackSetContext();

      // ===== 2. EFFECT REGISTRY =====
      const effects = createEffectRegistry(RACK_SELECTORS);

      // ===== 3. INITIALIZE FORM =====
      const { unsubscribe: formUnsubscribe } = initForm({
        formContext: form,
        supportsOptions,
        verticalSupportsOptions,
      });

      // ===== 4. INITIALIZE SPANS =====
      const spansContainer = query(RACK_SELECTORS.spans.container)();

      if (spansContainer) {
        renderAllSpans(spansContainer, spans.selectors.getSpans(), spanOptions);
      }

      const spansUnsubscribe = subscribeSpansDOM({
        spansContainer,
        spansContext: spans,
        spanOptions,
        rackPage,
        pageState: _pageState,
      });

      // ===== 5. INITIALIZE RESULTS =====
      const addToSetBtn = query(RACK_SELECTORS.results.addToSetBtn)();
      const { unsubscribe: resultsUnsubscribe } = initResults({
        resultsContext: results,
        addToSetBtn,
        addListener,
      });

      // ===== 6. INITIALIZE RACK SET =====
      const { unsubscribe: rackSetUnsubscribe } = initRackSet({
        rackSetContext: rackSet,
        resultsContext: results,
        formContext: form,
        spansContext: spans,
        addListener,
      });

      // ===== 7. INTERACTIVE ELEMENTS (AUTO-HANDLER) =====
      const pageContainer = query(RACK_SELECTORS.page)();
      const autoHandler = pageContainer
        ? createAutoHandler(pageContainer, { form, spans, results, rackSet })
        : { cleanup: () => {} };

      // ===== 8. PAGE CONTEXT (ORCHESTRATOR) =====
      const page = createPageContext({
        features: { form, spans, results, rackSet },
        collectInputData: () => ({
          form: form.selectors.getForm(),
          spans: spans.selectors.getData(),
          price,
        }),
        calculator: (data) => calculateRack({ ...data, price }),
        renderResult: (featureName, result) => {
          // Завжди оновлюємо results.state
          if (result) {
            results.actions.setResult(result);
          } else {
            results.actions.clear();
          }

          // Рендеримо в DOM тільки для form/spans
          if (['form', 'spans'].includes(featureName)) {
            renderRackResults(result, effects);
          }
        },
        needsRecalculation: ({ feature }) => ['form', 'spans'].includes(feature),

        onError: (error, context) => {
          console.error('[RackPage] Calculation error:', error, context);
          effects.setText('results', 'totalPrice', 'Помилка розрахунку');
        },
      });

      // ===== 8. ЗАПУСК ОРКЕСТРАЦІЇ =====
      page.init();

      // ===== 9. CLEANUP =====
      return () => {
        page.destroy();
        autoHandler.cleanup();
        formUnsubscribe?.();
        spansUnsubscribe?.();
        resultsUnsubscribe?.();
        rackSetUnsubscribe?.();
        _pageState.delete(rackPage);
      };
    },

    onDeactivate: () => {
      log('[RackPage]', 'Deactivated');
    },
  },
});

export default rackPage;
