// js/app/pages/racks/features/spans/spansDOMUpdater.js

import { query, toggleClass } from '../../../../effects/dom.js';
import { RACK_SELECTORS } from '../../../../config/selectors.js';
import { log } from '../../../../config/env.js';

import {
  appendSpanRow,
  removeSpanRow,
  updateSpanRow,
} from './domUtils.js';

/**
 * @typedef {Object} SpansDOMUpdaterParams
 * @property {HTMLElement | null} spansContainer
 * @property {import('../../../../core/FeatureContext.js').FeatureContext} spansContext
 * @property {string[]} spanOptions
 * @property {Object} rackPage
 * @property {WeakMap} pageState
 */

/**
 * Підписка на зміни spans і оновлення DOM
 * @param {SpansDOMUpdaterParams} params
 * @returns {() => void} unsubscribe
 */
export const subscribeSpansDOM = ({
  spansContainer,
  spansContext,
  spanOptions,
  rackPage,
  pageState,
}) => spansContext.subscribe((newState) => {
    if (!spansContainer) {
      return;
    }

    const prevSpans = pageState.get(rackPage)?.prevSpans || new Map();
    const currSpans = newState.spans;

    // Додані або змінені прольоти
    for (const [id, span] of currSpans.entries()) {
      const prevSpan = prevSpans.get(id);

      if (!prevSpan) {
        appendSpanRow(spansContainer, id, span, spanOptions);
      } else if (prevSpan.item !== span.item || prevSpan.quantity !== span.quantity) {
        updateSpanRow(spansContainer, id, span, spanOptions);
      }
    }

    // Видалені прольоти
    for (const id of prevSpans.keys()) {
      if (!currSpans.has(id)) {
        removeSpanRow(spansContainer, id);
      }
    }

    // Оновлення стану кнопки додавання
    const addSpanBtn = query(RACK_SELECTORS.spans.addBtn)();
    if (addSpanBtn) {
      const isMaxReached = spansContext.selectors.isMaxSpansReached();
      addSpanBtn.disabled = isMaxReached;
      addSpanBtn.setAttribute('aria-disabled', String(isMaxReached));
      toggleClass(addSpanBtn, 'btn--disabled', isMaxReached)();
    }

    // Зберегти поточний стан для наступного порівняння
    pageState.set(rackPage, {
      isActivated: true,
      prevSpans: new Map(currSpans),
    });

    log('[RackPage]', 'Spans DOM updated granularly');
  });

export default subscribeSpansDOM;
