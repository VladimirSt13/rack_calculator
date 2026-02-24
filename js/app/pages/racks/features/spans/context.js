// js/app/pages/racks/features/spans/context.js

import { createFeatureContext } from '../../../../core/FeatureContext.js';
import { initialSpansState } from './state.js';

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

    createActions: (state) => ({
      /**
       * Додати новий проліт з унікальним ID
       * @returns {number} ID нового прольоту
       */
      addSpan: () => {
        const current = state.get();
        const id = current.nextId;
        const newSpans = new Map(current.spans);
        newSpans.set(id, { item: '', quantity: null });

        state.set({
          spans: newSpans,
          nextId: id + 1,
        });

        return id;
      },

      /**
       * Видалити проліт за ID
       * @param {number} id
       */
      removeSpan: (id) => {
        const current = state.get();
        const newSpans = new Map(current.spans);
        newSpans.delete(id);
        state.updateField('spans', newSpans);
      },

      /**
       * Оновити поле прольоту (item або quantity)
       * @param {number} id
       * @param {'item'|'quantity'} field
       * @param {string|number|null} value
       */
      updateSpan: (id, field, value) => {
        const current = state.get();
        const span = current.spans.get(id);
        if (!span) {
          return;
        }

        const newSpans = new Map(current.spans);
        newSpans.set(id, { ...span, [field]: value });
        state.updateField('spans', newSpans);
      },

      /**
       * Очистити всі прольоти
       */
      clear: () => {
        state.set({ spans: new Map(), nextId: 1 });
      },
    }),

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
    }),
  });

export default createSpansContext;
