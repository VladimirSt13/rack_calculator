// js/app/pages/racks/features/rackSet/context.js

import { log } from '../../../../config/env.js';
import { createFeatureContext } from '../../../../core/FeatureContext.js';
import { initialSetState } from './state.js';

/**
 * @typedef {import('./state.js').RackInSet} RackInSet
 * @typedef {import('./state.js').SetState} SetState
 */

/**
 * Створює контекст комплекту стелажів
 * @returns {import('../../../../core/FeatureContext.js').FeatureContext<SetState>}
 */
export const createRackSetContext = () =>
  createFeatureContext({
    name: 'set',
    initialState: initialSetState,

    createActions: (state) => ({
      /**
       * Додати стелаж до комплекту (об'єднати якщо вже існує)
       * @param {{ rack?: import('../results/state.js').ResultsState, formConfig?: import('../form/state.js').FormState, qty?: number } | null} payload
       */
      addRack: (payload) => {
        log('[Set.addRack] payload:', payload);
        const current = state.get();

        // Отримуємо дані з payload
        const rackData = payload?.rack;
        const formConfig = payload?.formConfig;

        if (!rackData) {
          console.warn('[Set.addRack] No rack data provided');
          return;
        }

        const qty = payload?.qty ?? 1;

        // Генеруємо унікальний ID на основі характеристик стелажа
        const id =
          rackData.name || `${rackData.components?.supports?.name || 'rack'}_${rackData.total}`;
        const existing = current.racks.find((r) => r.id === id);

        if (existing) {
          // Якщо вже існує — збільшуємо кількість
          const newRacks = current.racks.map((r) => (r.id === id ? { ...r, qty: r.qty + qty } : r));
          state.updateField('racks', newRacks);
        } else {
          // Додаємо новий стелаж з formConfig
          state.updateField('racks', [
            ...current.racks,
            {
              id,
              rack: structuredClone(rackData),
              formConfig: formConfig ? structuredClone(formConfig) : null,
              qty,
            },
          ]);
        }
      },

      /**
       * Видалити стелаж з комплекту за ID
       * @param {string} id
       */
      removeRack: (id) => {
        const current = state.get();
        state.updateField(
          'racks',
          current.racks.filter((r) => r.id !== id),
        );
      },

      /**
       * Оновити кількість стелажа
       * @param {string} id
       * @param {number} qty
       */
      updateQty: (id, qty) => {
        if (qty <= 0) {
          const current = state.get();
          return state.updateField(
            'racks',
            current.racks.filter((r) => r.id !== id),
          );
        }
        const current = state.get();
        state.updateField(
          'racks',
          current.racks.map((r) => (r.id === id ? { ...r, qty } : r)),
        );
      },

      /**
       * Збільшити кількість стелажа на 1
       * @param {string} id
       */
      increaseQty: (id) => {
        const current = state.get();
        const rack = current.racks.find((r) => r.id === id);
        if (rack) {
          state.updateField(
            'racks',
            current.racks.map((r) => (r.id === id ? { ...r, qty: r.qty + 1 } : r)),
          );
        }
      },

      /**
       * Зменшити кількість стелажа на 1
       * @param {string} id
       */
      decreaseQty: (id) => {
        const current = state.get();
        const rack = current.racks.find((r) => r.id === id);
        if (rack && rack.qty > 1) {
          state.updateField(
            'racks',
            current.racks.map((r) => (r.id === id ? { ...r, qty: r.qty - 1 } : r)),
          );
        }
      },

      /**
       * Очистити весь комплект
       */
      clear: () => {
        state.updateField('racks', []);
      },
    }),

    createSelectors: (state) => ({
      /**
       * Отримати всі стелажі в комплекті
       * @returns {RackInSet[]}
       */
      getRacks: () => state.get().racks,

      /**
       * Отримати кількість унікальних стелажів
       * @returns {number}
       */
      getCount: () => state.get().racks.length,

      /**
       * Отримати загальну кількість стелажів (сума qty)
       * @returns {number}
       */
      getTotalItems: () => state.get().racks.reduce((sum, r) => sum + r.qty, 0),

      /**
       * Отримати загальну вартість комплекту (розраховується по нульових цінах)
       * @returns {number}
       */
      getTotalCost: () =>
        state.get().racks.reduce((sum, r) => sum + (r.rack?.zeroBase || 0) * r.qty, 0),

      /**
       * Перевірити чи комплект порожній
       * @returns {boolean}
       */
      isEmpty: () => state.get().racks.length === 0,

      /**
       * Отримати стелаж за ID
       * @param {string} id
       * @returns {RackInSet | undefined}
       */
      getRackById: (id) => state.get().racks.find((r) => r.id === id),

      /**
       * Отримати дані для PageContext.collectInputData()
       * @returns {SetState}
       */
      getData: () => state.get(),
    }),
  });

export default createRackSetContext;
