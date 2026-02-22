// js/app/pages/racks/set/renderer/rackSetRenderer.js

import { createRenderer } from '../../../../ui/createRenderer.js';
import { collectComponents } from '../utils/collectComponents.js';

/**
 * @typedef {import('../state/rackSetState.js').RackSetState} RackSetState
 * @typedef {'page' | 'modal'} RenderMode
 */

/**
 * Pure: generate table row for rack item
 * @param {import('../state/rackSetState.js').RackSetItem} item
 * @param {number} index
 * @param {RenderMode} mode
 * @param {boolean} isExpanded
 * @returns {string}
 */
const generateRackRow = (item, index, mode = 'page', isExpanded = false) => {
  const { rack, qty, id } = item;
  const unitCost = rack.totalCost || 0;
  const total = unitCost * qty;
  const isModal = mode === 'modal';

  // Actions column: page has controls, modal has static qty
  const actionsCell = isModal
    ? `<td class="text-right">${qty}</td>`
    : `
      <td>
        <div class="rack-set__qty-controls" data-js="qty-controls" data-id="${id}">
          <button type="button" class="btn-qty-decrease" aria-label="Зменшити кількість" data-action="decrease">−</button>
          <span class="rack-set__qty-value" data-js="qty-value">${qty}</span>
          <button type="button" class="btn-qty-increase" aria-label="Збільшити кількість" data-action="increase">+</button>
          <button type="button" class="btn-remove" aria-label="Видалити стелаж" data-action="remove">✕</button>
        </div>
      </td>`;

  // Components details (only in modal, when expanded)
  const componentsRow =
    isModal && isExpanded && rack.components
      ? (() => {
          const components = collectComponents(rack.components);
          if (!components.length) {
            return;
          }
          return `
          <tr class="rack-set__components-row" data-js="components-row" data-parent-id="${id}">
            <td colspan="6">
              <div class="rack-set__components-wrapper">
                <span class="rack-set__components-label">Комплектація:</span>
                <table class="rack-set__components-table">
                  <thead>
                    <tr><th>Компонент</th><th>На 1 стелаж</th><th>Загалом (${qty} шт)</th><th>Ціна</th></tr>
                  </thead>
                  <tbody>
                    ${components
                      .map(
                        (c) => `
                      <tr>
                        <td>${c.name}</td>
                        <td>${c.amount}</td>
                        <td>${c.amount * qty}</td>
                        <td>${(c.price * c.amount * qty).toFixed(2)}</td>
                      </tr>
                    `,
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>`;
        })()
      : '';

  return `
    <tr class="rack-set__main-row" data-js="rack-row" data-id="${id}" data-expanded="${isExpanded}">
      <td class="text-center">${index + 1}</td>
      <td>
        ${isModal ? `<strong>${rack.description}</strong><br><small class="text-muted">${rack.abbreviation}</small>` : rack.abbreviation || '—'}
        ${isModal && rack.components ? `<button class="toggle-details" data-js="toggle-details" data-id="${id}" aria-expanded="${isExpanded}">${isExpanded ? '▲ Сховати деталі' : '▼ Показати деталі'}</button>` : ''}
      </td>
      <td class="text-right">${unitCost.toFixed(2)}</td>
      ${actionsCell}
      <td class="text-right font-bold">${total.toFixed(2)}</td>
    </tr>
    ${componentsRow}
  `;
};

/**
 * Pure: render full rack set table
 * @param {RackSetState} state
 * @param {{ mode?: RenderMode, onToggleDetails?: (id: string) => void }} options
 * @returns {string}
 */
export const renderRackSetTable = (state, { mode = 'page' } = {}) => {
  const { racks, expandedRackId } = state;
  const isModal = mode === 'modal';

  if (!racks.length) {
    return `
      <div class="empty-state" data-js="rack-set-empty">
        <span class="empty-state__icon">📦</span>
        <p>Комплект порожній. Додайте стелажі з калькулятора.</p>
      </div>`;
  }

  const rows = racks
    .map((item, idx) => generateRackRow(item, idx, mode, expandedRackId === item.id))
    .join('');

  return `
    <table class="rack-set-table" data-js="rack-set-table" data-mode="${mode}">
      <thead>
        <tr>
          <th class="text-center">#</th>
          <th>Стелаж</th>
          <th class="text-right">Ціна за од.</th>
          ${isModal ? '<th class="text-right">Кількість</th>' : '<th>Керування</th>'}
          <th class="text-right">Сума</th>
        </tr>
      </thead>
      <tbody data-js="rack-set-body">
        ${rows}
      </tbody>
    </table>`;
};

/**
 * Pure: render summary with grand total
 * @param {RackSetState} state
 * @returns {string}
 */
export const renderRackSetSummary = (state) => {
  const totalCost = state.racks.reduce((sum, r) => sum + (r.rack.totalCost || 0) * r.qty, 0);
  const totalItems = state.racks.reduce((sum, r) => sum + r.qty, 0);

  return `
    <div class="rack-set-summary" data-js="rack-set-summary">
      <div class="rack-set-summary__row">
        <span>Всього стелажів:</span>
        <strong data-js="total-items">${totalItems}</strong>
      </div>
      <div class="rack-set-summary__row rack-set-summary__row--total">
        <span>Загальна вартість:</span>
        <strong data-js="grand-total">${totalCost.toFixed(2)} ₴</strong>
      </div>
    </div>`;
};

/**
 * Pure: render modal content (table + summary + actions)
 * @param {RackSetState} state
 * @returns {string}
 */
export const renderModalContent = (state) => `
  <div class="modal__body" data-js="modal-body">
    ${renderRackSetTable(state, { mode: 'modal' })}
    ${renderRackSetSummary(state)}
  </div>
  <div class="modal__footer">
    <button class="btn btn--outline" data-js="modal-close" type="button">Закрити</button>
    <button class="btn btn--primary" data-js="modal-export" type="button" ${state.racks.length === 0 ? 'disabled' : ''}>
      📥 Експортувати
    </button>
  </div>`;

// ===== EXPORT RENDERERS =====

export const rackSetTableRenderer = createRenderer((state) => renderRackSetTable(state));
export const rackSetSummaryRenderer = createRenderer((state) => renderRackSetSummary(state));
export const rackSetModalRenderer = createRenderer((state) => renderModalContent(state));

export default {
  rackSetTableRenderer,
  rackSetSummaryRenderer,
  rackSetModalRenderer,
  renderRackSetTable, // pure function for manual use
  renderRackSetSummary,
  renderModalContent,
};
