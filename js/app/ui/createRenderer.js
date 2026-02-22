// @ts-check
// js/app/ui/createRenderer.js

import { pipe } from '../core/compose.js';

/**
 * @typedef {Object} Renderer
 * @property {(state: any) => void} render
 * @property {(state: any) => string} toHTML
 * @property {(container: HTMLElement, state: any) => void} mount
 */

/**
 * Створює чистий рендерер
 * @template T
 * @param {(state: T) => string} renderFn - чиста функція: state → HTML
 * @returns {Renderer}
 */
export const createRenderer = (renderFn) => ({
  // Pure: state → HTML
  toHTML: (state) => renderFn(state),

  // Side-effect: HTML → DOM
  render: (container) => (state) => {
    const html = renderFn(state);
    if (container.innerHTML !== html) {
      container.innerHTML = html;
    }
  },

  // Composition: mount = render + container
  mount: (container) => (state) => {
    pipe(renderFn, (html) => {
      container.innerHTML = html;
    })(state);
  },
});
