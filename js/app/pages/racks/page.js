// js/app/pages/racks/page.js

import { PAGES } from '../../config/app.config.js';
import { createPageModule } from '../../ui/createPageModule.js';
import { createState } from '../../core/createState.js';
import { createPageContext } from '../../core/PageContext.js';
import { createEffectRegistry } from '../../core/EffectRegistry.js';
import { createAutoHandler } from '../../core/InteractiveElement.js';
import { loadPrice } from './features/priceState.js';
import { RACK_SELECTORS } from '../../config/selectors.js';

// Feature contexts
import { createRackFormContext } from './features/form/context.js';
import { createSpansContext } from './features/spans/context.js';
import { createRackResultsContext } from './features/results/context.js';
import { createRackSetContext } from './features/set/context.js';

// Calculator
import { calculateRack } from './core/calculator.js';

// ===== PAGE-LEVEL STATE =====

/** @type {import('../../state/createState.js').StateInstance<{ price: Object|null, supportsOptions: string[], verticalSupportsOptions: string[], isLoading: boolean, error: string|null }>} */
const pageState = createState({
  price: null,
  supportsOptions: [],
  verticalSupportsOptions: [],
  isLoading: false,
  error: null,
});

// ===== PAGE MODULE =====

export const rackPage = createPageModule({
  id: PAGES.RACK,

  lifecycle: {
    onInit: async () => {
      try {
        pageState.updateField('isLoading', true);
        const price = await loadPrice();

        pageState.updateField('price', price);
        pageState.updateField('supportsOptions', Object.keys(price.supports || {}));
        pageState.updateField(
          'verticalSupportsOptions',
          Object.keys(price.vertical_supports || {}),
        );
        pageState.updateField('isLoading', false);
      } catch (error) {
        console.error('[RackPage] Failed to load price:', error);
        pageState.updateField('error', 'Не вдалося завантажити прайс');
        pageState.updateField('isLoading', false);
      }
    },
    /** Активація сторінки
     * @param {import('../../ui/createPageModule.js').PageDependencies} deps */
    onActivate: (deps) => {
      const { addListener } = deps;
      const { price, supportsOptions, verticalSupportsOptions } = pageState.get();

      // Перевірка наявності прайсу
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

      // ===== 3. POPULATE DROPDOWNS =====
      const populateDropdown = (selector, options, placeholder = 'Виберіть...') => {
        const el = document.querySelector(selector);
        if (!el) {
          return;
        }
        el.innerHTML = `
          <option value="" disabled selected>${placeholder}</option>
          ${options.map((opt) => `<option value="${opt}">${opt}</option>`).join('')}
        `;
      };

      populateDropdown(RACK_SELECTORS.form.supports, supportsOptions);
      populateDropdown(RACK_SELECTORS.form.verticalSupports, verticalSupportsOptions);

      // ===== 4. PAGE CONTEXT (ORCHESTRATOR) =====
      const page = createPageContext({
        features: { form, spans, results, rackSet },

        // Збір даних для розрахунку
        collectInputData: () => ({
          form: form.selectors.getForm(),
          spans: spans.selectors.getData(),
          price,
        }),

        // Pure calculator
        calculator: (data) => calculateRack(data),

        // Рендеринг результатів у DOM
        renderResult: (featureName, result) => {
          console.log('🚀 ~ featureName, result->', featureName, result);

          // Рендеримо тільки якщо змінилася форма або прольоти
          if (['form', 'spans'].includes(featureName) && result) {
            effects.batch([
              effects.setText('results', 'name', result.name),
              effects.setHTML('results', 'componentsTable', result.tableHtml),
              effects.setText('results', 'totalPrice', `${result.total.toFixed(2)} ₴`),
              effects.setState('results', 'componentsTable', result.total > 0 ? 'ready' : 'empty'),
              effects.setState('set', 'addToSetBtn', result.total > 0 ? 'ready' : 'disabled'),
              effects.setAttr('set', 'addToSetBtn', 'disabled', result.total > 0 ? null : ''),
            ]);
          }
        },

        // Коли потрібен перерахунок
        needsRecalculation: ({ feature, changes }) => ['form', 'spans'].includes(feature),

        // Обробник помилок
        onError: (error, context) => {
          console.error('[RackPage] Calculation error:', error, context);
          effects.setText('results', 'totalPrice', 'Помилка розрахунку');
        },
      });

      // ===== 5. INTERACTIVE ELEMENTS (AUTO-HANDLER) =====
      const pageContainer = document.querySelector(RACK_SELECTORS.page);
      const autoHandler = pageContainer
        ? createAutoHandler(pageContainer, { form, spans, results, rackSet })
        : { cleanup: () => {} };

      // ===== 6. ДОДАТКОВІ HANDLERS (якщо потрібні) =====
      // Наприклад, відкриття модалки комплекту
      const openModalBtn = document.querySelector(RACK_SELECTORS.set.openModalBtn);
      const openModalHandler = () => {
        if (openModalBtn) {
          openModalBtn.addEventListener('click', () => rackSet.actions.openModal());
        }
      };
      openModalHandler();

      // ===== 7. ЗАПУСК ОРКЕСТРАЦІЇ =====
      page.init();

      // ===== 8. CLEANUP =====
      return () => {
        page.destroy();
        autoHandler.cleanup();
        if (openModalBtn) {
          openModalBtn.removeEventListener('click', openModalHandler);
        }
      };
    },

    /** Деактивація сторінки  */
    onDeactivate: () => {
      // Додатковий cleanup якщо потрібен
    },
  },
});

export default rackPage;
