// ts-check
// js/app/effects/http.js

/**
 * @typedef {Object} FetchOptions
 * @property {string} [method] - HTTP метод ('GET', 'POST', тощо)
 * @property {Object<string, string>} [headers] - додаткові заголовки
 * @property {Object|string} [body] - тіло запиту (автоматично stringify)
 * @property {number} [timeout] - таймаут у мілісекундах (за замовчуванням 10000)
 * @property {boolean} [parseJson=true] - чи парсити відповідь як JSON
 * @property {AbortSignal} [signal] - зовнішній сигнал для скасування
 * @property {RequestCache} [cache] - політика кешування
 * @property {RequestCredentials} [credentials] - чи надсилати cookie
 */

/**
 * @typedef {Object} FetchResult
 * @property {boolean} ok - чи успішний статус (2xx)
 * @property {number} status - HTTP статус код
 * @property {string} statusText - текст статусу
 * @property {any} data - розпарсені дані (або текст)
 * @property {Error} [error] - помилка, якщо сталася
 * @property {Response} [response] - сирий Response об'єкт
 * @property {Headers} [headers] - заголовки відповіді
 */

/**
 * @typedef {Object} MiddlewareContext
 * @property {string} url
 * @property {FetchOptions} options
 * @property {FetchResult} result
 * @property {Error} [error]
 */

/**
 * @typedef {(ctx: MiddlewareContext) => void | Promise<void>} HttpMiddleware
 */

// ===== PURE UTILITIES =====

/**
 * Pure: створює URL з query parameters
 * @param {string} baseUrl - базовий URL (може бути відносним)
 * @param {Record<string, string|number|boolean|null|undefined>} [params] - параметри запиту
 * @param {string} [origin] - базовий origin (за замовчуванням window.location.origin)
 * @returns {string} повний URL з query string
 */
export const buildUrl = (baseUrl, params = {}, origin = window.location.origin) => {
  if (!baseUrl) {
    console.warn('[http.buildUrl] Empty baseUrl');
    return '';
  }

  try {
    const url = new URL(baseUrl, origin);

    if (params && typeof params === 'object') {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  } catch (e) {
    console.error('[http.buildUrl] Invalid URL:', baseUrl, e);
    return baseUrl;
  }
};

/**
 * Pure: створює fetch options з auto-stringify body та дефолтними заголовками
 * @param {FetchOptions} options
 * @returns {RequestInit}
 */
export const buildFetchOptions = (options = {}) => {
  const { body, headers = {}, method = 'GET', ...rest } = options;

  const isJson =
    headers['Content-Type']?.includes('json') ||
    (!headers['Content-Type'] && body && typeof body === 'object');

  const init = {
    method,
    headers: {
      ...(isJson ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...rest,
  };

  // Auto-stringify body для JSON
  if (body !== undefined && body !== null) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return /** @type {RequestInit} */ (init);
};

/**
 * Pure: перевіряє чи потрібно парсити відповідь як JSON
 * @param {Response} response
 * @param {boolean} parseJson
 * @returns {boolean}
 */
const shouldParseJson = (response, parseJson) => {
  if (!parseJson) {
    return false;
  }
  const contentType = response.headers.get('content-type');
  return contentType?.includes('application/json') ?? false;
};

/**
 * Pure: створює FetchResult з Response
 * @param {Response} response
 * @param {any} data
 * @param {boolean} parseJson
 * @returns {Promise<FetchResult>}
 */
const createSuccessResult = async (response, data, parseJson) => ({
  ok: response.ok,
  status: response.status,
  statusText: response.statusText,
  data,
  headers: response.headers,
  response,
  parseJson,
});

/**
 * Pure: створює FetchResult з помилкою
 * @param {Response|null} response
 * @param {Error} error
 * @returns {FetchResult}
 */
const createErrorResult = (response, error) => ({
  ok: false,
  status: response?.status ?? 0,
  statusText: response?.statusText ?? 'Network Error',
  data: null,
  error,
  headers: response?.headers,
  response,
});

// ===== MAIN FETCH EFFECT =====

/**
 * Side-effect: виконує fetch з обробкою помилок, таймаутом та JSON-парсингом
 * @param {string} url - URL запиту
 * @param {FetchOptions} [options] - опції fetch
 * @returns {Promise<FetchResult>}
 */
export const fetchJson = async (url, options = {}) => {
  const { timeout = 10000, parseJson = true, signal: externalSignal, ...fetchOptions } = options;

  // AbortController для таймауту
  const controller = new AbortController();
  const timeoutId = timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null;

  // Об'єднуємо сигнали (зовнішній + таймаут)
  const signal = externalSignal
    ? AbortSignal.any([controller.signal, externalSignal])
    : controller.signal;

  try {
    const response = await fetch(url, {
      ...buildFetchOptions(fetchOptions),
      signal,
    });

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Парсинг відповіді
    let data = null;
    if (response.status !== 204 && shouldParseJson(response, parseJson)) {
      try {
        data = await response.json();
      } catch (parseError) {
        // Якщо JSON невалідний — повертаємо текст
        data = await response.text();
      }
    } else {
      data = await response.text();
    }
    return await createSuccessResult(response, data, parseJson);
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Класифікація помилок
    let friendlyError = error;
    if (error.name === 'AbortError') {
      friendlyError = new Error('Request timeout');
      friendlyError.name = 'TimeoutError';
    } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      friendlyError = new Error('Network error: check your connection');
      friendlyError.name = 'NetworkError';
    }

    return createErrorResult(null, friendlyError);
  }
};

// ===== CONVENIENCE WRAPPERS =====

export const http = {
  /**
   * GET request
   * @param {string} url
   * @param {Record<string, any>} [params] - query params
   * @param {Omit<FetchOptions, 'method' | 'body'>} [options]
   * @returns {Promise<FetchResult>}
   */
  get: (url, params, options) => fetchJson(buildUrl(url, params), { method: 'GET', ...options }),

  /**
   * POST request
   * @param {string} url
   * @param {any} body - request body (auto-stringified if object)
   * @param {Omit<FetchOptions, 'method'>} [options]
   * @returns {Promise<FetchResult>}
   */
  post: (url, body, options) => fetchJson(url, { method: 'POST', body, ...options }),

  /**
   * PUT request
   * @param {string} url
   * @param {any} body
   * @param {Omit<FetchOptions, 'method'>} [options]
   * @returns {Promise<FetchResult>}
   */
  put: (url, body, options) => fetchJson(url, { method: 'PUT', body, ...options }),

  /**
   * PATCH request
   * @param {string} url
   * @param {any} body
   * @param {Omit<FetchOptions, 'method'>} [options]
   * @returns {Promise<FetchResult>}
   */
  patch: (url, body, options) => fetchJson(url, { method: 'PATCH', body, ...options }),

  /**
   * DELETE request
   * @param {string} url
   * @param {Omit<FetchOptions, 'method' | 'body'>} [options]
   * @returns {Promise<FetchResult>}
   */
  delete: (url, options) => fetchJson(url, { method: 'DELETE', ...options }),
};

// ===== MIDDLEWARE SUPPORT =====

/**
 * Створює wrapper з middleware для логування, повторних спроб, тощо
 * @param {Function} fetchFn - базова функція fetch (напр. fetchJson)
 * @param {Object} middleware
 * @param {HttpMiddleware} [middleware.onRequest] - викликається перед запитом
 * @param {HttpMiddleware} [middleware.onResponse] - викликається після успішної відповіді
 * @param {HttpMiddleware} [middleware.onError] - викликається при помилці
 * @param {number} [middleware.retries] - кількість повторних спроб при помилці
 * @param {number} [middleware.retryDelay] - затримка між спробами в мс (за замовчуванням експоненційна)
 * @param {(attempt: number, error: Error) => boolean} [middleware.shouldRetry] - чи робити retry
 * @returns {Function} wrapped fetch function з тими ж параметрами
 */
export const withMiddleware = (fetchFn, middleware = {}) => {
  const { onRequest, onResponse, onError, retries = 0 } = middleware;

  return async (url, options) => {
    onRequest?.(url, options);

    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await fetchFn(url, options);
        onResponse?.(result);
        return result;
      } catch (error) {
        lastError = error;
        onError?.(error, url);
        if (attempt < retries) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError;
  };
};

// ===== PRESET MIDDLEWARE =====

/**
 * Middleware для консольного логування запитів
 * @param {string} label - префікс для логів
 * @param {boolean} [verbose=false] - чи логувати детально (тіло запиту/відповіді)
 * @returns {Object} middleware object для withMiddleware
 */
export const createLoggerMiddleware = (label = 'http', verbose = false) => ({
  onRequest: ({ url, options }) => {
    const method = options.method?.toUpperCase() || 'GET';
    const body = verbose && options.body ? JSON.stringify(options.body).slice(0, 200) : '';
    // eslint-disable-next-line no-console
    console.log(`[${label}] → ${method} ${url}${body ? ' | body: ' + body : ''}`);
  },

  onResponse: ({ url, result }) => {
    const data = verbose && result.data ? JSON.stringify(result.data).slice(0, 200) : '';
    // eslint-disable-next-line no-console
    console.log(
      `[${label}] ← ${result.status} ${result.ok ? '✓' : '✗'} ${url}${data ? ' | data: ' + data : ''}`,
    );
  },

  onError: ({ url, error }) => {
    console.error(`[${label}] ✗ ${url}:`, error?.message || error);
  },
});

/**
 * Middleware для збереження auth token в заголовках
 * @param {() => string|null} getToken - функція, що повертає токен
 * @param {string} [headerName='Authorization'] - назва заголовка
 * @param {string} [prefix='Bearer '] - префікс токена
 * @returns {Object} middleware object для withMiddleware
 */
export const createAuthMiddleware = (
  getToken,
  headerName = 'Authorization',
  prefix = 'Bearer ',
) => ({
  onRequest: ({ options }) => {
    const token = getToken?.();
    if (token && !options.headers?.[headerName]) {
      options.headers = {
        ...options.headers,
        [headerName]: `${prefix}${token}`,
      };
    }
  },
});

/**
 * Middleware для кешування GET-запитів в memory
 * @param {number} [ttl=60000] - час життя кешу в мс (за замовчуванням 1 хвилина)
 * @param {(url: string, options: FetchOptions) => string} [keyFn] - функція для генерації ключа кешу
 * @returns {Object} middleware object для withMiddleware + методи для очищення кешу
 */
export const createCacheMiddleware = (
  ttl = 60000,
  keyFn = (url, options) => `${options.method || 'GET'}:${url}`,
) => {
  const cache = new Map();

  const middleware = {
    onRequest: async ({ url, options, result }) => {
      // Тільки для GET запитів
      if ((options.method || 'GET').toUpperCase() !== 'GET') {
        return result;
      }

      const key = keyFn(url, options);
      const cached = cache.get(key);

      if (cached && Date.now() - cached.timestamp < ttl) {
        // Повертаємо кешовану відповідь (імітуємо результат)
        throw new Error('__CACHED__'); // Спеціальна помилка для переривання fetch
      }
    },

    onResponse: async ({ url, options, result }) => {
      if ((options.method || 'GET').toUpperCase() !== 'GET') {
        return;
      }
      if (!result.ok) {
        return;
      }

      const key = keyFn(url, options);
      cache.set(key, {
        result: { ...result }, // копія
        timestamp: Date.now(),
      });
    },
  };

  // Додаємо методи для управління кешем
  return {
    middleware,
    clear: () => cache.clear(),
    delete: (url, options) => cache.delete(keyFn(url, options)),
    getStats: () => ({ size: cache.size, keys: Array.from(cache.keys()) }),
  };
};

// ===== ERROR HELPERS =====

/**
 * Перевіряє чи результат є помилкою
 * @param {FetchResult} result
 * @returns {boolean}
 */
export const isError = (result) => !result.ok || !!result.error;

/**
 * Кидає помилку якщо результат не ok (для async/await з try/catch)
 * @param {FetchResult} result
 * @returns {FetchResult}
 * @throws {Error} якщо !result.ok
 */
export const assertOk = (result) => {
  if (!result.ok) {
    throw result.error || new Error(`HTTP ${result.status}: ${result.statusText}`);
  }
  return result;
};

/**чне отримання даних з fallback* @template T
 * @param {FetchResult} result
 * @param {T} [fallback]
 * @returns {T|null}
 */
export const getData = (result, fallback = null) =>
  result.ok && result.data !== undefined ? result.data : fallback;

// ===== EXPORTS =====

export default {
  fetchJson,
  buildUrl,
  buildFetchOptions,
  http,
  withMiddleware,
  createLoggerMiddleware,
  createAuthMiddleware,
  createCacheMiddleware,
  isError,
  assertOk,
  getData,
};
