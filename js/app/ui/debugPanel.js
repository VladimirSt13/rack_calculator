/* eslint-disable no-console */
// @ts-check
// js/app/ui/debugPanel.js
import { createEventManager } from '../effects/events.js';
import { setHTML, setState, setText } from '../effects/dom.js';
import { env, isDev } from '../config/env.js';

/**
 * @typedef {Object} DebugPanelConfig
 * @property {string} [containerSelector='#app'] - куди монтувати панель
 * @property {boolean} [collapsed=false] - початковий стан (згорнута)
 * @property {number} [maxLogs=50] - максимальна кількість логів
 * @property {Record<string, (...args: any[]) => any>} [stateRefs]  // ✅ Явний тип
 * @property {Function} [onLog] - callback для кожного логу (для інтеграції з сервісами)
 */

/**
 * @typedef {Object} DebugPanelAPI
 * @property {() => void} mount - ініціалізувати та відмалювати панель
 * @property {() => void} destroy - очистити слухачі та видалити DOM
 * @property {(msg: string, type?: 'info'|'warn'|'error'|'http') => void} log - додати лог
 * @property {(label: string, stateGetter: () => any) => void} registerState - зареєструвати стан для інспекції
 * @property {(listeners: readonly import('../effects/events.js').Listener[]) => void} updateListeners - оновити таблицю слухачів
 * @property {(route: string|null) => void} updateRoute - оновити поточний маршрут
 * @property {(collapsed: boolean) => void} setCollapsed - програмно згорнути/розгорнути
 */

// ===== PURE UTILS =====

/**
 * Format timestamp for logs
 * @param {Date} date
 * @returns {string}
 */
const formatTime = (date) =>
  date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/**
 * Safe JSON stringify with circular ref handling
 * @param {any} value
 * @param {number} [indent=2]
 * @returns {string}
 */
const safeStringify = (value, indent = 2) => {
  const seen = new WeakSet();
  return JSON.stringify(
    value,
    (key, val) => {
      if (val != null && typeof val === 'object') {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      // Filter out large/internal properties
      if (key === '_debug' || key === 'listeners' || key === 'middlewares') {
        return '[Filtered]';
      }
      return val;
    },
    indent,
  );
};

/**
 * Create log entry HTML (pure)
 * @param {string} message
 * @param {'info'|'warn'|'error'|'http'} type
 * @param {Date} timestamp
 * @returns {string}
 */
const createLogHTML = (message, type, timestamp) => `
  <div class="debug-log" data-type="${type}">
    <span class="debug-log__time">${formatTime(timestamp)}</span>
    <span class="debug-log__type debug-log__type--${type}">${type}</span>
    <span class="debug-log__message">${message}</span>
  </div>
`;

/**
 * Create listener row HTML (pure)
 * @param {import('../effects/events.js').Listener} listener
 * @returns {string}
 */
const createListenerRowHTML = (listener) => {
  const targetTag =
    listener.target instanceof Element ? listener.target.tagName.toLowerCase() : 'unknown';

  const handlerName =
    typeof listener.handler.name === 'string' && listener.handler.name
      ? listener.handler.name
      : 'anonymous';

  return `
    <tr>
      <td><code>${listener.event}</code></td>
      <td><code>${targetTag}</code></td>
      <td><code>${handlerName}</code></td>
      <td>${listener.options?.once ? '<span class="debug-badge debug-badge--active">once</span>' : ''}</td>
    </tr>
  `;
};

// ===== FACTORY =====

/**
 * Creates a debug panel with various utilities for debugging.
 * The panel is automatically mounted when the `mount` method is called.
 * The panel can be destroyed by calling the `destroy` method.
 *
 * @param {Object} [config] - Configuration options for the debug panel.
 * @param {string} [config.containerSelector='#app'] - CSS selector for the container element.
 * @param {boolean} [config.collapsed=false] - Initial collapsed state of the panel.
 * @param {number} [config.maxLogs=50] - Maximum number of logs to store.
 * @param {Object<string, function>} [config.stateRefs={}] - Map of state labels to state getter functions.
 * @param {function} [config.onLog] - Callback function for each log entry.
 *
 * @returns {Object} An object with the following methods:
 *   - `mount`: Mount the debug panel to the container element.
 *   - `destroy`: Destroy the debug panel and remove it from the container element.
 *   - `log`: Log a message with an optional type.
 *   - `registerState`: Registers a state getter for later inspection.
 *   - `updateListeners`: Update active listeners table with given listeners.
 *   - `updateRoute`: Updates the route badge in the debug panel.
 *   - `setCollapsed`: Sets the collapsed state of the panel.
 */
export const createDebugPanel = (config = {}) => {
  // Early exit for production
  if (!isDev()) {
    return {
      mount: () => {},
      destroy: () => {},
      log: () => {},
      registerState: () => {},
      updateListeners: () => {},
      updateRoute: () => {},
      setCollapsed: () => {},
    };
  }

  const {
    containerSelector = '#app',
    collapsed = false,
    maxLogs = 50,
    stateRefs = {},
    onLog,
  } = config;

  // Private mutable state (інкапсульовано)
  /** @type {HTMLElement | null} */
  let panelEl = null;
  /** @type {HTMLElement | null} */
  let logsContainer = null;
  /** @type {Array<{ msg: string, type: 'info'|'warn'|'error'|'http', time: Date }>} */
  let logs = [];
  const registeredStates = { ...stateRefs };
  /** @type {import('../effects/events.js').EventManager} */
  let eventManager = createEventManager();
  /** @type {boolean} */
  let isCollapsed = collapsed;

  // ===== PURE RENDER HELPERS =====

  const renderPanelStructure = () => `
    <div class="debug-panel__header" data-js="debug-header">
      <span class="debug-panel__title">🐛 Debug Panel</span>
      <button class="debug-panel__toggle" data-js="debug-toggle" aria-label="Toggle panel">▼</button>
    </div>
    <div class="debug-panel__body" data-js="debug-body">
      <!-- State Inspector -->
      <section class="debug-section" data-js="debug-state-section">
        <div class="debug-section__header">
          <span>State Inspector</span>
          <span class="debug-badge debug-badge--active" data-js="debug-route-badge">route: -</span>
        </div>
        <div class="debug-section__content">
          <div class="debug-state__selector">
            <select class="debug-state__input" data-js="debug-state-select"></select>
            <button class="debug-state__btn" data-js="debug-state-inspect">Inspect</button>
          </div>
          <pre class="debug-state__output" data-js="debug-state-output">// Select a state to inspect</pre>
        </div>
      </section>

      <!-- Event Listeners -->
      <section class="debug-section" data-js="debug-events-section">
        <div class="debug-section__header">
          <span>Active Listeners</span>
          <span class="debug-badge" data-js="debug-listeners-count">0</span>
        </div>
        <div class="debug-section__content">
          <table class="debug-listeners__table">
            <thead><tr><th>Event</th><th>Target</th><th>Handler</th><th>Opts</th></tr></thead>
            <tbody data-js="debug-listeners-body"></tbody>
          </table>
        </div>
      </section>

      <!-- HTTP Logs -->
      <section class="debug-section" data-js="debug-http-section">
        <div class="debug-section__header">
          <span>HTTP Requests</span>
          <button class="debug-panel__toggle" data-js="debug-http-clear" aria-label="Clear logs">🗑️</button>
        </div>
        <div class="debug-section__content" data-js="debug-http-logs"></div>
      </section>
    </div>
  `;

  // ===== SIDE EFFECTS (lazy) =====

  const mountPanel = () => () => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn('[DebugPanel] Container not found:', containerSelector);
      return false;
    }

    // Create panel element
    panelEl = document.createElement('div');
    panelEl.id = 'debug-panel';
    panelEl.dataset.collapsed = String(isCollapsed);
    panelEl.innerHTML = renderPanelStructure();

    // Append to container
    container.appendChild(panelEl);

    // Cache references
    logsContainer = panelEl.querySelector('[data-js="debug-http-logs"]');

    // Initialize state selector
    updateStateSelector();

    // Register event listeners
    registerPanelEvents();

    // Initial render
    renderLogs();

    console.log('[DebugPanel] Mounted');
    return true;
  };

  const registerPanelEvents = () => {
    const header = panelEl?.querySelector('[data-js="debug-header"]');
    const toggleBtn = panelEl?.querySelector('[data-js="debug-toggle"]');
    const inspectBtn = panelEl?.querySelector('[data-js="debug-state-inspect"]');
    const stateSelect = panelEl?.querySelector('[data-js="debug-state-select"]');
    const clearBtn = panelEl?.querySelector('[data-js="debug-http-clear"]');

    if (header && toggleBtn) {
      eventManager = eventManager.addListener(header)('click')(
        /** @param {MouseEvent} e */
        (e) => {
          if (e.target === toggleBtn) {
            return;
          }
          toggleCollapse();
        },
      );
    }

    if (toggleBtn) {
      eventManager = eventManager.addListener(toggleBtn)('click')(toggleCollapse);
    }

    if (inspectBtn && stateSelect) {
      eventManager = eventManager.addListener(inspectBtn)('click')(() => {
        const label = /** @type {HTMLSelectElement} */ (stateSelect).value;
        if (registeredStates[label]) {
          const value = registeredStates[label]();
          if (panelEl) {
            const output = panelEl.querySelector('[data-js="debug-state-output"]');
            if (output) {
              setText(output, safeStringify(value))();
            }
          }
        }
      });
    }

    if (clearBtn) {
      eventManager = eventManager.addListener(clearBtn)('click')(() => {
        logs = [];
        renderLogs();
      });
    }
  };

  const toggleCollapse = () => {
    isCollapsed = !isCollapsed;
    if (panelEl) {
      setState(panelEl, isCollapsed ? 'collapsed' : 'expanded')();
      panelEl.dataset.collapsed = String(isCollapsed);
      const toggleBtn = panelEl.querySelector('[data-js="debug-toggle"]');
      if (toggleBtn) {
        toggleBtn.textContent = isCollapsed ? '▲' : '▼';
      }
    }
  };

  const updateStateSelector = () => {
    const select = panelEl?.querySelector('[data-js="debug-state-select"]');
    if (!select) {
      return;
    }

    select.innerHTML = Object.keys(registeredStates)
      .map((label) => `<option value="${label}">${label}</>`)
      .join('');
  };

  const renderLogs = () => {
    if (!logsContainer) {
      return;
    }
    const html = logs
      .slice(-maxLogs)
      .map((log) => createLogHTML(log.msg, log.type, log.time))
      .join('');
    setHTML(logsContainer, html)();
    // Auto-scroll to bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;
  };

  // ===== INTERNAL LOG HELPER (доступна всюди у factory) =====
  /**
   * Internal logger - available via closure
   * @param {string} message
   * @param {'info'|'warn'|'error'|'http'} type
   * @returns {void}
   */
  const logInternal = (message, type = 'info') => {
    // 1. Завжди пишемо в консоль (для DevTools)
    const consoleMethod = type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[DebugPanel] ${message}`);

    // 2. Якщо panel змонтовано — додаємо в UI logs
    if (logsContainer) {
      logs.push({ msg: message, type, time: new Date() });
      if (logs.length > maxLogs) {
        logs.shift();
      } // Обмежуємо розмір
      requestAnimationFrame(renderLogs);
    }

    // 3. Callback для зовнішніх інтеграцій
    onLog?.({ msg: message, type, time: new Date() });
  };

  // ===== PUBLIC API =====

  return Object.freeze({
    mount: () => {
      mountPanel()();
      // Auto-log startup
      logInternal(`DebugPanel initialized @ ${env.APP_VERSION}`, 'info');
    },

    destroy: () => {
      eventManager.removeAllListeners();
      if (panelEl?.parentNode) {
        panelEl.parentNode.removeChild(panelEl);
      }
      panelEl = null;
      logsContainer = null;
      logs = [];
      console.log('[DebugPanel] Destroyed');
    },

    /**
     * Logs a message to the debug panel with an optional type.
     * Type can be one of 'info', 'warn', or 'error'.
     * If the debug panel is mounted, the log will be rendered.
     * If there is an external callback registered with `onLog`, it will be called.
     * The log message will also be console logged for dev tools.
     * @param {string} message - the message to log
     * @param {'info'|'warn'|'error'} [type='info'] - the type of log message
     */
    log: (message, type = 'info') => {
      const logEntry = { msg: message, type, time: new Date() };
      logs.push(logEntry);

      // Callback for external integrations
      onLog?.(logEntry);

      // Re-render if mounted
      if (logsContainer) {
        requestAnimationFrame(renderLogs);
      }

      // Also console log for dev tools
      const consoleMethod = type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[Debug:${type.toUpperCase()}]`, message);
    },

    /**
     * Registers a state getter for later inspection.
     * @param {string} label - unique label for the state
     * @param {function} stateGetter - function that returns the current state
     * @returns {void}
     */
    registerState: (label, stateGetter) => {
      if (typeof stateGetter !== 'function') {
        console.warn('[DebugPanel] stateGetter must be a function');
        return;
      }
      registeredStates[label] = stateGetter;
      updateStateSelector();
      logInternal(`State registered: ${label}`, 'info');
    },

    /**
     * Update active listeners table with given listeners
     * @param {import('../effects/events.js').Listener[]} listeners
     */
    updateListeners: (listeners) => {
      const tbody = panelEl?.querySelector('[data-js="debug-listeners-body"]');

      const countBadge = panelEl?.querySelector('[data-js="debug-listeners-count"]');
      if (!tbody || !countBadge) {
        return;
      }

      countBadge.textContent = String(listeners.length);

      if (listeners.length === 0) {
        setHTML(
          tbody,
          '<tr><td colspan="4" style="text-align:center;color:var(--color-text-secondary)">No active listeners</td></tr>',
        )();
        return;
      }

      const html = listeners.map(createListenerRowHTML).join('');
      setHTML(tbody, html)();
    },

    /**
     * Updates the route badge in the debug panel.
     *
     * @param {string} [route] - The current route. If not provided, the badge will be set to "route: -".
     */
    updateRoute: (route) => {
      const badge = panelEl?.querySelector('[data-js="debug-route-badge"]');
      if (badge) {
        badge.textContent = `route: ${route || '-'}`;
      }
    },

    /**
     * Sets the collapsed state of the panel.
     *
     * @param {boolean} collapsed - If `true`, the panel will be collapsed.
     * If `false`, the panel will be expanded.
     *
     * @returns {void} - Nothing.
     */
    setCollapsed: (collapsed) => {
      if (isCollapsed === collapsed) {
        return;
      }
      isCollapsed = collapsed;
      if (panelEl) {
        panelEl.dataset.collapsed = String(collapsed);
        const toggleBtn = panelEl.querySelector('[data-js="debug-toggle"]');
        if (toggleBtn) {
          toggleBtn.textContent = collapsed ? '▲' : '▼';
        }
      }
    },
  });
};
