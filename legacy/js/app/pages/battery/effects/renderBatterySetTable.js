// js/app/pages/battery/effects/renderBatterySetTable.js

import { iconPlus, iconMinus, iconTrash } from '../../../ui/icons/index.js';
import { log } from '../../../config/env.js';

/**
 * Рендер таблиці комплекту стелажів для battery page
 * @param {Array<Object>} variants - масив варіантів у комплекті
 * @param {HTMLElement|null} container - контейнер для рендеру
 * @param {boolean} showPrices - чи показувати ціни
 * @param {'compact'|'full'} mode - режим відображення
 */
export const renderBatterySetTable = (variants, container, showPrices = true, mode = 'compact') => {
  log('[renderBatterySetTable]', 'Variants:', variants);

  if (!container) {
    return;
  }

  const isEmpty = !variants || variants.length === 0;

  if (isEmpty) {
    container.innerHTML = '';
    return;
  }

  const priceVisibilityClass = '';

  if (mode === 'compact') {
    renderCompactTable(variants, container, priceVisibilityClass);
  } else {
    renderFullTable(variants, container, priceVisibilityClass);
  }

  const table = container.querySelector('.battery__set-table');
  if (table && mode === 'compact') {
    table.classList.add('battery__set-table--compact');
  }
};

/**
 * Скорочення назви варіанту для відображення в таблиці
 * @param {string} fullName - повна назва варіанту
 * @returns {string}
 */
const getVariantAbbreviation = (fullName) => {
  // Абревіатура типу L1A2C-1000/430
  const match = fullName.match(/\b(L\d+A\d+\S*-\d+\/\d+)\b/);
  return match ? match[1] : fullName.slice(0, 30) + '...';
};

/**
 * Рендер кнопок керування кількістю (вертикальні, як у number input)
 * @param {string} variantId - ID варіанту
 * @param {number} qty - поточна кількість
 * @param {boolean} disabled - чи вимкнена кнопка мінус
 * @returns {string} HTML кнопок
 */
const renderQtyControls = (variantId, qty, disabled = false) => `
  <div class="battery__set-table__qty">
    <span class="battery__set-table__qty-value">${qty}</span>
    <div class="battery__set-table__qty-buttons">
      <button
        class="btn btn--qty-vertical btn--qty-up"
        data-action="increaseQty"
        data-feature="batteryRackSet"
        data-variantid="${variantId}"
        aria-label="Збільшити"
      >
        ${iconPlus({ size: 14 })}
      </button>
      <button
        class="btn btn--qty-vertical btn--qty-down"
        data-action="decreaseQty"
        data-feature="batteryRackSet"
        data-variantid="${variantId}"
        ${disabled ? 'disabled' : ''}
        aria-label="Зменшити"
      >
        ${iconMinus({ size: 14 })}
      </button>
    </div>
  </div>
`;

/**
 * Рендер скороченої таблиці (для сторінки)
 * @param {Array<Object>} variants
 * @param {HTMLElement} container
 * @param {string} priceVisibilityClass
 */
const renderCompactTable = (variants, container, priceVisibilityClass) => {
  const rows = variants
    .map((variant, index) => {
      const abbreviation = getVariantAbbreviation(variant.variant?.name || 'Стелаж');
      const zeroBase = variant.variant?.zeroBase || 0;

      return `
      <tr class="table__row battery__set-table__row" data-variant-id="${variant.id}">
        <td class="table__cell battery__set-table__cell table__cell--index">${index + 1}</td>
        <td class="table__cell battery__set-table__cell table__cell--name">${abbreviation}</td>
        <td class="table__cell battery__set-table__cell table__cell--qty">
          ${renderQtyControls(variant.id, variant.qty, variant.qty <= 1)}
        </td>
        <td class="table__cell battery__set-table__cell table__cell--price battery__set-table__zero-base${priceVisibilityClass}">
          ${zeroBase.toFixed(2)} ₴
        </td>
        <td class="table__cell battery__set-table__cell battery__set-table__actions">
          <button
            class="btn btn--icon btn--remove-variant"
            data-action="removeVariant"
            data-feature="batteryRackSet"
            data-variantid="${variant.id}"
            aria-label="Видалити варіант"
          >
            ${iconTrash({ size: 14 })}
          </button>
        </td>
      </tr>
    `;
    })
    .join('');

  container.innerHTML = `
    <div class="table-wrapper battery__set-table-wrapper${priceVisibilityClass}">
      <table class="table battery__set-table">
        <thead class="table__header">
          <tr class="table__row table__row--header">
            <th class="table__cell table__cell--header table__cell--index">№</th>
            <th class="table__cell table__cell--header table__cell--name">Абревіатура</th>
            <th class="table__cell table__cell--header table__cell--qty">Кількість</th>
            <th class="table__cell table__cell--header table__cell--price battery__price-header">Нульова ціна</th>
            <th class="table__cell table__cell--header battery__set-table__actions"></th>
          </tr>
        </thead>
        <tbody class="table__body">
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

/**
 * Рендер повної таблиці з підтаблицями (для модалки)
 * @param {Array<Object>} variants
 * @param {HTMLElement} container
 * @param {string} priceVisibilityClass
 */
const renderFullTable = (variants, container, priceVisibilityClass) => {
  const mainRows = variants
    .map((variant, index) => {
      const fullName = variant.variant?.name || 'Стелаж';
      const componentsRows = renderComponentsSubtable(variant.variant?.components, variant.qty);

      return `
      <tr class="table__row battery__set-table__main-row" data-variant-id="${variant.id}">
        <td class="table__cell battery__set-table__cell table__cell--index">${index + 1}</td>
        <td class="table__cell battery__set-table__cell table__cell--name battery__set-table__name">
          <div class="battery__set-table__variant-name">${fullName}</div>
        </td>
        <td class="table__cell battery__set-table__cell table__cell--qty">
          ${renderQtyControls(variant.id, variant.qty, variant.qty <= 1)}
        </td>
        <td class="table__cell battery__set-table__cell table__cell--price battery__set-table__zero-base${priceVisibilityClass}">
          ${variant.variant?.zeroBase.toFixed(2) || '0.00'} ₴
        </td>
        <td class="table__cell battery__set-table__cell battery__set-table__actions">
          <button
            class="btn btn--icon btn--remove-variant"
            data-action="removeVariant"
            data-feature="batteryRackSet"
            data-variantid="${variant.id}"
            aria-label="Видалити варіант"
          >
            ${iconTrash({ size: 14 })}
          </button>
        </td>
      </tr>
      <tr class="battery__set-table__components-row" data-variant-id="${variant.id}">
        <td colspan="5" class="battery__set-table__components-cell">
          <div class="battery__set-table__components-wrapper${priceVisibilityClass}">
            <div class="table__nested-wrapper">
              <span class="table__nested-label">Комплектація</span>
              <table class="table table--nested">
                <thead class="table__header">
                  <tr class="table__row table__row--header">
                    <th class="table__cell table__cell--header table__cell--index">№</th>
                    <th class="table__cell table__cell--header table__cell--name">Назва</th>
                    <th class="table__cell table__cell--header table__cell--qty">Кількість на 1 стелаж</th>
                    <th class="table__cell table__cell--header table__cell--total">Всього</th>
                  </tr>
                </thead>
                <tbody class="table__body">
                  ${componentsRows}
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');

  container.innerHTML = `
    <div class="table-wrapper battery__set-table-wrapper${priceVisibilityClass}">
      <table class="table battery__set-table">
        <thead class="table__header">
          <tr class="table__row table__row--header">
            <th class="table__cell table__cell--header table__cell--index">№</th>
            <th class="table__cell table__cell--header table__cell--name">Назва стелажа</th>
            <th class="table__cell table__cell--header table__cell--qty">Кількість</th>
            <th class="table__cell table__cell--header table__cell--price battery__price-header">Нульова ціна</th>
            <th class="table__cell table__cell--header battery__set-table__actions"></th>
          </tr>
        </thead>
        <tbody class="table__body">
          ${mainRows}
        </tbody>
      </table>
    </div>
  `;
};

/**
 * Рендер підтаблиці з компонентами стелажа
 * @param {Object.<string, any>|any[]} components - компоненти стелажа
 * @param {number} qty - кількість стелажів
 * @returns {string}
 */
const renderComponentsSubtable = (components, qty) => {
  if (!components) {
    return '<tr class="table__row"><td class="table__cell" colspan="4">Немає даних</td></tr>';
  }

  const rows = [];
  let itemIndex = 0;

  for (const [type, items] of Object.entries(components)) {
    const itemsArray = Array.isArray(items) ? items : [items];

    for (const item of itemsArray) {
      itemIndex++;
      rows.push(`
        <tr class="table__row battery__set-table__component-row">
          <td class="table__cell table__cell--index">${itemIndex}</td>
          <td class="table__cell table__cell--name">${item.name}</td>
          <td class="table__cell table__cell--qty">${item.amount}</td>
          <td class="table__cell table__cell--center">${item.amount * qty}</td>
        </tr>
      `);
    }
  }

  if (rows.length === 0) {
    return '<tr class="table__row"><td class="table__cell" colspan="4">Немає компонентів</td></tr>';
  }

  return rows.join('');
};

/**
 * Рендер підсумкової вартості комплекту
 * @param {number} total - загальна вартість
 * @param {number} itemCount - кількість позицій
 * @param {HTMLElement|null} container - контейнер для рендеру
 * @param {boolean} showPrices - чи показувати ціни
 */
export const renderBatterySetSummary = (total, itemCount, container, showPrices = true) => {
  if (!container) {
    console.warn('[renderBatterySetSummary] Container not found');
    return;
  }

  if (itemCount === 0) {
    container.innerHTML = '';
    return;
  }

  const totalText = showPrices ? `${total.toFixed(2)} ₴` : '—';

  container.innerHTML = `
    <span class="result-total__label">Всього:</span>
    <span class="result-total__value">${totalText}</span>
    <span class="result-total__items">(${itemCount} шт.)</span>
  `;
};

export default { renderBatterySetTable, renderBatterySetSummary };
