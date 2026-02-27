// js/app/pages/racks/effects/renderSetTable.js

import { log } from '../../../config/env.js';
import { iconChevronDown, iconChevronUp, iconTrash } from '../../../ui/icons/index.js';

/**
 * @typedef {import('../features/set/state.js').RackInSet} RackInSet
 */

/**
 * Скорочення назви стелажа для відображення в таблиці
 * @param {string} fullName - повна назва стелажа
 * @returns {string}
 */
const getRackAbbreviation = (fullName) => {
  const match = fullName.match(/\b(L\d+A\d+\S*-\d+\/\S+)\b/);
  return match ? match[1] : fullName.slice(0, 20) + '...';
};

/**
 * Рендер кнопок керування кількістю (вертикальні, як у number input)
 * @param {number} rackId - ID стелажа
 * @param {number} qty - поточна кількість
 * @param {boolean} disabled - чи вимкнена кнопка мінус
 * @returns {string} HTML кнопок
 */
const renderQtyControls = (rackId, qty, disabled = false) => `
  <div class="rack__set-table__qty">
    <span class="rack__set-table__qty-value">${qty}</span>
    <div class="rack__set-table__qty-buttons">
      <button
        class="btn btn--qty-vertical btn--qty-up"
        data-action="increaseQty"
        data-feature="rackSet"
        data-rackid="${rackId}"
        aria-label="Збільшити"
      >
        ${iconChevronUp({ size: 10 })}
      </button>
      <button
        class="btn btn--qty-vertical btn--qty-down"
        data-action="decreaseQty"
        data-feature="rackSet"
        data-rackid="${rackId}"
        ${disabled ? 'disabled' : ''}
        aria-label="Зменшити"
      >
        ${iconChevronDown({ size: 10 })}
      </button>
    </div>
  </div>
`;

/**
 * Рендер таблиці комплекту стелажів
 * @param {RackInSet[]} racks - масив стелажів у комплекті
 * @param {HTMLElement|null} container - контейнер для рендеру
 * @param {boolean} showPrices - чи показувати ціни
 * @param {'compact'|'full'} mode - режим відображення
 */
export const renderSetTable = (racks, container, showPrices = true, mode = 'compact') => {
  log('[renderSetTable]', 'Racks:', racks);
  if (!container) {
    return;
  }

  const isEmpty = !racks || racks.length === 0;

  if (isEmpty) {
    container.innerHTML = '';
    return;
  }

  const priceVisibilityClass = '';

  if (mode === 'compact') {
    renderCompactTable(racks, container, priceVisibilityClass);
  } else {
    renderFullTable(racks, container, priceVisibilityClass);
  }

  const table = container.querySelector('.rack__set-table');
  if (table && mode === 'compact') {
    table.classList.add('rack__set-table--compact');
  }
};

/**
 * Рендер скороченої таблиці (для сторінки)
 * @param {RackInSet[]} racks
 * @param {HTMLElement} container
 * @param {string} priceVisibilityClass
 */
const renderCompactTable = (racks, container, priceVisibilityClass) => {
  const rows = racks
    .map((rack, index) => {
      const abbreviation = getRackAbbreviation(rack.rack?.name || 'Стелаж');
      const zeroBase = rack.rack?.zeroBase || 0;

      return `
      <tr class="rack__set-table__row" data-rack-id="${rack.id}">
        <td class="rack__set-table__cell text-numeric">${index + 1}</td>
        <td class="rack__set-table__cell">${abbreviation}</td>
        <td class="rack__set-table__cell text-numeric">
          ${renderQtyControls(rack.id, rack.qty, rack.qty <= 1)}
        </td>
        <td class="rack__set-table__cell rack__price-cell rack__set-table__zero-base${priceVisibilityClass} text-numeric">
          ${zeroBase.toFixed(2)} ₴
        </td>
        <td class="rack__set-table__cell rack__set-table__actions">
          <button
            class="btn btn--icon btn--remove-rack"
            data-action="removeRack"
            data-feature="rackSet"
            data-rackid="${rack.id}"
            aria-label="Видалити стелаж"
          >
            ${iconTrash({ size: 14 })}
          </button>
        </td>
      </tr>
    `;
    })
    .join('');

  container.innerHTML = `
    <div class="rack__set-table-wrapper${priceVisibilityClass}">
      <table class="table rack__set-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Абревіатура</th>
            <th>Кількість</th>
            <th class="rack__price-header">Нульова ціна</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

/**
 * Рендер повної таблиці з підтаблицями (для модалки)
 * @param {RackInSet[]} racks
 * @param {HTMLElement} container
 * @param {string} priceVisibilityClass
 */
const renderFullTable = (racks, container, priceVisibilityClass) => {
  const mainRows = racks
    .map((rack, index) => {
      const fullName = rack.rack?.name || 'Стелаж';
      const componentsRows = renderComponentsSubtable(rack.rack?.components, rack.qty);

      return `
      <tr class="rack__set-table__main-row" data-rack-id="${rack.id}">
        <td class="rack__set-table__cell text-numeric">${index + 1}</td>
        <td class="rack__set-table__cell rack__set-table__name">
          <div class="rack__set-table__rack-name">${fullName}</div>
        </td>
        <td class="rack__set-table__cell text-numeric">
          ${renderQtyControls(rack.id, rack.qty, rack.qty <= 1)}
        </td>
        <td class="rack__set-table__cell rack__price-cell rack__set-table__zero-base${priceVisibilityClass} text-numeric">
          ${rack.rack?.zeroBase.toFixed(2) || '0.00'} ₴
        </td>
        <td class="rack__set-table__cell rack__set-table__actions">
          <button
            class="btn btn--icon btn--remove-rack"
            data-action="removeRack"
            data-feature="rackSet"
            data-rackid="${rack.id}"
            aria-label="Видалити стелаж"
          >
            ${iconTrash({ size: 14 })}
          </button>
        </td>
      </tr>
      <tr class="rack__set-table__components-row" data-rack-id="${rack.id}">
        <td colspan="5" class="rack__set-table__components-cell">
          <div class="rack__set-table__components-wrapper${priceVisibilityClass}">
            <div class="rack__set-table__components-label">Комплектація</div>
            <table class="table table--nested">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Назва</th>
                  <th>Кількість на 1 стеллаж</th>
                  <th>Всього</th>
                </tr>
              </thead>
              <tbody>
                ${componentsRows}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');

  container.innerHTML = `
    <div class="rack__set-table-wrapper${priceVisibilityClass}">
      <table class="table rack__set-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Назва стелажа</th>
            <th>Кількість</th>
            <th class="rack__price-header">Нульова ціна</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
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
    return '<tr><td colspan="4">Немає даних</td></tr>';
  }

  const rows = [];
  let itemIndex = 0;

  for (const [type, items] of Object.entries(components)) {
    const itemsArray = Array.isArray(items) ? items : [items];

    for (const item of itemsArray) {
      itemIndex++;
      rows.push(`
        <tr class="rack__set-table__component-row">
          <td class="rack__set-table__cell text-numeric">${itemIndex}</td>
          <td class="rack__set-table__cell">${item.name}</td>
          <td class="rack__set-table__cell text-numeric">${item.amount}</td>
          <td class="rack__set-table__cell text-numeric">${item.amount * qty}</td>
        </tr>
      `);
    }
  }

  if (rows.length === 0) {
    return '<tr><td colspan="4">Немає компонентів</td></tr>';
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
export const renderSetSummary = (total, itemCount, container, showPrices = true) => {
  if (!container) {
    console.warn('[renderSetSummary] Container not found');
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

export default { renderSetTable, renderSetSummary };
