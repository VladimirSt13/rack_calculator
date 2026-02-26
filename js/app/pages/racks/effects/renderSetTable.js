// js/app/pages/racks/effects/renderSetTable.js

import { query } from '../../../effects/dom.js';
import { RACK_SELECTORS } from '../../../config/selectors.js';

/**
 * @typedef {import('../features/set/state.js').RackInSet} RackInSet
 */

/**
 * Скорочення назви стелажа для відображення в таблиці
 * @param {string} fullName - повна назва стелажа
 * @returns {string}
 */
const getRackAbbreviation = (fullName) => {
  // Знаходимо абревіатуру в дужках або після останнього пробілу
  const match = fullName.match(/\b(L\d+A\d+\S*-\d+\/\S+)\b/);
  return match ? match[1] : fullName.slice(0, 20) + '...';
};

/**
 * Рендер таблиці комплекту стелажів
 * @param {RackInSet[]} racks - масив стелажів у комплекті
 * @param {HTMLElement|null} container - контейнер для рендеру
 * @param {boolean} showPrices - чи показувати ціни (не використовується для комплекту)
 * @param {'compact'|'full'} mode - режим відображення
 */
export const renderSetTable = (racks, container, showPrices = true, mode = 'compact') => {
  if (!container) {
    console.warn('[renderSetTable] Container not found');
    return;
  }

  if (!racks || racks.length === 0) {
    container.innerHTML = '<p class="empty-state">Комплект порожній</p>';
    container.dataset.state = 'empty';
    return;
  }

  // Для таблиці комплекту завжди показуємо ціни
  const priceVisibilityClass = '';

  if (mode === 'compact') {
    renderCompactTable(racks, container, priceVisibilityClass);
  } else {
    renderFullTable(racks, container, priceVisibilityClass);
  }

  // Додаємо клас для компактної таблиці
  const table = container.querySelector('.rack__set-table');
  if (table && mode === 'compact') {
    table.classList.add('rack__set-table--compact');
  }

  container.dataset.state = 'ready';
};

/**
 * Рендер скороченої таблиці (для сторінки)
 * @param {RackInSet[]} racks
 * @param {HTMLElement} container
 * @param {string} priceVisibilityClass
 */
const renderCompactTable = (racks, container, priceVisibilityClass) => {
  const rows = racks.map((rack, index) => {
    const abbreviation = getRackAbbreviation(rack.rack?.name || 'Стелаж');
    const zeroBase = rack.rack?.zeroBase || 0;

    return `
      <tr class="rack__set-table__row" data-rack-id="${rack.id}">
        <td class="rack__set-table__cell">${index + 1}</td>
        <td class="rack__set-table__cell">${abbreviation}</td>
        <td class="rack__set-table__cell rack__set-table__qty">
          <button 
            class="btn btn--small btn--qty" 
            data-action="decreaseQty" 
            data-feature="set"
            data-rack-id="${rack.id}"
            ${rack.qty <= 1 ? 'disabled' : ''}
          >
            −
          </button>
          <span class="rack__set-table__qty-value">${rack.qty}</span>
          <button 
            class="btn btn--small btn--qty" 
            data-action="increaseQty" 
            data-feature="set"
            data-rack-id="${rack.id}"
          >
            +
          </button>
        </td>
        <td class="rack__set-table__cell rack__price-cell rack__set-table__zero-base${priceVisibilityClass}">
          ${zeroBase.toFixed(2)} ₴
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="rack__set-table-wrapper${priceVisibilityClass}">
      <table class="rack__set-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Абревіатура</th>
            <th>Кількість</th>
            <th class="rack__price-header">Нульова ціна</th>
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
  // Головні рядки зі стелажами
  const mainRows = racks.map((rack, index) => {
    const fullName = rack.rack?.name || 'Стелаж';

    // Підтаблиця з компонентами
    const componentsRows = renderComponentsSubtable(rack.rack?.components);

    return `
      <tr class="rack__set-table__main-row" data-rack-id="${rack.id}">
        <td class="rack__set-table__cell">${index + 1}</td>
        <td class="rack__set-table__cell rack__set-table__name">
          <div class="rack__set-table__rack-name">${fullName}</div>
        </td>
        <td class="rack__set-table__cell rack__set-table__qty">
          <button 
            class="btn btn--small btn--qty" 
            data-action="decreaseQty" 
            data-feature="set"
            data-rack-id="${rack.id}"
            ${rack.qty <= 1 ? 'disabled' : ''}
          >
            −
          </button>
          <span class="rack__set-table__qty-value">${rack.qty}</span>
          <button 
            class="btn btn--small btn--qty" 
            data-action="increaseQty" 
            data-feature="set"
            data-rack-id="${rack.id}"
          >
            +
          </button>
        </td>
        <td class="rack__set-table__cell rack__price-cell rack__set-table__zero-base${priceVisibilityClass}">
          ${rack.rack?.zeroBase.toFixed(2) || '0.00'} ₴
        </td>
        <td class="rack__set-table__cell rack__set-table__actions">
          <button 
            class="btn btn--icon btn--remove" 
            data-action="removeRack" 
            data-feature="set"
            data-rack-id="${rack.id}"
            aria-label="Видалити стелаж"
          >
            ✕
          </button>
        </td>
      </tr>
      <tr class="rack__set-table__components-row" data-rack-id="${rack.id}">
        <td colspan="5" class="rack__set-table__components-cell">
          <div class="rack__set-table__components-wrapper${priceVisibilityClass}">
            <div class="rack__set-table__components-label">Комплектація</div>
            <table class="rack__set-table__components-subtable">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Назва</th>
                  <th>Кількість</th>
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
  }).join('');

  container.innerHTML = `
    <div class="rack__set-table-wrapper${priceVisibilityClass}">
      <table class="rack__set-table">
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
 * @returns {string}
 */
const renderComponentsSubtable = (components) => {
  if (!components) {
    return '<tr><td colspan="3">Немає даних</td></tr>';
  }

  const rows = [];
  let itemIndex = 0;

  for (const [type, items] of Object.entries(components)) {
    const itemsArray = Array.isArray(items) ? items : [items];
    
    for (const item of itemsArray) {
      itemIndex++;
      rows.push(`
        <tr class="rack__set-table__component-row">
          <td class="rack__set-table__cell">${itemIndex}</td>
          <td class="rack__set-table__cell">${item.name}</td>
          <td class="rack__set-table__cell">${item.amount}</td>
        </tr>
      `);
    }
  }

  if (rows.length === 0) {
    return '<tr><td colspan="3">Немає компонентів</td></tr>';
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
    container.textContent = '';
    container.dataset.state = 'empty';
    return;
  }

  const totalText = showPrices ? `${total.toFixed(2)} ₴` : '—';

  container.innerHTML = `
    <span class="result-total__label">Всього:</span>
    <span class="result-total__value">${totalText}</span>
    <span class="result-total__items">(${itemCount} шт.)</span>
  `;

  container.dataset.state = 'ready';
};

export default { renderSetTable, renderSetSummary };
