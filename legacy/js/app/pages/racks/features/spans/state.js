// @ts-check
// js/app/pages/racks/features/spans/state.js

/**
 * @typedef {Object} SpanItem
 * @property {string} item - код балки з прайсу (напр. '1000', '1200')
 * @property {number|null} quantity - кількість балок цього типу
 */

/**
 * @typedef {Object} SpansState
 * @property {Map<number, SpanItem>} spans - мапа прольотів (id → дані)
 * @property {number} nextId - наступний доступний унікальний ID для нового прольоту
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
