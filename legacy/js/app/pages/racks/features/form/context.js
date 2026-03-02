// @ts-check
// js/app/pages/racks/features/form/context.js

import { createFeatureContext } from '../../../../core/FeatureContext.js';
import { initialFormState } from './state.js';
import { log } from '../../../../config/env.js';

/**
 * @typedef {import('./state.js').FormState} FormState
 */

/**
 * Створює контекст форми стелажа
 * @returns {import('../../../../core/FeatureContext.js').FeatureContext<{ form: FormState }>}
 */
export const createRackFormContext = () =>
  createFeatureContext({
    name: 'form',
    initialState: { form: initialFormState },

    /**
     * Actions: функції для модифікації стану
     * @param {import('../../../../core/createState.js').StateInstance<{ form: FormState }>} state
     */
    createActions: (state) => ({
      /**
       * Оновити одне поле форми
       * @param {keyof FormState} field - назва поля ('floors', 'supports', тощо)
       * @param {any} value - нове значення
       */
      updateField: (field, value) => {
        log('[Form]', `${field} =`, value);
        state.updateNestedField('form', { [field]: value });
      },

      /**
       * Оновити кілька полів одночасно
       * @param {Partial<FormState>} patch - об'єкт з полями для оновлення
       */
      updateFields: (patch) => {
        state.updateNestedField('form', patch);
      },

      /**
       * Скинути форму до початкового стану
       */
      reset: () => {
        state.set({ form: initialFormState });
      },
    }),

    /**
     * Selectors: функції для читання стану
     * @param {import('../../../../core/createState.js').StateInstance<{ form: FormState }>} state
     */
    createSelectors: (state) => ({
      /**
       * Отримати повний стан форми
       * @returns {FormState}
       */
      getForm: () => state.get().form,

      /**
       * Отримати значення конкретного поля
       * @param {keyof FormState} field
       * @returns {any}
       */
      getField: (field) => state.get().form?.[field],

      /**
       * Перевірити валідність форми для розрахунку
       * @returns {boolean}
       */
      isValid: () => {
        const form = state.get().form;
        // Обов'язкові поля для розрахунку
        return !!(
          form?.floors &&
          form?.rows &&
          form?.supports &&
          form?.beamsPerRow &&
          // Вертикальні опори потрібні тільки якщо поверхів > 1
          (form.floors === 1 || form.verticalSupports)
        );
      },

      /**
       * Отримати дані для PageContext.collectInputData()
       * @returns {{ form: FormState }}
       */
      getData: () => state.get(),
    }),
  });

export default createRackFormContext;
