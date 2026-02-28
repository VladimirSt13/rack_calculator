// js/app/pages/battery/features/form/context.js
import { createFeatureContext } from '../../../../core/FeatureContext.js';
import { initialBatteryFormState } from './state.js';

/**
 * Створює FeatureContext для форми battery
 * @param {Function} onCalculate - callback для розрахунку
 * @returns {Object} batteryFormContext
 */
export const createBatteryFormContext = (onCalculate) =>
  createFeatureContext({
    name: 'batteryForm',
    initialState: { form: initialBatteryFormState },
    createActions: (state) => ({
      /**
       * Оновити поле форми
       * @param {string} field - назва поля
       * @param {number} value - значення
       */
      updateField: (field, value) => state.updateNestedField('form', { [field]: value }),

      /**
       * Оновити кілька полів одночасно
       * @param {Object} fields - об'єкт з полями
       */
      updateFields: (fields) => state.updateNestedField('form', fields),

      /**
       * Скинути форму до початкового стану
       */
      reset: () => state.set({ form: initialBatteryFormState }),

      /**
       * Запустити розрахунок (використовується InteractiveElement)
       */
      calculate: () => {
        // Викликаємо callback для розрахунку
        if (onCalculate) {
          onCalculate();
        }
      },
    }),
    createSelectors: (state) => ({
      /**
       * Отримати всі значення форми
       * @returns {Object}
       */
      getForm: () => state.get().form,

      /**
       * Отримати значення поля
       * @param {string} field
       * @returns {number}
       */
      getField: (field) => state.get().form[field],
    }),
  });
