// js/app/pages/racks/features/spans/state.js

/**
 * @typedef {Object} SpanItem
 * @property {string} item - код балки (з прайсу)
 * @property {number|null} quantity - кількість
 */

/**
 * @typedef {Object} SpansState
 * @property {Map<number, SpanItem>} spans - мапа прольотів (id → дані)
 * @property {number} nextId - наступний доступний ID для нового прольоту
 */

/**
 * Початковий стан прольотів
 * @type {SpansState}
 */
export const initialSpansState = {
  spans: new Map(),
  nextId: 1,
};

export default initialSpansState;
