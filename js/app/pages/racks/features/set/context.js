// js/app/pages/racks/features/set/context.js

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
       * @param {{ rack?: import('../results/state.js').ResultsState, qty?: number } | null} payload
       */
      addRack: (payload) => {
        const current = state.get();
        
        // Отримуємо дані з payload
        const rackData = payload?.rack;
        
        if (!rackData) {
          console.warn('[Set.addRack] No rack data provided');
          return;
        }

        const qty = payload?.qty ?? 1;

        // Генеруємо унікальний ID на основі характеристик стелажа
        const id = rackData.name || `${rackData.components?.supports?.name || 'rack'}_${rackData.total}`;
        const existing = current.racks.find((r) => r.id === id);

        if (existing) {
          // Якщо вже існує — збільшуємо кількість
          const newRacks = current.racks.map((r) => (r.id === id ? { ...r, qty: r.qty + qty } : r));
          state.updateField('racks', newRacks);
        } else {
          // Додаємо новий стелаж
          state.updateField('racks', [...current.racks, { id, rack: structuredClone(rackData), qty }]);
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
       * Очистити весь комплект
       */
      clear: () => {
        state.updateField('racks', []);
      },

      /**
       * Відкрити модалку перегляду комплекту
       */
      openModal: () => {
        state.updateField('isModalOpen', true);
      },

      /**
       * Закрити модалку
       */
      closeModal: () => {
        state.updateField('isModalOpen', false);
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
       * Отримати загальну вартість комплекту
       * @returns {number}
       */
      getTotalCost: () =>
        state.get().racks.reduce((sum, r) => sum + (r.rack?.total || 0) * r.qty, 0),

      /**
       * Перевірити чи комплект порожній
       * @returns {boolean}
       */
      isEmpty: () => state.get().racks.length === 0,

      /**
       * Перевірити чи відкрита модалка
       * @returns {boolean}
       */
      isModalOpen: () => state.get().isModalOpen,

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
