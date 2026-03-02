// js/app/pages/battery/config/batteryConfig.js

/**
 * Конфігурація форми battery page
 * Визначає доступні опції та значення за замовчуванням для параметрів стелажа
 */

/**
 * Опції кількості рядів
 * @type {Array<{ value: number, label: string }>}
 */
export const rowsOptions = [
  { value: 1, label: '1 ряд' },
  { value: 2, label: '2 ряди' },
];

/**
 * Опції кількості поверхів
 * @type {Array<{ value: number, label: string }>}
 */
export const floorsOptions = [
  { value: 1, label: '1 поверх' },
  { value: 2, label: '2 поверхи' },
  { value: 3, label: '3 поверхи' },
];

/**
 * Опції типу опори
 * @type {Array<{ value: string, label: string }>}
 */
export const supportTypeOptions = [
  { value: 'straight', label: 'Пряма' },
  { value: 'step', label: 'Ступінчата' },
];

/**
 * Повна конфігурація форми
 * @type {Object}
 */
export const BATTERY_FORM_CONFIG = {
  rows: {
    options: rowsOptions,
    default: 1,
  },
  floors: {
    options: floorsOptions,
    default: 1,
  },
  supportType: {
    options: supportTypeOptions,
    default: 'straight',
  },
};

/**
 * Початкові значення форми (з урахуванням конфігурації)
 * @type {Object}
 */
export const initialBatteryFormState = {
  // Параметри акумулятора
  length: 108,
  width: 200,
  height: 600,
  weight: 50,
  gap: 10,
  count: 26,

  // Параметри стелажа (з конфігурації)
  rows: BATTERY_FORM_CONFIG.rows.default,
  floors: BATTERY_FORM_CONFIG.floors.default,
  supportType: BATTERY_FORM_CONFIG.supportType.default,
};

export default BATTERY_FORM_CONFIG;
