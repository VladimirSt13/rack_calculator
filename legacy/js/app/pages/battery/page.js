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
import { createBatteryRackSetContext } from './features/rackSet/context.js';

// Feature initializers
import { initBatteryForm } from './features/form/initForm.js';
import { initBatteryResults } from './features/results/initResults.js';
import { initBatteryRackSet } from './features/rackSet/initRackSet.js';

// Calculator
import { generateRackVariants } from './core/rackBuilder.js';
import { calculateBatteryRack } from './core/batteryCalculator.js';

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

      const { price, formConfig } = batteryPageState.get();

      if (!price) {
        batteryPageState.updateField('error', 'Ціни не завантажено');
        return;
      }

      // ===== 1. СТВОРЕННЯ FEATURE CONTEXTS =====
      const resultsContext = createBatteryResultsContext();
      const rackSet = createBatteryRackSetContext();

      // Створюємо form з callback, який використовує results
      const form = createBatteryFormContext((formValues) => {
        const resultsData = handleCalculate(formValues, price);
        resultsContext.actions.setResults(resultsData);
      });

      // ===== 2. EFFECT REGISTRY =====
      const effects = createEffectRegistry(BATTERY_SELECTORS);

      // ===== 3. INITIALIZE FORM =====
      initBatteryForm({
        formContext: form,
        selectors: BATTERY_SELECTORS.form,
        effects,
        formConfig,
      });

      // ===== 4. INITIALIZE RESULTS =====
      initBatteryResults({
        resultsContext: resultsContext,
        selectors: BATTERY_SELECTORS.results,
        effects,
        getFormValues: () => {
          const formValues = form.selectors.getForm();
          // Отримуємо rackWidth з останнього розрахунку (якщо є)
          const resultsData = resultsContext.selectors.getResults();
          const firstVariant = resultsData?.[0]?.variantsWithPrice?.[0];
          return {
            ...formValues,
            rackWidth: firstVariant?.width || formValues.width * formValues.rows, // fallback
          };
        },
      });

      // ===== 5. INTERACTIVE ELEMENTS (AUTO-HANDLER) =====
      const pageContainer = query(BATTERY_SELECTORS.page)();
      const autoHandler = pageContainer
        ? createAutoHandler(pageContainer, { batteryForm: form, batteryResults: resultsContext, batteryRackSet: rackSet })
        : { cleanup: () => {} };

      // ===== 6. INITIALIZE RACK SET =====
      const { unsubscribe: rackSetUnsubscribe } = initBatteryRackSet({
        batteryRackSetContext: rackSet,
        resultsContext: resultsContext,
        addListener,
      });

      // ===== 6. PAGE CONTEXT (ORCHESTRATOR) =====
      // Для battery page не використовуємо, оскільки розрахунок запускається напряму через callback
      const page = createPageContext({
        features: { batteryForm: form, batteryResults: resultsContext, batteryRackSet: rackSet },
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
        rackSetUnsubscribe?.();
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
 * @param {Object} price - прайс-лист
 * @returns {Array<Object>} масив варіантів з розрахунком вартості
 */
const handleCalculate = (formValues, price) => {
  const { length, width, height, weight, gap, count, rows, floors, supportType } = formValues;

  const element = {
    length,
    width,
    height,
    weight,
  };

  // 1. Генеруємо варіанти стелажів (один варіант з обраною конфігурацією)
  const rackVariants = generateRackVariants({
    element,
    totalCount: count,
    gap,
    rows,
    floors,
    supportType,
    price, // передаємо прайс для розрахунку вартості балок
  });

  // 2. Для кожного варіанту розраховуємо вартість
  const resultsWithCalculation = rackVariants.map((variant) => {
    // Для кожного варіанту прольотів розраховуємо вартість
    const spanVariants = variant.topSpans || [];

    // Розраховуємо вартість для кожного варіанту прольотів
    const variantsWithPrice = spanVariants.map((spanVariant, idx) => {
      const rackConfig = {
        floors: variant.floors,
        rows: variant.rows,
        supportType: variant.supportType,
        length: variant.length,
        width: variant.width,
        height: variant.height,
        spans: spanVariant.combination, // масив прольотів [600, 600, 750]
        beams: spanVariant.beams, // кількість балок з розрахунку вантажопідйомності
      };

      const calculation = calculateBatteryRack(rackConfig, price);

      return {
        ...variant,
        ...spanVariant,
        ...calculation,
        _index: idx, // індекс для додавання до комплекту
      };
    });

    return {
      ...variant,
      variantsWithPrice,
    };
  });

  return resultsWithCalculation;
};

export default batteryPage;
