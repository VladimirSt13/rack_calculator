// js/app/config/states.js

/**
 * Централізовані константи станів для додатку
 * Використовуються для уніфікації data-state атрибутів
 *
 * Приклад використання:
 * import { STATE, UI_STATE, FORM_STATE } from '../config/states.js';
 * setState(element, STATE.EMPTY);
 */

// ===== ЗАГАЛЬНІ СТАНИ ЕЛЕМЕНТІВ =====
export const STATE = {
  /** Немає даних для відображення */
  EMPTY: 'empty',

  /** Елемент готовий до взаємодії */
  READY: 'ready',

  /** Триває обчислення/завантаження */
  LOADING: 'loading',

  /** Сталася помилка */
  ERROR: 'error',

  /** Елемент неактивний */
  DISABLED: 'disabled',

  /** Елемент активний */
  ACTIVE: 'active',

  /** Елемент прихований */
  HIDDEN: 'hidden',

  /** Елемент видимий */
  VISIBLE: 'visible',

  /** Успішне завершення операції */
  SUCCESS: 'success',

  /** Попередження/попереджувальний стан */
  WARNING: 'warning',
};

// ===== СТАНИ МОДАЛЬНИХ ВІКОН =====
export const MODAL_STATE = {
  /** Модалка закрита */
  CLOSED: 'closed',

  /** Модалка відкрита */
  OPEN: 'open',

  /** Модалка у процесі закриття (анімація) */
  CLOSING: 'closing',

  /** Модалка у процесі відкриття (анімація) */
  OPENING: 'opening',
};

// ===== СТАНИ ФОРМ =====
export const FORM_STATE = {
  /** Форма чиста (не заповнена) */
  PRISTINE: 'pristine',

  /** Форма змінена користувачем */
  DIRTY: 'dirty',

  /** Форма валідується */
  VALIDATING: 'validating',

  /** Форма валідна */
  VALID: 'valid',

  /** Форма невалідна */
  INVALID: 'invalid',

  /** Форма відправлена */
  SUBMITTED: 'submitted',

  /** Форма відправлена успішно */
  SUBMITTED_SUCCESS: 'submitted-success',

  /** Форма відправлена з помилкою */
  SUBMITTED_ERROR: 'submitted-error',
};

// ===== СТАНИ ТАБЛИЦЬ/СПИСКІВ =====
export const TABLE_STATE = {
  /** Немає даних */
  EMPTY: 'empty',

  /** Дані завантажуються */
  LOADING: 'loading',

  /** Дані завантажені */
  READY: 'ready',

  /** Помилка завантаження */
  ERROR: 'error',

  /** Дані фільтруються */
  FILTERING: 'filtering',

  /** Немає результатів фільтрації */
  NO_RESULTS: 'no-results',
};

// ===== СТАНИ КНОПОК =====
export const BUTTON_STATE = {
  /** Кнопка активна */
  READY: 'ready',

  /** Кнопка неактивна */
  DISABLED: 'disabled',

  /** Кнопка у процесі виконання */
  LOADING: 'loading',

  /** Кнопка натиснута */
  PRESSED: 'pressed',

  /** Кнопка у фокусі */
  FOCUSED: 'focused',
};

// ===== СТАНИ СЕКЦІЙ/СТОРІНОК =====
export const SECTION_STATE = {
  /** Секція активна/видима */
  ACTIVE: 'active',

  /** Секція неактивна/прихована */
  INACTIVE: 'inactive',

  /** Секція завантажується */
  LOADING: 'loading',

  /** Секція готова */
  READY: 'ready',
};

// ===== СТАНИ РОЗРАХУНКУ (специфічно для калькулятора) =====
export const CALC_STATE = {
  /** Розрахунок ще не виконувався */
  IDLE: 'idle',

  /** Триває розрахунок */
  CALCULATING: 'calculating',

  /** Розрахунок завершено успішно */
  CALCULATED: 'calculated',

  /** Розрахунок неможливий (недостатньо даних) */
  INSUFFICIENT_DATA: 'insufficient-data',

  /** Помилка розрахунку */
  CALCULATION_ERROR: 'calculation-error',
};

// ===== МАПА СТАНІВ ДЛЯ ШВИДКОГО ДОСТУПУ =====
export const ALL_STATES = {
  ...STATE,
  ...MODAL_STATE,
  ...FORM_STATE,
  ...TABLE_STATE,
  ...BUTTON_STATE,
  ...SECTION_STATE,
  ...CALC_STATE,
};

// ===== ХЕЛПЕРИ ДЛЯ РОБОТИ ЗІ СТАНАМИ =====

/**
 * Перевіряє, чи є стан валідним (існує в ALL_STATES)
 * @param {string} state - стан для перевірки
 * @returns {boolean}
 */
export const isValidState = (state) => Object.values(ALL_STATES).includes(state);

/**
 * Отримує всі стани для категорії
 * @param {string} category - категорія (STATE, MODAL_STATE, тощо)
 * @returns {Object} Об'єкт зі станами
 */
const CATEGORY_MAP = {
  STATE,
  MODAL_STATE,
  FORM_STATE,
  TABLE_STATE,
  BUTTON_STATE,
  SECTION_STATE,
  CALC_STATE,
};

/**
 * Отримує всі стани для категорії
 * @param {keyof typeof CATEGORY_MAP} category - категорія (STATE, MODAL_STATE, тощо)
 * @returns {Object} Об'єкт зі станами
 */
export const getStatesByCategory = (category) => CATEGORY_MAP[category] || {};

/**
 * Конвертує стан у відповідний data-state атрибут
 * @param {string} state - константа стану
 * @returns {string}
 */
export const toDataState = (state) => String(state).toLowerCase();

/**
 * Логгер змін стану (для debug)
 * @param {string} component - назва компонента
 * @param {string} prevState - попередній стан
 * @param {string} newState - новий стан
 * @param {boolean} [enabled=true] - чи увімкнено логування
 */
export const logStateChange = (component, prevState, newState, enabled = true) => {
  if (!enabled) {
    return;
  }
  if (prevState === newState) {
    return;
  }

  console.log(`[StateChange] ${component}: ${prevState} → ${newState}`);
};

/**
 * Перевіряє, чи стан є фінальним (не вимагає подальших дій)
 * @param {string} state - стан для перевірки
 * @returns {boolean}
 */
export const isFinalState = (state) => {
  const finalStates = [
    STATE.SUCCESS,
    STATE.ERROR,
    FORM_STATE.SUBMITTED_SUCCESS,
    FORM_STATE.SUBMITTED_ERROR,
    CALC_STATE.CALCULATED,
    CALC_STATE.CALCULATION_ERROR,
  ];
  return finalStates.includes(state);
};

/**
 * Перевіряє, чи стан є проміжним (вимагає очікування)
 * @param {string} state - стан для перевірки
 * @returns {boolean}
 */
export const isPendingState = (state) => {
  const pendingStates = [
    STATE.LOADING,
    FORM_STATE.VALIDATING,
    MODAL_STATE.OPENING,
    MODAL_STATE.CLOSING,
    CALC_STATE.CALCULATING,
  ];
  return pendingStates.includes(state);
};

export default {
  STATE,
  MODAL_STATE,
  FORM_STATE,
  TABLE_STATE,
  BUTTON_STATE,
  SECTION_STATE,
  CALC_STATE,
  ALL_STATES,
  isValidState,
  getStatesByCategory,
  toDataState,
  logStateChange,
  isFinalState,
  isPendingState,
};
