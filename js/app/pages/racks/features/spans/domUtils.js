// js/app/pages/racks/features/spans/domUtils.js

import { renderSpanRow } from './renderer.js';
import { log } from '../../../../config/env.js';

/**
 * Знайти рядок прольоту в контейнері за ID
 * @param {HTMLElement} container
 * @param {number} id
 * @returns {HTMLElement | null}
 */
export const findSpanRow = (container, id) => container.querySelector(`.span-row[data-id="${id}"]`);

/**
 * Додати новий рядок прольоту (без перерисовки всього)
 * @param {HTMLElement} container
 * @param {number} id
 * @param {import('./state.js').SpanItem} span
 * @param {string[]} spanOptions
 */
export const appendSpanRow = (container, id, span, spanOptions) => {
  const template = document.createElement('template');
  template.innerHTML = renderSpanRow(id, span, spanOptions).trim();
  const newRow = template.content.firstElementChild;
  container.appendChild(newRow);
  log('[SpansDOM]', 'Appended row:', id);
};

/**
 * Оновити існуючий рядок прольоту (без заміни HTML)
 * @param {HTMLElement} container
 * @param {number} id
 * @param {import('./state.js').SpanItem} span
 * @param {string[]} spanOptions
 */
export const updateSpanRow = (container, id, span, spanOptions) => {
  const row = findSpanRow(container, id);
  if (!row) {
    // Якщо рядка немає (напр. після ручного видалення) — додамо його
    appendSpanRow(container, id, span, spanOptions);
    return;
  }

  // ✅ Оновити select
  const select = row.querySelector('.span-select');
  if (select && select.value !== span.item) {
    select.value = span.item;
  }

  // ✅ Оновити input quantity
  const input = row.querySelector('.span-quantity');
  if (input && input.value !== (span.quantity ?? '')) {
    input.value = span.quantity ?? '';
  }

  log('[SpansDOM]', 'Updated row:', id);
};

/**
 * Видалити рядок прольоту
 * @param {HTMLElement} container
 * @param {number} id
 */
export const removeSpanRow = (container, id) => {
  const row = findSpanRow(container, id);
  if (row) {
    row.remove();
    log('[SpansDOM]', 'Removed row:', id);
  }
};

/**
 * Повна перерисовка (тільки для початкового рендеру або reset)
 * @param {HTMLElement} container
 * @param {Map<number, import('./state.js').SpanItem>} spans
 * @param {string[]} spanOptions
 */
export const renderAllSpans = (container, spans, spanOptions) => {
  if (!container) {
    return;
  }
  container.innerHTML = '';
  for (const [id, span] of spans.entries()) {
    appendSpanRow(container, id, span, spanOptions);
  }
  log('[SpansDOM]', 'Rendered all spans:', spans.size);
};

export default {
  findSpanRow,
  appendSpanRow,
  updateSpanRow,
  removeSpanRow,
  renderAllSpans,
};
