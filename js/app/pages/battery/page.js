// js/app/pages/battery/page.js

import { PAGES } from '../../config/app.config.js';
import { createPageModule } from '../../ui/createPageModule.js';
import { createPageContext } from '../../core/PageContext.js';
import { createEffectRegistry } from '../../core/EffectRegistry.js';
import { createAutoHandler } from '../../core/InteractiveElement.js';
import { BATTERY_SELECTORS } from '../../config/selectors.js';

// DOM effects
import { query } from '../../effects/dom.js';

// Feature contexts
import { createBatteryFormContext } from './features/form/context.js';
import { createBatteryResultsContext } from './features/results/context.js';

// Feature initializers
import { initBatteryForm } from './features/form/initForm.js';
import { initBatteryResults } from './features/results/initResults.js';

// Calculator
import { generateRackVariants } from './core/rackBuilder.js';

// Effects
import { renderBatteryTable } from './effects/renderBatteryTable.js';

import { log } from '../../config/env.js';

// Page state
import { batteryPageState } from './core/batteryPageState.js';
import { initBatteryPage } from './core/initBatteryPage.js';

const _pageState = new WeakMap();

// ===== PAGE MODULE =====

export const batteryPage = createPageModule({
  id: PAGES.BATTERY,

  lifecycle: {
    onInit: () => initBatteryPage(batteryPageState),

    /** Активація сторінки
     * @param {import('../../ui/createPageModule.js').PageDependencies} deps */
    onActivate: (deps) => {
      const { addListener } = deps;
      log('[BatteryPage] onActivate deps->', deps);

      if (_pageState.get(batteryPage)?.isActivated) {
        log('[BatteryPage]', 'Already activated, skipping');
        return;
      }

      _pageState.set(batteryPage, {
        isActivated: true,
      });

      const { price } = batteryPageState.get();

      if (!price) {
        batteryPageState.updateField('error', 'Ціни не завантажено');
        return;
      }

      // ===== 1. СТВОРЕННЯ FEATURE CONTEXTS =====
      const results = createBatteryResultsContext();

      // Створюємо form з callback, який використовує results
      const form = createBatteryFormContext(() => {
        const formValues = form.selectors.getForm();
        const resultsData = handleCalculate(formValues, price);
        results.actions.setResults(resultsData);
      });

      // ===== 2. EFFECT REGISTRY =====
      const effects = createEffectRegistry(BATTERY_SELECTORS);

      // ===== 3. INITIALIZE FORM =====
      initBatteryForm({
        formContext: form,
        selectors: BATTERY_SELECTORS.form,
        effects,
        addListener,
        onCalculate: (formValues) => handleCalculate(formValues, price),
      });

      // ===== 4. INITIALIZE RESULTS =====
      initBatteryResults({
        resultsContext: results,
        selectors: BATTERY_SELECTORS.results,
        effects,
        renderCallback: (resultsData, outputEl) => renderBatteryTable(resultsData, outputEl, price),
      });

      // ===== 5. INTERACTIVE ELEMENTS (AUTO-HANDLER) =====
      const pageContainer = query(BATTERY_SELECTORS.page)();
      const autoHandler = pageContainer
        ? createAutoHandler(pageContainer, { form, results })
        : { cleanup: () => {} };

      // ===== 6. PAGE CONTEXT (ORCHESTRATOR) =====
      // Для battery page не використовуємо, оскільки розрахунок запускається напряму через callback
      const page = createPageContext({
        features: { form, results },
        collectInputData: () => ({
          form: form.selectors.getForm(),
        }),
        calculator: () => null, // Не використовується
        renderResult: () => {}, // Не використовується
        needsRecalculation: () => false, // Вимикаємо автоматичний розрахунок
        onError: (error, context) => {
          console.error('[BatteryPage] Calculation error:', error, context);
        },
      });

      // ===== 7. ЗАПУСК ОРКЕСТРАЦІЇ =====
      page.init();

      // ===== 8. CLEANUP =====
      return () => {
        page.destroy();
        autoHandler.cleanup();
        _pageState.delete(batteryPage);
      };
    },

    onDeactivate: () => {
      log('[BatteryPage]', 'Deactivated');
    },
  },
});

/**
 * Обробник розрахунку варіантів стелажів
 * @param {Object} formValues - значення форми
 * @param {Object} _price - прайс-лист (використовується в renderBatteryTable)
 * @returns {Array<Object>} масив конфігурацій стелажів
 */
const handleCalculate = (formValues, _price) => {
  const { length, width, height, weight, gap, count } = formValues;

  const element = {
    length,
    width,
    height,
    weight,
  };

  const results = generateRackVariants({
    element,
    totalCount: count,
    gap,
  });

  return results;
};

export default batteryPage;
