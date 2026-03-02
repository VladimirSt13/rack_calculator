// js/app/pages/battery/features/rackSet/context.js

import { log } from '../../../../config/env.js';
import { createFeatureContext } from '../../../../core/FeatureContext.js';
import { initialBatterySetState } from './state.js';

/**
 * Створює контекст комплекту стелажів для battery page
 * @returns {import('../../../../core/FeatureContext.js').FeatureContext}
 */
export const createBatteryRackSetContext = () =>
  createFeatureContext({
    name: 'batteryRackSet',
    initialState: initialBatterySetState,

    createActions: (state) => ({
      /**
       * Додати варіант до комплекту (об'єднати якщо вже існує)
       * @param {{ variant?: Object, qty?: number } | null} payload
       */
      addVariant: (payload) => {
        log('[BatterySet.addVariant] payload:', payload);
        const current = state.get();

        const variantData = payload?.variant;
        if (!variantData) {
          console.warn('[BatterySet.addVariant] No variant data provided');
          return;
        }

        const qty = payload?.qty ?? 1;

        // Генеруємо унікальний ID на основі абревіатури
        const id = variantData.name || `variant_${variantData.zeroBase || 0}`;
        const existing = current.variants.find((v) => v.id === id);

        if (existing) {
          // Якщо вже існує — збільшуємо кількість
          const newVariants = current.variants.map((v) =>
            v.id === id ? { ...v, qty: v.qty + qty } : v
          );
          state.updateField('variants', newVariants);
        } else {
          // Додаємо новий варіант
          state.updateField('variants', [
            ...current.variants,
            {
              id,
              variant: structuredClone(variantData),
              qty,
            },
          ]);
        }
      },

      /**
       * Видалити варіант з комплекту за ID
       * @param {string} id
       */
      removeVariant: (id) => {
        const current = state.get();
        state.updateField(
          'variants',
          current.variants.filter((v) => v.id !== id)
        );
      },

      /**
       * Оновити кількість варіанту
       * @param {string} id
       * @param {number} qty
       */
      updateQty: (id, qty) => {
        if (qty <= 0) {
          const current = state.get();
          return state.updateField(
            'variants',
            current.variants.filter((v) => v.id !== id)
          );
        }
        const current = state.get();
        state.updateField(
          'variants',
          current.variants.map((v) => (v.id === id ? { ...v, qty } : v))
        );
      },

      /**
       * Збільшити кількість варіанту на 1
       * @param {string} id
       */
      increaseQty: (id) => {
        const current = state.get();
        const variant = current.variants.find((v) => v.id === id);
        if (variant) {
          state.updateField(
            'variants',
            current.variants.map((v) => (v.id === id ? { ...v, qty: v.qty + 1 } : v))
          );
        }
      },

      /**
       * Зменшити кількість варіанту на 1
       * @param {string} id
       */
      decreaseQty: (id) => {
        const current = state.get();
        const variant = current.variants.find((v) => v.id === id);
        if (variant && variant.qty > 1) {
          state.updateField(
            'variants',
            current.variants.map((v) => (v.id === id ? { ...v, qty: v.qty - 1 } : v))
          );
        }
      },

      /**
       * Очистити весь комплект
       */
      clear: () => {
        state.updateField('variants', []);
      },
    }),

    createSelectors: (state) => ({
      /**
       * Отримати всі варіанти в комплекті
       * @returns {BatteryVariantInSet[]}
       */
      getVariants: () => state.get().variants,

      /**
       * Отримати кількість унікальних варіантів
       * @returns {number}
       */
      getCount: () => state.get().variants.length,

      /**
       * Отримати загальну кількість варіантів (сума qty)
       * @returns {number}
       */
      getTotalItems: () => state.get().variants.reduce((sum, v) => sum + v.qty, 0),

      /**
       * Отримати загальну вартість комплекту (розраховується по нульових цінах)
       * @returns {number}
       */
      getTotalCost: () =>
        state.get().variants.reduce((sum, v) => sum + (v.variant?.zeroBase || 0) * v.qty, 0),

      /**
       * Перевірити чи комплект порожній
       * @returns {boolean}
       */
      isEmpty: () => state.get().variants.length === 0,

      /**
       * Отримати варіант за ID
       * @param {string} id
       * @returns {BatteryVariantInSet | undefined}
       */
      getVariantById: (id) => state.get().variants.find((v) => v.id === id),

      /**
       * Отримати дані для PageContext.collectInputData()
       * @returns {BatterySetState}
       */
      getData: () => state.get(),
    }),
  });

export default createBatteryRackSetContext;
