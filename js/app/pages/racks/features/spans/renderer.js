// @ts-check
// js/app/pages/racks/features/spans/renderer.js

import { log } from '../../../../config/env.js';

/**
 * @typedef {import('./state.js').SpanItem} SpanItem
 */

/**
 * Рендерить один рядок прольоту
 * @param {number} id - унікальний ID прольоту
 * @param {SpanItem} span - дані прольоту
 * @param {string[]} spanOptions - доступні коди балок з прайсу
 * @returns {string} HTML рядка
 */
export const renderSpanRow = (id, span, spanOptions) => {
  log('[SpansRenderer]', 'renderSpanRow:', { id, span, optionsCount: spanOptions.length });

  return `
    <li class="span-row form__group" data-js="span-row" data-id="${id}">
      <select 
        class="form__control span-select" 
        data-action="updateSpan" 
        data-field="item" 
        data-id="${id}"
        data-feature="spans"
      >
        <option value="" disabled ${!span.item ? 'selected' : ''}>Виберіть...</option>
        ${spanOptions
          .map(
            (code) => `
          <option value="${code}" ${span.item === code ? 'selected' : ''}>${code} мм</option>
        `,
          )
          .join('')}
      </select>
      
      <input 
        type="number" 
        class="form__control span-quantity" 
        data-action="updateSpan" 
        data-field="quantity" 
        data-id="${id}"
        data-feature="spans"
        data-transform="number"
        min="1" 
        max="10" 
        value="${span.quantity ?? ''}" 
        placeholder="К-сть"
      />
      
      <button 
        type="button" 
        class="icon-btn icon-btn--remove span-remove" 
        data-action="removeSpan" 
        data-id="${id}"
        data-feature="spans"
        aria-label="Видалити проліт"
      > 
      </button>
    </li>
  `;
};

/**
 * Рендерить всі прольоти
 * @param {Map<number, SpanItem>} spans - мапа прольотів
 * @param {string[]} spanOptions - доступні коди балок з прайсу
 * @returns {string} HTML всіх рядків
 */
export const renderSpans = (spans, spanOptions) => {
  if (!spans || spans.size === 0) {
    return '<p class="empty-state">Додайте хоча б один проліт</p>';
  }

  const rows = Array.from(spans.entries())
    .map(([id, span]) => renderSpanRow(id, span, spanOptions))
    .join('');

  log('[SpansRenderer]', 'renderSpans:', { count: spans.size });

  return rows;
};

export default { renderSpanRow, renderSpans };
