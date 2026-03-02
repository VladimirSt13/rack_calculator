// js/app/pages/battery/effects/renderBatteryVariants.js

import { iconPlus } from '../../../ui/icons/index.js';
import { log } from '../../../config/env.js';

/**
 * Рендерить таблицю варіантів стелажів для battery page
 * @param {Array<Object>} variants - масив варіантів з розрахунком
 * @param {HTMLElement} outputEl - контейнер для рендеру
 * @param {Object} formValues - значення форми (floors, rows, supportType, width, height)
 * @param {Object} effects - EffectRegistry (опціонально)
 */
export const renderBatteryVariants = (variants, outputEl, formValues, effects = null) => {
  log('[renderBatteryVariants]', 'Variants:', variants, 'FormValues:', formValues);

  if (!outputEl) {
    console.warn('[renderBatteryVariants] Output element not found');
    return;
  }

  // Фільтруємо варіанти: беремо тільки ті, що мають розрахунок
  const allVariants = variants.flatMap((variant) => variant.variantsWithPrice || []);

  if (!allVariants || allVariants.length === 0) {
    const emptyHtml = `
      <div class="battery-results__empty">
        <p class="text-muted">Введіть параметри акумулятора та натисніть "Підібрати варіанти"</p>
      </div>
    `;

    if (effects) {
      effects.setHTML('results', 'output', emptyHtml)();
    } else {
      outputEl.innerHTML = emptyHtml;
    }
    return;
  }

  // Отримуємо розрахункову довжину з першого варіанту
  const firstVariant = allVariants[0];
  const rackLength = firstVariant?.length || 0;

  const tableHtml = `
    ${renderRackParams({ formValues, rackLength })}
    <div class="table-container">
      <table class="table battery-results__table" data-js="battery-variantsTable" data-feature="batteryResults">
        <thead>
          <tr>
            <th class="table__cell table__cell--header table__cell--index">№</th>
            <th class="table__cell table__cell--header table__cell--name">Абревіатура</th>
            <th class="table__cell table__cell--header table__cell--price">Нульова ціна</th>
            <th class="table__cell table__cell--header"></th>
          </tr>
        </thead>
        <tbody data-js="battery-variantsBody" data-feature="batteryResults">
          ${allVariants.map((variant, index) => renderVariantRow(variant, index)).join('')}
        </tbody>
      </table>
    </div>
  `;

  if (effects) {
    effects.setHTML('results', 'output', tableHtml)();
  } else {
    outputEl.innerHTML = tableHtml;
  }
};

/**
 * Рендер блоку з параметрами стелажа
 * @param {Object} params
 * @param {Object} params.formValues - { floors, rows, supportType, width, height, rackWidth }
 * @param {number} params.rackLength - розрахункова довжина стелажа
 * @returns {string}
 */
const renderRackParams = ({ formValues, rackLength }) => {
  const { floors, rows, supportType, height, rackWidth } = formValues;
  const supportTypeLabel = supportType === 'step' ? 'Ступінчаста' : 'Пряма';
  const floorsLabel = `${floors} ${floors === 1 ? 'поверх' : floors === 2 ? 'поверхи' : floors === 3 ? '3 поверхи' : 'поверхів'}`;
  const rowsLabel = `${rows} ${rows === 1 ? 'ряд' : rows === 2 ? 'ряди' : 'рядів'}`;

  return `
    <div class="battery-results__params">
      <div class="battery-results__params-grid">
        <div class="battery-results__param">
          <span class="battery-results__param-label">Конфігурація:</span>
          <span class="battery-results__param-value">${floorsLabel}, ${rowsLabel}</span>
        </div>
        <div class="battery-results__param">
          <span class="battery-results__param-label">Тип опори:</span>
          <span class="battery-results__param-value">${supportTypeLabel}</span>
        </div>
        <div class="battery-results__param">
          <span class="battery-results__param-label">Ширина стелажа:</span>
          <span class="battery-results__param-value">${rackWidth} мм</span>
        </div>
        ${floors > 1 ? `
        <div class="battery-results__param">
          <span class="battery-results__param-label">Висота стелажа:</span>
          <span class="battery-results__param-value">${height} мм</span>
        </div>
        ` : ''}
        <div class="battery-results__param battery-results__param--highlight">
          <span class="battery-results__param-label">Розрахункова довжина:</span>
          <span class="battery-results__param-value">${rackLength} мм</span>
        </div>
      </div>
    </div>
  `;
};

/**
 * Рендер рядка варіанту
 * @param {Object} variant - варіант стелажа
 * @param {number} index - індекс
 * @returns {string}
 */
const renderVariantRow = (variant, index) => {
  const { name, zeroBase, combination, beams } = variant;

  // Формуємо детальний опис прольотів
  const spansDetail = combination ? combination.join('+') : '';
  const beamsText = beams ? `[${beams} бал.]` : '';

  return `
    <tr class="table__row battery-results__row" data-variant-index="${index}">
      <td class="table__cell table__cell--index">${index + 1}</td>
      <td class="table__cell table__cell--name">
        <div class="battery-results__name">${name}</div>
        ${spansDetail ? `<div class="battery-results__spans text-muted">${spansDetail} ${beamsText}</div>` : ''}
      </td>
      <td class="table__cell table__cell--price text-numeric">
        ${zeroBase ? `${zeroBase.toFixed(2)} ₴` : '—'}
      </td>
      <td class="table__cell table__cell--actions">
        <button
          class="btn btn--icon btn--add-to-set"
          data-action="addVariantToSet"
          data-feature="batteryRackSet"
          data-variant-index="${index}"
          aria-label="Додати до комплекту"
          ${!zeroBase ? 'disabled' : ''}
        >
          ${iconPlus({ size: 16 })}
        </button>
      </td>
    </tr>
  `;
};

/**
 * Рендер повідомлення про помилку
 * @param {string} message
 * @param {HTMLElement} outputEl
 * @param {Object} effects
 */
export const renderBatteryError = (message, outputEl, effects = null) => {
  const errorHtml = `
    <div class="battery-results__error">
      <p class="text-danger">${message}</p>
    </div>
  `;

  if (effects) {
    effects.setHTML('results', 'output', errorHtml)();
  } else {
    outputEl.innerHTML = errorHtml;
  }
};

export default renderBatteryVariants;
