// js/app/pages/racks/page.js

import { PAGES } from '../../config/app.config.js';
import { createPageModule } from '../../ui/createPageModule.js';
import { createState } from '../../core/createState.js';
import { createPageContext } from '../../core/PageContext.js';
import { createEffectRegistry } from '../../core/EffectRegistry.js';
import { createAutoHandler } from '../../core/InteractiveElement.js';
import { loadPrice } from './features//priceState.js';
import { RACK_SELECTORS } from '../../config/selectors.js';

// DOM effects
import { query, toggleClass } from '../../effects/dom.js';

// Feature contexts
import { createRackFormContext } from './features/form/context.js';
import { createSpansContext } from './features/spans/context.js';
import { createRackResultsContext } from './features/results/context.js';
import { createRackSetContext } from './features/set/context.js';

// Calculator
import { calculateRack } from './core/calculator.js';

// Effects
import { renderRackResults } from './effects/renderResults.js';

import { log } from '../../config/env.js';

import {
  appendSpanRow,
  removeSpanRow,
  renderAllSpans,
  updateSpanRow,
} from './features/spans/domUtils.js';

// ===== PAGE-LEVEL STATE =====

/**
 * @typedef {Object} RackPageState
 * @property {Object|null} price
 * @property {string[]} supportsOptions
 * @property {string[]} verticalSupportsOptions
 * @property {string[]} spanOptions
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/** @type {import('../../core/createState.js').StateInstance<RackPageState>} */
const pageState = createState({
  price: null,
  supportsOptions: [],
  verticalSupportsOptions: [],
  spanOptions: [],
  isLoading: false,
  error: null,
});

const _pageState = new WeakMap();

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
        pageState.updateField('spanOptions', Object.keys(price.spans || {}));
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

      // ===== 3. POPULATE DROPDOWNS =====
      const populateDropdown = (selector, options, placeholder = 'Виберіть...') => {
        const el = query(selector)();
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

      // ===== 4. RENDER SPANS CONTAINER =====
      const spansContainer = query(RACK_SELECTORS.spans.container)();

      if (spansContainer) {
        renderAllSpans(spansContainer, spans.selectors.getSpans(), spanOptions);
      }

      const spansUnsubscribe = spans.subscribe((newState) => {
        if (!spansContainer) {
          return;
        }

        const prevSpans = _pageState.get(rackPage)?.prevSpans || new Map();
        const currSpans = newState.spans;

        // Додані або змінені прольоти
        for (const [id, span] of currSpans.entries()) {
          const prevSpan = prevSpans.get(id);

          if (!prevSpan) {
            appendSpanRow(spansContainer, id, span, spanOptions);
          } else if (prevSpan.item !== span.item || prevSpan.quantity !== span.quantity) {
            updateSpanRow(spansContainer, id, span, spanOptions);
          }
        }

        // Видалені прольоти
        for (const id of prevSpans.keys()) {
          if (!currSpans.has(id)) {
            removeSpanRow(spansContainer, id);
          }
        }

        // Оновлення стану кнопки додавання
        const addSpanBtn = query(RACK_SELECTORS.spans.addBtn)();
        if (addSpanBtn) {
          const isMaxReached = spans.selectors.isMaxSpansReached();
          addSpanBtn.disabled = isMaxReached;
          addSpanBtn.setAttribute('aria-disabled', String(isMaxReached));
          toggleClass(addSpanBtn, 'btn--disabled', isMaxReached)();
        }

        // Зберегти поточний стан для наступного порівняння
        _pageState.set(rackPage, {
          isActivated: true,
          prevSpans: new Map(currSpans),
        });

        log('[RackPage]', 'Spans DOM updated granularly');
      });

      // ===== 5. PAGE CONTEXT (ORCHESTRATOR) =====
      const page = createPageContext({
        features: { form, spans, results, rackSet },
        collectInputData: () => ({
          form: form.selectors.getForm(),
          spans: spans.selectors.getData(),
          price,
        }),
        calculator: (data) => calculateRack({ ...data, price }),
        renderResult: (featureName, result) => {
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

      // ===== 6. VERTICAL SUPPORTS BLOCKING LOGIC =====
      const verticalSupportsEl = query(RACK_SELECTORS.form.verticalSupports)();

      const updateVerticalSupportsState = () => {
        const floors = form.selectors.getField('floors');
        if (!verticalSupportsEl) {
          return;
        }

        if (floors === 1) {
          // Скидаємо значення і блокуємо
          verticalSupportsEl.value = '';
          verticalSupportsEl.disabled = true;
        } else {
          // Розблоковуємо
          verticalSupportsEl.disabled = false;
        }
      };

      // Початковий стан
      updateVerticalSupportsState();

      // Підписка на зміни форми
      const formUnsubscribe = form.subscribe((newState) => {
        if (newState.form?.floors !== undefined) {
          updateVerticalSupportsState();
        }
      });

      // ===== 6. INTERACTIVE ELEMENTS (AUTO-HANDLER) =====
      const pageContainer = query(RACK_SELECTORS.page)();
      const autoHandler = pageContainer
        ? createAutoHandler(pageContainer, { form, spans, results, rackSet })
        : { cleanup: () => {} };

      // ===== 6.5. CUSTOM HANDLER FOR ADD TO SET BUTTON =====
      const addToSetBtn = query(RACK_SELECTORS.results.addToSetBtn)();
      const handleAddToSet = () => {
        const rackData = results.selectors.getRack();
        if (rackData && rackData.total > 0) {
          rackSet.actions.addRack({ rack: rackData });
        }
      };

      if (addToSetBtn) {
        addListener('click', handleAddToSet);
      }

      // ===== 7. ЗАПУСК ОРКЕСТРАЦІЇ =====
      page.init();

      // ===== 8. CLEANUP =====
      return () => {
        page.destroy();
        autoHandler.cleanup();
        spansUnsubscribe?.();
        formUnsubscribe?.();
        if (addToSetBtn) {
          addToSetBtn.removeEventListener('click', handleAddToSet);
        }
        _pageState.delete(rackPage);
      };
    },

    onDeactivate: () => {
      log('[RackPage]', 'Deactivated');
    },
  },
});

export default rackPage;
