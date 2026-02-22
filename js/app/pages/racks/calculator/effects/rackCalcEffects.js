// js/app/pages/racks/calculator/effects.js

import { query, setHTML, setState, setText, setValue } from '../../../../effects/dom.js';
import { SELECTORS } from '../../../../config/app.config.js';

/**
 * Lazy selectors for rack calculator DOM elements
 * @returns {Record<string, () => HTMLElement | null>}
 */
export const getRackCalcSelectors = () => ({
  // Form
  form: () => document.querySelector(SELECTORS.rack.form),
  floors: () => document.querySelector(SELECTORS.rack.floors),
  rows: () => document.querySelector(SELECTORS.rack.rows),
  beamsPerRow: () => document.querySelector(SELECTORS.rack.beamsPerRow),
  verticalSupports: () => document.querySelector(SELECTORS.rack.verticalSupports),
  supports: () => document.querySelector(SELECTORS.rack.supports),
  beamsContainer: () => document.querySelector(SELECTORS.rack.beamsContainer),
  addBeamBtn: () => document.querySelector(SELECTORS.rack.addBeam),

  // Results
  rackName: () => document.querySelector(SELECTORS.rack.name),
  componentsTable: () => document.querySelector(SELECTORS.rack.componentsTable),
  addToSetBtn: () => document.querySelector(SELECTORS.rack.addToSetBtn),

  // Rack set
  rackSetTable: () => document.querySelector(SELECTORS.rack.setTable),
  rackSetSummary: () => document.querySelector(SELECTORS.rack.setSummary),
});

/**
 * Lazy effect: update rack name output
 * @param {string} html
 * @returns {() => boolean}
 */
export const updateRackName = (html) => {
  const selector = getRackCalcSelectors().rackName;
  return () => {
    const el = selector();
    return el ? setHTML(el, html)() : false;
  };
};

/**
 * Lazy effect: update components table
 * @param {string} html
 * @returns {() => boolean}
 */
export const updateComponentsTable = (html) => {
  const selector = getRackCalcSelectors().componentsTable;
  return () => {
    const el = selector();
    return el ? setHTML(el, html)() : false;
  };
};

/**
 * Lazy effect: update add-to-set button state
 * @param {{ disabled: boolean, title: string }} state
 * @returns {() => boolean}
 */
export const updateAddToSetButton = ({ disabled, title }) => {
  const selector = getRackCalcSelectors().addToSetBtn;
  return () => {
    const el = selector();
    if (!el) {
      return false;
    }

    el.disabled = disabled;
    el.setAttribute('aria-disabled', String(disabled));
    el.title = title;
    return true;
  };
};

/**
 * Lazy effect: populate dropdown with options
 * @param {HTMLElement | (() => HTMLElement|null)} selectRef
 * @param {string[]} options
 * @param {string} [placeholder='Виберіть...']
 * @returns {() => boolean}
 */
export const populateDropdown =
  (selectRef, options, placeholder = 'Виберіть...') =>
  () => {
    const el = typeof selectRef === 'function' ? selectRef() : selectRef;
    if (!el) {
      return false;
    }

    el.innerHTML = `
    <option value="" selected disabled>${placeholder}</option>
    ${options.map((v) => `<option value="${v}">${v}</option>`).join('')}
  `;
    return true;
  };

export default {
  getRackCalcSelectors,
  updateRackName,
  updateComponentsTable,
  updateAddToSetButton,
  populateDropdown,
};
