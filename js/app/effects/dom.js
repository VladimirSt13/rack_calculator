// js/app/effects/dom.js

// ===== TYPODEF UPDATE =====
/**
 * @typedef {Element | HTMLElement | (() => Element|null) | (() => HTMLElement|null)} ElementRef
 */
/**
 * @typedef {HTMLElement | (() => HTMLElement|null)} ElementRef
 * @typedef {Record<string, string>} Attributes
 * @typedef {ScrollIntoViewOptions} ScrollOptions
 * @typedef {FocusOptions} FocusOpts
 */

/**
 * Pure: отримує HTMLElement з ElementRef (підтримує lazy evaluation)
 * @param {ElementRef} elementRef
 * @returns {HTMLElement|null}
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
 * Returns a function that queries the document for an element
 * matching the given CSS selector.
 * @param {string} selector - The CSS selector to query the document with.
 * @returns {() => HTMLElement|null} A function that returns the queried element.
 */
export const query = (selector) => () => {
  if (!selector || typeof selector !== 'string') {
    console.warn('[dom.query] Invalid selector:', selector);
    return null;
  }
  return document.querySelector(selector);
};

/**
 * Returns a function that queries ALL elements matching the selector.
 * @param {string} selector - The CSS selector to query with.
 * @returns {() => NodeListOf<HTMLElement>} A function that returns the NodeList.
 */
export const queryAll = (selector) => () => {
  if (!selector || typeof selector !== 'string') {
    console.warn('[dom.queryAll] Invalid selector:', selector);
    return document.createDocumentFragment().childNodes; // empty NodeList-like
  }
  return document.querySelectorAll(selector);
};

/**
 * Sets the state of an element using the data-state attribute.
 * @param {ElementRef} elementRef - The element or a function that returns the element.
 * @param {string} state - The state to set the element to.
 * @returns {() => boolean} A function that returns true if state was set.
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
 * Gets the current data-state of an element.
 * @param {ElementRef} elementRef
 * @returns {() => string|null}
 */
export const getState = (elementRef) => () => {
  const el = getElement(elementRef);
  return el?.dataset.state || null;
};

/**
 * Sets multiple data-* attributes on an element.
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
 * Toggles a CSS class on an element.
 * @param {ElementRef} elementRef
 * @param {string} className
 * @param {boolean} [force] - true to add, false to remove, undefined to toggle
 * @returns {() => boolean} - whether class is now present
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
 * Adds CSS class(es) to an element.
 * @param {ElementRef} elementRef
 * @param {string|string[]} classNames
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
 * Removes CSS class(es) from an element.
 * @param {ElementRef} elementRef
 * @param {string|string[]} classNames
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
 * Sets innerHTML safely (with optional sanitization hook).
 * @param {ElementRef} elementRef
 * @param {string} html
 * @param {(html: string) => string} [sanitize] - optional sanitizer function
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
 * Sets textContent of an element (safe from XSS).
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
 * Sets value of a form element (input, select, textarea).
 * @param {ElementRef} elementRef
 * @param {string|number} value
 * @returns {() => boolean}
 */
export const setValue = (elementRef, value) => () => {
  const el = getElement(elementRef);
  if (!el || !('value' in el)) {
    return false;
  }

  el.value = value ?? '';
  // Trigger input event for reactive frameworks
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
};

/**
 * Gets value of a form element.
 * @param {ElementRef} elementRef
 * @returns {() => string|null}
 */
export const getValue = (elementRef) => () => {
  const el = getElement(elementRef);
  if (!el || !('value' in el)) {
    return null;
  }
  return String(el.value);
};

/**
 * Focuses an element.
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
 * Blurs an element.
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
 * Sets hidden attribute on element.
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

    if (hidden) {
      el.setAttribute('hidden', '');
    } else {
      el.removeAttribute('hidden');
    }
    return true;
  };

/**
 * Sets aria-hidden attribute on element.
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
 * Sets aria-current attribute (for navigation).
 * @param {ElementRef} elementRef
 * @param {string|boolean} [current='page'] - 'page', 'step', 'location', 'date', 'time', or true/false
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
 * Checks if element matches a selector.
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
 * Checks if element is visible (not hidden, not display:none, not zero size).
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
 * Creates a DOM element with optional attributes and children.
 * @param {string} tagName
 * @param {Object} [options]
 * @param {Attributes} [options.dataset]
 * @param {Record<string, string>} [options.attrs]
 * @param {string} [options.className]
 * @param {string} [options.textContent]
 * @param {(HTMLElement|Node)[]} [options.children]
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
 * Appends child nodes to a parent element.
 * @param {ElementRef} parentRef
 * @param {(HTMLElement|Node)[]} children
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
 * Removes an element from DOM.
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
 * Replaces an element with new content.
 * @param {ElementRef} elementRef
 * @param {HTMLElement|Node} newContent
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

export default {
  query,
  queryAll,
  setState,
  getState,
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
  isVisible,
  createElement,
  appendChildren,
  removeElement,
  replaceElement,
};
