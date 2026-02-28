// js/app/pages/battery/features/form/validateForm.js

/**
 * Валідує дані форми battery
 * @param {Object} values - значення форми
 * @returns {{ valid: boolean, errors: Object, values: Object }}
 */
export const validateBatteryForm = (values) => {
  const errors = {};

  if (!values.length || values.length <= 0) {
    errors.length = 'Довжина повинна бути більше 0';
  }
  if (!values.width || values.width <= 0) {
    errors.width = 'Ширина повинна бути більше 0';
  }
  if (!values.height || values.height <= 0) {
    errors.height = 'Висота повинна бути більше 0';
  }
  if (!values.weight || values.weight <= 0) {
    errors.weight = 'Вага повинна бути більше 0';
  }
  if (values.gap < 0) {
    errors.gap = 'Відстань не може бути від\'ємною';
  }
  if (!values.count || values.count < 1) {
    errors.count = 'Кількість повинна бути щонайменше 1';
  }

  return {
    valid: errors.length === 0,
    errors,
    values,
  };
};

/**
 * Отримує значення форми з DOM
 * @param {Object} selectors - селектори форми (BATTERY_SELECTORS.form)
 * @param {Object} effects - EffectRegistry (опціонально)
 * @returns {Object}
 */
export const getFormValuesFromDOM = (selectors, effects = null) => {
  const getEl = (name) => effects ? effects.get('form', name) : document.querySelector(selectors[name]);

  return {
    length: Number(getEl('length')?.value) || 0,
    width: Number(getEl('width')?.value) || 0,
    height: Number(getEl('height')?.value) || 0,
    weight: Number(getEl('weight')?.value) || 0,
    gap: Number(getEl('gap')?.value) || 0,
    count: Number(getEl('count')?.value) || 1,
  };
};

/**
 * Встановлює значення форми в DOM
 * @param {Object} values
 * @param {Object} selectors
 * @param {Object} effects - EffectRegistry
 */
export const setFormValuesToDOM = (values, selectors, effects) => {
  if (!effects) {
    // Fallback без effects
    const fields = ['length', 'width', 'height', 'weight', 'gap', 'count'];
    const defaults = { length: 0, width: 0, height: 0, weight: 0, gap: 0, count: 1 };

    fields.forEach((field) => {
      const el = document.querySelector(selectors[field]);
      if (el) el.value = values[field] ?? defaults[field];
    });
    return;
  }

  // Batch з effects - всі зміни в одному requestAnimationFrame
  effects.batch([
    () => {
      const el = effects.get('form', 'length');
      if (el) el.value = values.length ?? 0;
    },
    () => {
      const el = effects.get('form', 'width');
      if (el) el.value = values.width ?? 0;
    },
    () => {
      const el = effects.get('form', 'height');
      if (el) el.value = values.height ?? 0;
    },
    () => {
      const el = effects.get('form', 'weight');
      if (el) el.value = values.weight ?? 0;
    },
    () => {
      const el = effects.get('form', 'gap');
      if (el) el.value = values.gap ?? 0;
    },
    () => {
      const el = effects.get('form', 'count');
      if (el) el.value = values.count ?? 1;
    },
  ]);
};

/**
 * Підсвічує помилки у формі
 * @param {Object} errors
 * @param {Object} selectors
 * @param {Object} effects - EffectRegistry
 */
export const renderFormErrors = (errors, selectors, effects) => {
  if (!effects) {
    // Fallback без effects
    Object.values(selectors).forEach((selector) => {
      const el = document.querySelector(selector);
      if (el && el.tagName === 'INPUT') {
        el.classList.remove('error');
        el.removeAttribute('title');
      }
    });

    for (const [field, message] of Object.entries(errors)) {
      const el = document.querySelector(selectors[field]);
      if (el) {
        el.classList.add('error');
        el.setAttribute('title', message);
      }
    }
    return;
  }

  // Очищаємо всі поля спочатку
  const clearEffects = Object.keys(selectors).map((field) => () => {
    const el = effects.get('form', field);
    if (el && el.tagName === 'INPUT') {
      el.classList.remove('error');
      el.removeAttribute('title');
    }
    return true;
  });

  // Додаємо помилки
  const errorEffects = Object.entries(errors).map(([field, message]) => () => {
    const el = effects.get('form', field);
    if (el) {
      el.classList.add('error');
      el.setAttribute('title', message);
    }
    return true;
  });

  // Виконуємо всі операції в одному batch
  effects.batch([...clearEffects, ...errorEffects]);
};
