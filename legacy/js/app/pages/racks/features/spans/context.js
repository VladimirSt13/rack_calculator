// @ts-check
// js/app/pages/racks/features/spans/context.js

import { createFeatureContext } from '../../../../core/FeatureContext.js';
import { initialSpansState } from './state.js';
import { log } from '../../../../config/env.js';

/**
 * Максимальна кількість прольотів
 * @type {number}
 */
const MAX_SPANS = 8;

/**
 * @typedef {import('./state.js').SpanItem} SpanItem
 * @typedef {import('./state.js').SpansState} SpansState
 */

/**
 * Створює контекст прольотів стелажа
 * @returns {import('../../../../core/FeatureContext.js').FeatureContext<SpansState>}
 */
export const createSpansContext = () =>
  createFeatureContext({
    name: 'spans',
    initialState: initialSpansState,

    /**
     * Actions: функції для модифікації стану
     * @param {import('../../../../core/createState.js').StateInstance<SpansState>} state
     */
    createActions: (state) => ({
      /**
       * Додати новий проліт з унікальним ID
       * @param {{ id?: number }} [options] - опціональний ID (для тестів)
       * @returns {number | null} ID нового прольоту або null якщо досягнуто ліміту
       */
      addSpan: (options = {}) => {
        const current = state.get();

        // Перевірка ліміту
        if (current.spans.size >= MAX_SPANS) {
          log('[Spans]', 'addSpan: max limit reached', { max: MAX_SPANS, current: current.spans.size });
          return null;
        }

        const id = options.id ?? current.nextId;
        const newSpans = new Map(current.spans);

        log('[Spans]', 'addSpan:', { id, item: '', quantity: null });

        newSpans.set(id, { item: '', quantity: null });

        state.set({
          spans: newSpans,
          nextId: options.id ? current.nextId : id + 1,
        });

        return id;
      },

      /**
       * Видалити проліт за ID
       * @param {number|string} id
       */
      removeSpan: (id) => {
        // ✅ FIX: конвертуємо в число
        const numericId = typeof id === 'string' ? Number(id) : id;
        const current = state.get();
        const newSpans = new Map(current.spans);

        log('[Spans]', 'removeSpan:', numericId);

        newSpans.delete(numericId);
        state.updateField('spans', newSpans);
      },

      /**
       * Оновити поле прольоту (item або quantity)
       * @param {number|string} id
       * @param {'item'|'quantity'} field
       * @param {string|number|null} value
       */
      updateSpan: (id, field, value) => {
        // ✅ FIX: конвертуємо в число
        const numericId = typeof id === 'string' ? Number(id) : id;

        const current = state.get();
        const span = current.spans.get(numericId);

        if (!span) {
          log('[Spans]', 'updateSpan: span not found', { id: numericId, field, value });
          return;
        }

        log('[Spans]', 'updateSpan:', { id: numericId, field, value });

        const newSpans = new Map(current.spans);
        newSpans.set(numericId, { ...span, [field]: value });
        state.updateField('spans', newSpans);
      },

      /**
       * Очистити всі прольоти
       */
      clear: () => {
        log('[Spans]', 'clear()');
        state.set({ spans: new Map(), nextId: 1 });
      },
    }),

    /**
     * Selectors: функції для читання стану
     * @param {import('../../../../core/createState.js').StateInstance<SpansState>} state
     */
    createSelectors: (state) => ({
      /**
       * Отримати всі прольоти як Map
       * @returns {Map<number, SpanItem>}
       */
      getSpans: () => state.get().spans,

      /**
       * Отримати прольоти як масив для calculator
       * @returns {Array<{ id: number, item: string, quantity: number|null }>}
       */
      getSpansArray: () => {
        const spans = state.get().spans;
        return Array.from(spans.entries()).map(([id, data]) => ({ id, ...data }));
      },

      /**
       * Отримати проліт за ID
       * @param {number} id
       * @returns {SpanItem | undefined}
       */
      getSpanById: (id) => state.get().spans.get(id),

      /**
       * Отримати наступний доступний ID
       * @returns {number}
       */
      getNextId: () => state.get().nextId,

      /**
       * Отримати кількість прольотів
       * @returns {number}
       */
      getCount: () => state.get().spans.size,

      /**
       * Отримати дані для PageContext.collectInputData()
       * @returns {SpansState}
       */
      getData: () => state.get(),

      /**
       * Перевірити чи є хоча б один валідний проліт
       * @returns {boolean}
       */
      hasValidSpans: () => {
        const spans = state.get().spans;
        return Array.from(spans.values()).some((s) => s.item && s.quantity && s.quantity > 0);
      },

      /**
       * Перевірити чи досягнуто ліміту прольотів
       * @returns {boolean}
       */
      isMaxSpansReached: () => state.get().spans.size >= MAX_SPANS,

      /**
       * Отримати максимальну кількість прольотів
       * @returns {number}
       */
      getMaxSpans: () => MAX_SPANS,
    }),
  });

export default createSpansContext;
