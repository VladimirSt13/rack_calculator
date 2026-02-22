// js/utils/types.js

/**
 * @template T
 * @typedef {Object} State
 * @property {T} value
 * @property {Function} subscribe
 * @property {Function} dispatch
 */

/**
 * @typedef {Object} PageModule
 * @property {string} id
 * @property {() => Promise<void>} init
 * @property {(addListener: Function) => void} activate
 * @property {() => void} deactivate
 */

/**
 * @typedef {'empty' | 'ready' | 'loading' | 'error'} UIState
 */

/**
 * @callback MouseEventHandler
 * @param {MouseEvent} e
 * @returns {void}
 */
/**
 * @callback ChangeEventHandler
 * @param {Event} e
 * @returns {void}
 */

export {}; // Робить файл модулем, щоб типи не "витікали"
