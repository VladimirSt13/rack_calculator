// js/app/core/EffectRegistry.js

/**
 * @typedef {Object} EffectRegistry
 * @property {(feature: string, name: string) => Element | null} get - отримати елемент
 * @property {(feature: string, name: string, html: string, sanitize?: (s: string) => string) => () => boolean} setHTML - встановити innerHTML
 * @property {(feature: string, name: string, text: string) => () => boolean} setText - встановити textContent
 * @property {(feature: string, name: string, value: string | number) => () => boolean} setValue - встановити value форми
 * @property {(feature: string, name: string, state: string) => () => boolean} setState - встановити data-state
 * @property {(feature: string, name: string, attr: string, value: string) => () => boolean} setAttr - встановити атрибут
 * @property {(feature: string, name: string, className: string) => () => boolean} addClass - додати клас
 * @property {(feature: string, name: string, className: string) => () => boolean} removeClass - видалити клас
 * @property {(feature: string, name: string, hidden?: boolean) => () => boolean} setHidden - встановити hidden
 * @property {(feature: string, renderTarget: string, content: string) => () => boolean} renderToTarget - рендер у зону за data-render-target
 * @property {(effects: (() => boolean)[]) => Promise<boolean[]>} batch - виконати масив ефектів в одному rAF
 */

/**
 * Creates effect registry for DOM operations with lazy evaluation
 * @param {Record<string, Record<string, string>>} selectors - мапа { feature: { name: selector } }
 * @returns {EffectRegistry}
 *
 * @example
 * const effects = createEffectRegistry(RACK_SELECTORS);
 * effects.setHTML('results', 'name', 'L2A1-3000')();  // ← виклик lazy effect
 *
 * // Batch multiple effects:
 * await effects.batch([
 *   effects.setHTML('results', 'name', newName),
 *   effects.setHTML('results', 'table', newTable),
 *   effects.setText('results', 'total', '1234 ₴'),
 * ]);
 */
export const createEffectRegistry = (selectors = {}) => {
  /**
   * Get element by feature + name
   * @param {string} feature
   * @param {string} name
   * @returns {Element | null}
   */
  const get = (feature, name) => {
    const selector = selectors[feature]?.[name];
    if (!selector) {
      console.warn(`[EffectRegistry] Selector not found: ${feature}.${name}`);
      return null;
    }
    return document.querySelector(selector);
  };

  /**
   * Set innerHTML safely (lazy effect)
   * @param {string} feature
   * @param {string} name
   * @param {string} html
   * @param {(html: string) => string} [sanitize]
   * @returns {() => boolean}
   */
  const setHTML = (feature, name, html, sanitize) => () => {
    const el = get(feature, name);
    if (!el || typeof html !== 'string') {
      return false;
    }
    try {
      el.innerHTML = sanitize ? sanitize(html) : html;
      return true;
    } catch (error) {
      console.error(`[EffectRegistry] setHTML failed: ${feature}.${name}`, error);
      return false;
    }
  };

  /**
   * Set textContent (XSS-safe)
   * @param {string} feature
   * @param {string} name
   * @param {string} text
   * @returns {() => boolean}
   */
  const setText = (feature, name, text) => () => {
    const el = get(feature, name);
    if (!el) {
      return false;
    }
    el.textContent = text ?? '';
    return true;
  };

  /**
   * Set value of form element
   * @param {string} feature
   * @param {string} name
   * @param {string | number} value
   * @returns {() => boolean}
   */
  const setValue = (feature, name, value) => () => {
    const el = get(feature, name);
    if (!el || !('value' in el)) {
      return false;
    }
    el.value = value ?? '';
    // Dispatch input event for reactivity
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  };

  /**
   * Set data-state attribute
   * @param {string} feature
   * @param {string} name
   * @param {string} state
   * @returns {() => boolean}
   */
  const setState = (feature, name, state) => () => {
    const el = get(feature, name);
    if (!el) {
      return false;
    }
    el.dataset.state = state;
    return true;
  };

  /**
   * Set arbitrary attribute
   * @param {string} feature
   * @param {string} name
   * @param {string} attr
   * @param {string} value
   * @returns {() => boolean}
   */
  const setAttr = (feature, name, attr, value) => () => {
    const el = get(feature, name);
    if (!el) {
      return false;
    }
    el.setAttribute(attr, value);
    return true;
  };

  /**
   * Add CSS class
   * @param {string} feature
   * @param {string} name
   * @param {string} className
   * @returns {() => boolean}
   */
  const addClass = (feature, name, className) => () => {
    const el = get(feature, name);
    if (!el || !className) {
      return false;
    }
    el.classList.add(className);
    return true;
  };

  /**
   * Remove CSS class
   * @param {string} feature
   * @param {string} name
   * @param {string} className
   * @returns {() => boolean}
   */
  const removeClass = (feature, name, className) => () => {
    const el = get(feature, name);
    if (!el || !className) {
      return false;
    }
    el.classList.remove(className);
    return true;
  };

  /**
   * Set hidden attribute
   * @param {string} feature
   * @param {string} name
   * @param {boolean} [hidden=true]
   * @returns {() => boolean}
   */
  const setHidden =
    (feature, name, hidden = true) =>
    () => {
      const el = get(feature, name);
      if (!el) {
        return false;
      }
      hidden ? el.setAttribute('hidden', '') : el.removeAttribute('hidden');
      return true;
    };

  /**
   * Render content to element with matching data-render-target
   * This is the main method for PageContext.renderResult
   * @param {string} feature
   * @param {string} renderTarget - value of data-render-target attribute
   * @param {string} content - HTML or text to render
   * @param {'html'|'text'} [type='html']
   * @returns {() => boolean}
   *
   * @example
   * // HTML: <output data-js="rackName" data-render-target="name">
   * effects.renderToTarget('results', 'name', 'L2A1-3000')();
   */
  const renderToTarget =
    (feature, renderTarget, content, type = 'html') =>
    () => {
      // Find all elements in this feature with matching data-render-target
      const featureSelectors = selectors[feature] || {};
      let rendered = false;

      for (const [name, selector] of Object.entries(featureSelectors)) {
        const el = document.querySelector(selector);
        if (el && el.dataset.renderTarget === renderTarget) {
          if (type === 'html') {
            el.innerHTML = content;
          } else {
            el.textContent = content;
          }
          rendered = true;
        }
      }

      if (!rendered) {
        console.warn(
          `[EffectRegistry] No element with data-render-target="${renderTarget}" in feature="${feature}"`,
        );
      }
      return rendered;
    };

  /**
   * Execute multiple effects in single rAF frame (avoid layout thrashing)
   * @param {(() => boolean)[]} effects
   * @returns {Promise<boolean[]>}
   */
  const batch = (effects) => {
    // ✅ FIX: уникати batch якщо вже виконується
    if (batch.isRunning) {
      // Додати в чергу або пропустити
      return Promise.resolve([]);
    }

    batch.isRunning = true;

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        try {
          const results = effects.map((effect) => {
            try {
              return effect();
            } catch (error) {
              console.warn('[EffectRegistry] Batch effect failed:', error);
              return false;
            }
          });
          resolve(results);
        } finally {
          batch.isRunning = false;
        }
      });
    });
  };
  batch.isRunning = false;

  return Object.freeze({
    get,
    setHTML,
    setText,
    setValue,
    setState,
    setAttr,
    addClass,
    removeClass,
    setHidden,
    renderToTarget,
    batch,
  });
};

/**
 * Helper: create registry with global + page selectors merged
 * @param {Record<string, Record<string, string>>} globalSelectors
 * @param {Record<string, Record<string, string>>} pageSelectors
 * @returns {EffectRegistry}
 */
export const createMergedRegistry = (globalSelectors, pageSelectors) => {
  const merged = { ...globalSelectors };
  for (const [feature, items] of Object.entries(pageSelectors)) {
    merged[feature] = { ...merged[feature], ...items };
  }
  return createEffectRegistry(merged);
};

export default createEffectRegistry;
