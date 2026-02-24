// js/app/effects/dom.js

/**
 * @typedef {Element | HTMLElement | null | (() => Element | null) | (() => HTMLElement | null)} ElementRef
 * @typedef {Record<string, string>} Attributes
 * @typedef {ScrollIntoViewOptions} ScrollOptions
 * @typedef {FocusOptions} FocusOpts
 * @typedef {'input'|'change'|'click'|'keydown'|'keyup'} EventType
 */

/**
 * Pure: отримує Element з ElementRef (підтримує lazy evaluation + null)
 * @param {ElementRef} elementRef
 * @returns {Element | null}
 */
const getElement = (elementRef) => {
  if (!elementRef) {
    return null;
  }

  if (typeof elementRef === 'function') {
    const result = elementRef();
    return result instanceof Element ? result : null;
  }

  return elementRef instanceof Element ? elementRef : null;
};

/**
 * Returns a lazy function that queries the document for an element.
 * @param {string} selector - CSS selector
 * @returns {() => Element | null} Lazy function returning the element
 */
export const query = (selector) => () => {
  if (!selector || typeof selector !== 'string') {
    console.warn('[dom.query] Invalid selector:', selector);
    return null;
  }
  return document.querySelector(selector);
};

/**
 * Returns a lazy function that queries ALL elements matching the selector.
 * @param {string} selector - CSS selector
 * @returns {() => NodeListOf<Element>} Lazy function returning NodeList
 */
export const queryAll = (selector) => () => {
  if (!selector || typeof selector !== 'string') {
    console.warn('[dom.queryAll] Invalid selector:', selector);
    return document.createDocumentFragment().childNodes;
  }
  return document.querySelectorAll(selector);
};

/**
 * Sets data-state attribute on element.
 * @param {ElementRef} elementRef
 * @param {string} state
 * @returns {() => boolean}
 */
export const setState = (elementRef, state) => () => {
  const el = getElement(elementRef);
  if (!el) {
    console.warn('[dom.setState] Element not found');
    return false;
  }
  el.dataset.state = state;
  return true;
};

/**
 * Gets data-state attribute from element.
 * @param {ElementRef} elementRef
 * @returns {() => string | null}
 */
export const getState = (elementRef) => () => {
  const el = getElement(elementRef);
  return el?.dataset.state || null;
};

/**
 * Sets data-feature attribute (architecture helper).
 * @param {ElementRef} elementRef
 * @param {string} feature - 'form' | 'spans' | 'results' | 'set'
 * @returns {() => boolean}
 */
export const setDataFeature = (elementRef, feature) => () => {
  const el = getElement(elementRef);
  if (!el) {
    return false;
  }
  el.dataset.feature = feature;
  return true;
};

/**
 * Sets data-action attribute (architecture helper).
 * @param {ElementRef} elementRef
 * @param {string} action - action name for InteractiveElement
 * @returns {() => boolean}
 */
export const setDataAction = (elementRef, action) => () => {
  const el = getElement(elementRef);
  if (!el) {
    return false;
  }
  el.dataset.action = action;
  return true;
};

/**
 * Sets data-render-target attribute (architecture helper).
 * @param {ElementRef} elementRef
 * @param {string} target - 'name' | 'tableHtml' | 'total' | 'list'
 * @returns {() => boolean}
 */
export const setDataRenderTarget = (elementRef, target) => () => {
  const el = getElement(elementRef);
  if (!el) {
    return false;
  }
  el.dataset.renderTarget = target;
  return true;
};

/**
 * Gets all data-* attributes from element as plain object.
 * @param {ElementRef} elementRef
 * @returns {() => Record<string, string> | null}
 */
export const getDataset = (elementRef) => () => {
  const el = getElement(elementRef);
  if (!el?.dataset) {
    return null;
  }
  return { ...el.dataset };
};

/**
 * Sets multiple data-* attributes on element.
 * @param {ElementRef} elementRef
 * @param {Attributes} attributes
 * @returns {() => boolean}
 */
export const setAttributes = (elementRef, attributes) => () => {
  const el = getElement(elementRef);
  if (!el || !attributes || typeof attributes !== 'object') {
    return false;
  }

  for (const [key, value] of Object.entries(attributes)) {
    el.dataset[key] = value;
  }
  return true;
};

/**
 * Toggles CSS class on element.
 * @param {ElementRef} elementRef
 * @param {string} className
 * @param {boolean} [force] - true=add, false=remove, undefined=toggle
 * @returns {() => boolean}
 */
export const toggleClass = (elementRef, className, force) => () => {
  const el = getElement(elementRef);
  if (!el || !className) {
    return false;
  }

  if (force !== undefined) {
    el.classList.toggle(className, force);
    return force;
  }
  return el.classList.toggle(className);
};

/**
 * Adds CSS class(es) to element.
 * @param {ElementRef} elementRef
 * @param {string | string[]} classNames
 * @returns {() => boolean}
 */
export const addClass = (elementRef, classNames) => () => {
  const el = getElement(elementRef);
  if (!el || !classNames) {
    return false;
  }

  const classes = Array.isArray(classNames) ? classNames : [classNames];
  el.classList.add(...classes.filter(Boolean));
  return true;
};

/**
 * Removes CSS class(es) from element.
 * @param {ElementRef} elementRef
 * @param {string | string[]} classNames
 * @returns {() => boolean}
 */
export const removeClass = (elementRef, classNames) => () => {
  const el = getElement(elementRef);
  if (!el || !classNames) {
    return false;
  }

  const classes = Array.isArray(classNames) ? classNames : [classNames];
  el.classList.remove(...classes.filter(Boolean));
  return true;
};

/**
 * Sets innerHTML safely (with optional sanitization).
 * @param {ElementRef} elementRef
 * @param {string} html
 * @param {(html: string) => string} [sanitize]
 * @returns {() => boolean}
 */
export const setHTML = (elementRef, html, sanitize) => () => {
  const el = getElement(elementRef);
  if (!el || typeof html !== 'string') {
    return false;
  }

  const safeHtml = sanitize ? sanitize(html) : html;
  el.innerHTML = safeHtml;
  return true;
};

/**
 * Sets textContent (XSS-safe).
 * @param {ElementRef} elementRef
 * @param {string} text
 * @returns {() => boolean}
 */
export const setText = (elementRef, text) => () => {
  const el = getElement(elementRef);
  if (!el) {
    return false;
  }

  el.textContent = text ?? '';
  return true;
};

/**
 * Sets value of form element + dispatches input event.
 * @param {ElementRef} elementRef
 * @param {string | number} value
 * @returns {() => boolean}
 */
export const setValue = (elementRef, value) => () => {
  const el = getElement(elementRef);
  if (!el || !('value' in el)) {
    return false;
  }

  el.value = value ?? '';
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
};

/**
 * Gets value of form element.
 * @param {ElementRef} elementRef
 * @returns {() => string | null}
 */
export const getValue = (elementRef) => () => {
  const el = getElement(elementRef);
  if (!el || !('value' in el)) {
    return null;
  }
  return String(el.value);
};

/**
 * Focuses element with options.
 * @param {ElementRef} elementRef
 * @param {FocusOpts} [options]
 * @returns {() => boolean}
 */
export const focus = (elementRef, options) => () => {
  const el = getElement(elementRef);
  if (!el || typeof el.focus !== 'function') {
    return false;
  }
  el.focus(options);
  return true;
};

/**
 * Blurs element.
 * @param {ElementRef} elementRef
 * @returns {() => boolean}
 */
export const blur = (elementRef) => () => {
  const el = getElement(elementRef);
  if (!el || typeof el.blur !== 'function') {
    return false;
  }
  el.blur();
  return true;
};

/**
 * Scrolls element into view.
 * @param {ElementRef} elementRef
 * @param {ScrollOptions} [options]
 * @returns {() => boolean}
 */
export const scrollIntoView =
  (elementRef, options = { behavior: 'smooth', block: 'nearest' }) =>
  () => {
    const el = getElement(elementRef);
    if (!el || typeof el.scrollIntoView !== 'function') {
      return false;
    }
    el.scrollIntoView(options);
    return true;
  };

/**
 * Sets hidden attribute.
 * @param {ElementRef} elementRef
 * @param {boolean} [hidden=true]
 * @returns {() => boolean}
 */
export const setHidden =
  (elementRef, hidden = true) =>
  () => {
    const el = getElement(elementRef);
    if (!el) {
      return false;
    }
    hidden ? el.setAttribute('hidden', '') : el.removeAttribute('hidden');
    return true;
  };

/**
 * Sets aria-hidden attribute.
 * @param {ElementRef} elementRef
 * @param {boolean} [hidden=true]
 * @returns {() => boolean}
 */
export const setAriaHidden =
  (elementRef, hidden = true) =>
  () => {
    const el = getElement(elementRef);
    if (!el) {
      return false;
    }
    el.setAttribute('aria-hidden', String(hidden));
    return true;
  };

/**
 * Sets aria-current attribute for navigation.
 * @param {ElementRef} elementRef
 * @param {string | boolean} [current='page']
 * @returns {() => boolean}
 */
export const setAriaCurrent =
  (elementRef, current = 'page') =>
  () => {
    const el = getElement(elementRef);
    if (!el) {
      return false;
    }

    if (current === true || current === 'true') {
      el.setAttribute('aria-current', 'page');
    } else if (current === false || current === 'false' || !current) {
      el.removeAttribute('aria-current');
    } else {
      el.setAttribute('aria-current', String(current));
    }
    return true;
  };

/**
 * Checks if element matches selector.
 * @param {ElementRef} elementRef
 * @param {string} selector
 * @returns {() => boolean}
 */
export const matches = (elementRef, selector) => () => {
  const el = getElement(elementRef);
  if (!el || typeof el.matches !== 'function' || !selector) {
    return false;
  }
  return el.matches(selector);
};

/**
 * Finds closest ancestor matching selector (for event delegation).
 * @param {ElementRef} elementRef
 * @param {string} selector
 * @returns {() => Element | null}
 */
export const closest = (elementRef, selector) => () => {
  const el = getElement(elementRef);
  if (!el || typeof el.closest !== 'function' || !selector) {
    return null;
  }
  return el.closest(selector);
};

/**
 * Checks if element is visible.
 * @param {ElementRef} elementRef
 * @returns {() => boolean}
 */
export const isVisible = (elementRef) => () => {
  const el = getElement(elementRef);
  if (!el) {
    return false;
  }
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
};

/**
 * Creates DOM element with options (pure factory → lazy effect).
 * @param {string} tagName
 * @param {Object} [options]
 * @param {Attributes} [options.dataset]
 * @param {Record<string, string>} [options.attrs]
 * @param {string} [options.className]
 * @param {string} [options.textContent]
 * @param {(HTMLElement | Node)[]} [options.children]
 * @returns {() => HTMLElement}
 */
export const createElement =
  (tagName, options = {}) =>
  () => {
    const { dataset, attrs, className, textContent, children = [] } = options;
    const el = document.createElement(tagName);

    if (dataset) {
      setAttributes(el, dataset)();
    }
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
      }
    }
    if (className) {
      el.className = className;
    }
    if (textContent !== undefined) {
      el.textContent = textContent;
    }
    for (const child of children) {
      if (child instanceof Node) {
        el.appendChild(child);
      }
    }
    return el;
  };

/**
 * Appends child nodes to parent.
 * @param {ElementRef} parentRef
 * @param {(HTMLElement | Node)[]} children
 * @returns {() => boolean}
 */
export const appendChildren = (parentRef, children) => () => {
  const parent = getElement(parentRef);
  if (!parent || !Array.isArray(children)) {
    return false;
  }
  for (const child of children) {
    if (child instanceof Node) {
      parent.appendChild(child);
    }
  }
  return true;
};

/**
 * Removes element from DOM.
 * @param {ElementRef} elementRef
 * @returns {() => boolean}
 */
export const removeElement = (elementRef) => () => {
  const el = getElement(elementRef);
  if (!el || !el.parentNode) {
    return false;
  }
  el.parentNode.removeChild(el);
  return true;
};

/**
 * Replaces element with new content.
 * @param {ElementRef} elementRef
 * @param {HTMLElement | Node} newContent
 * @returns {() => boolean}
 */
export const replaceElement = (elementRef, newContent) => () => {
  const el = getElement(elementRef);
  if (!el || !el.parentNode || !(newContent instanceof Node)) {
    return false;
  }
  el.parentNode.replaceChild(newContent, el);
  return true;
};

/**
 * Batch multiple DOM effects in single rAF frame (avoid layout thrashing).
 * @param {(() => boolean)[]} effects - array of lazy DOM effects
 * @returns {() => Promise<boolean[]>}
 */
export const batchDOM = (effects) => () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      const results = effects.map((effect) => {
        try {
          return effect();
        } catch (e) {
          console.warn('[dom.batchDOM] Effect failed:', e);
          return false;
        }
      });
      resolve(results);
    });
  });

/**
 * Debounced DOM update helper.
 * @param {(() => boolean)[]} effects
 * @param {number} delay - ms
 * @returns {() => void}
 */
export const debouncedDOM =
  (effects, delay = 100) =>
  () => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        batchDOM(effects)();
      }, delay);
    };
  };

export default {
  query,
  queryAll,
  setState,
  getState,
  setDataFeature,
  setDataAction,
  setDataRenderTarget,
  getDataset,
  setAttributes,
  toggleClass,
  addClass,
  removeClass,
  setHTML,
  setText,
  setValue,
  getValue,
  focus,
  blur,
  scrollIntoView,
  setHidden,
  setAriaHidden,
  setAriaCurrent,
  matches,
  closest,
  isVisible,
  createElement,
  appendChildren,
  removeElement,
  replaceElement,
  batchDOM,
  debouncedDOM,
};
