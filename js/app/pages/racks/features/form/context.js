// js/app/pages/racks/features/form/context.js

import { createFeatureContext } from '../../../../core/FeatureContext.js';
import { initialFormState } from './state.js';

export const createRackFormContext = () =>
  createFeatureContext({
    name: 'form',
    initialState: { form: initialFormState },

    createActions: (state) => ({
      updateField: (field, value) => {
        state.updateNestedField('form', { [field]: value });
      },
      updateFields: (patch) => {
        state.updateNestedField('form', patch);
      },
      reset: () => {
        state.set({ form: initialFormState });
      },
    }),

    createSelectors: (state) => ({
      getForm: () => state.get().form,
      getField: (field) => state.get().form?.[field],
      isValid: () => {
        const form = state.get().form;
        return !!(form?.floors && form?.rows && form?.supports && form?.beamsPerRow);
      },
      getData: () => state.get(),
    }),
  });

export default createRackFormContext;
