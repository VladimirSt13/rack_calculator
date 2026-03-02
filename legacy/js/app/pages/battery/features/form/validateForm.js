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
  if (!values.rows || ![1, 2].includes(values.rows)) {
    errors.rows = 'Кількість рядів: 1 або 2';
  }
  if (!values.floors || ![1, 2, 3].includes(values.floors)) {
    errors.floors = 'Кількість поверхів: 1, 2 або 3';
  }
  if (!values.supportType || !['straight', 'step'].includes(values.supportType)) {
    errors.supportType = 'Тип опори: пряма або ступінчата';
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
    rows: Number(getEl('rows')?.value) || 1,
    floors: Number(getEl('floors')?.value) || 1,
    supportType: getEl('supportType')?.value || 'straight',
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
    const fields = ['length', 'width', 'height', 'weight', 'gap', 'count', 'rows', 'floors', 'supportType'];
    const defaults = { 
      length: 0, width: 0, height: 0, weight: 0, gap: 0, count: 1,
      rows: 1, floors: 1, supportType: 'straight'
    };

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
    () => {
      const el = effects.get('form', 'rows');
      if (el) el.value = values.rows ?? 1;
    },
    () => {
      const el = effects.get('form', 'floors');
      if (el) el.value = values.floors ?? 1;
    },
    () => {
      const el = effects.get('form', 'supportType');
      if (el) el.value = values.supportType ?? 'straight';
    },
  ]);
};

/**
 * Заповнює селекти опціями з конфігурації
 * @param {Object} config - конфігурація форми (formConfig з batteryPageState)
 * @param {Object} selectors - BATTERY_SELECTORS.form
 * @param {Object} effects - EffectRegistry
 */
export const populateFormSelects = (config, selectors, effects) => {
  if (!config) {
    console.warn('[populateFormSelects] No config provided');
    return;
  }

  const { rows, floors, supportType } = config;

  if (!effects) {
    // Fallback без effects
    const fillSelect = (selector, options, defaultValue) => {
      const el = document.querySelector(selector);
      if (el) {
        el.innerHTML = options
          .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
          .join('');
        el.value = defaultValue;
      }
    };

    fillSelect(selectors.rows, rows.options, rows.default);
    fillSelect(selectors.floors, floors.options, floors.default);
    fillSelect(selectors.supportType, supportType.options, supportType.default);
    return;
  }

  // Batch з effects
  effects.batch([
    () => {
      const el = effects.get('form', 'rows');
      if (el) {
        el.innerHTML = rows.options
          .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
          .join('');
        el.value = rows.default;
      }
    },
    () => {
      const el = effects.get('form', 'floors');
      if (el) {
        el.innerHTML = floors.options
          .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
          .join('');
        el.value = floors.default;
      }
    },
    () => {
      const el = effects.get('form', 'supportType');
      if (el) {
        el.innerHTML = supportType.options
          .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
          .join('');
        el.value = supportType.default;
      }
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
      if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT')) {
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
    if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT')) {
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
