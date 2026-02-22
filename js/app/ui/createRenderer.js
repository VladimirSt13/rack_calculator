// @ts-check
// js/app/ui/createRenderer.js

import { pipe } from '../core/compose.js';

/**
 * @typedef {Object} Renderer
 * @property {(state: any) => string} toHTML
 * @property {(container: HTMLElement) => (state: any) => void} render  // ✅ Curried
 * @property {(container: HTMLElement) => (state: any) => void} mount   // ✅ Curried
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

  /**
   * Оновлює HTML контейнеру за допомогою чистого рендереру
   * @param {HTMLElement} container - контейнер, у якому буде відображено HTML
   * @returns {(state: any) => void} - функція, що приймає стан і оновлює container
   */
  render: (container) => (state) => {
    const html = renderFn(state);
    if (container.innerHTML !== html) {
      container.innerHTML = html;
    }
  },

  /**
   * Mounts the renderer to the given container.
   * This function will only update the container's HTML if it has changed.
   * @param {HTMLElement} container - The container to mount the renderer to.
   * @returns {(state: any) => void} - A function that takes a state and mounts the rendered HTML to the container.
   */
  mount: (container) => (state) => {
    pipe(
      renderFn,
      /** @param {string} html */
      (html) => {
        container.innerHTML = html;
      },
    )(state);
  },
});
