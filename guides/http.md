# 🌐 Гайд по HTTP Effects в Rack Calculator

Цей документ описує архітектуру роботи з мережевими запитами, принцип роботи `fetchJson`, патерни middleware та інструкції для розробників.

---

## 📋 Зміст

1. [Філософія HTTP Effects](#філософія-http-effects)
2. [Архітектура](#архітектура)
3. [API довідник](#api-довідник)
4. [Middleware](#middleware)
5. [Best Practices](#best-practices)
6. [Приклади використання](#приклади-використання)
7. [Тестування](#тестування)
8. [Troubleshooting](#troubleshooting)

---

## 🧭 Філософія HTTP Effects

### Чому не `fetch` напряму?

| Прямий `fetch`                                | HTTP Effects                                  |
| --------------------------------------------- | --------------------------------------------- |
| ❌ Неможливо мокати без складних інструментів | ✅ Легко тестувати: передаємо mock-функції    |
| ❌ Різні підходи до обробки помилок           | ✅ Уніфікований `FetchResult` з полем `error` |
| ❌ Таймаути треба реалізовувати вручну        | ✅ Вбудований таймаут з `AbortController`     |
| ❌ JSON парсинг у кожному виклику             | ✅ Авто-парсинг з fallback на текст           |
| ❌ Middleware складно додати постфактум       | ✅ `withMiddleware` для будь-якого запиту     |
| ❌ Retry логіка дублюється                    | ✅ Централізована retry логіка в middleware   |

### Ключові принципи

```
┌─────────────────────────────────┐
│  HTTP Effect = async () => Result│
│                                 │
│  Pure function that returns     │
│  a Promise<FetchResult>         │
│                                 │
│  FetchResult: {                 │
│    ok: boolean,                 │
│    status: number,              │
│    data: any,                   │
│    error?: Error                │
│  }                              │
└─────────────────────────────────┘
```

| Принцип              | Опис                                               | Перевага                                         |
| -------------------- | -------------------------------------------------- | ------------------------------------------------ |
| **Result Pattern**   | Завжди повертаємо `{ ok, data, error }`            | Єдиний спосіб обробки успіху/помилки             |
| **Safe by Default**  | Таймаути, обробка мережевих помилок "з коробки"    | Менше бойлерплейту, краща стійкість              |
| **Middleware Chain** | Логування, retry, auth, кеш — підключаються окремо | Гнучкість без забруднення ядра                   |
| **Type Safety**      | Повна JSDoc типізація для кращої підтримки в IDE   | Автодоповнення, перевірка типів                  |
| **No Mutation**      | Не змінює вхідні параметри                         | Передбачуваність, безпечне повторне використання |

---

## 🏗️ Архітектура

### Типи даних

```javascript
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
```

### Потік виконання

```
1. http.get('/api/price.json', { page: 1 })
   │
   ▼
2. buildUrl('/api/price.json', { page: 1 })
   │ → 'https://yoursite.com/api/price.json?page=1'
   ▼
3. buildFetchOptions({ method: 'GET', ... })
   │ → { method: 'GET', headers: { 'Content-Type': 'application/json' } }
   ▼
4. fetchJson(url, options)
   │
   ├─► AbortController + timeout
   ├─► fetch(url, { ...options, signal })
   ├─► response.json() або response.text()
   └─► createSuccessResult / createErrorResult
   │
   ▼
5. Middleware chain (якщо з withMiddleware)
   │ → onRequest → fetch → onResponse / onError → retry?
   │
   ▼
6. Return Promise<FetchResult>
   │ → { ok: true, status: 200, data: {...}, error: undefined }
```

### Чому Result Pattern замість try/catch?

```javascript
// ❌ Класичний підхід (змусовує try/catch у кожному виклику)
try {
  const response = await fetch("/api/data");
  const data = await response.json();
  // обробка даних
} catch (error) {
  // обробка помилки
}

// ✅ Result Pattern (єдиний інтерфейс для успіху та помилки)
const result = await http.get("/api/data");

if (result.ok) {
  // обробка даних: result.data
} else {
  // обробка помилки: result.error
}

// Переваги:
// • Не потрібно обгортати кожен виклик у try/catch
// • Помилка — частина результату, а не виняток
// • Легше композирувати та тестувати
```

---

## 📚 API довідник

### 🔧 `buildUrl(baseUrl, params, origin)`

Створює повний URL з query parameters.

```javascript
import { buildUrl } from "../effects/http.js";

// Базове використання
const url = buildUrl("/api/price.json", { page: 1, limit: 10 });
// → 'https://yoursite.com/api/price.json?page=1&limit=10'

// З відносним URL
const url = buildUrl("/api/test", {}, "https://example.com");
// → 'https://example.com/api/test'

// Ігнорує null/undefined/порожні значення
const url = buildUrl("/api/search", {
  query: "rack",
  empty: "",
  null: null,
  undef: undefined,
});
// → '/api/search?query=rack'
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `baseUrl` | `string` | Базовий URL (може бути відносним) |
| `params` | `Record<string, string|number|boolean|null>` | Query параметри |
| `origin` | `string` | Базовий origin (за замовчуванням `window.location.origin`) |

**Повертає:** `string` — повний URL

---

### ⚙️ `buildFetchOptions(options)`

Створює `RequestInit` для fetch з авто-обробкою body та headers.

```javascript
import { buildFetchOptions } from "../effects/http.js";

// Об'єкт body автоматично stringify
const options = buildFetchOptions({
  method: "POST",
  body: { name: "Test", value: 123 },
});
// → {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: '{"name":"Test","value":123}'
// }

// String body залишається без змін
const options = buildFetchOptions({
  method: "POST",
  body: "raw text",
});
// → body: 'raw text' (без змін)

// Custom headers перевизначають дефолтні
const options = buildFetchOptions({
  headers: {
    "Content-Type": "text/plain", // перевизначає application/json
    "X-Custom-Header": "value",
  },
});
```

**Повертає:** `RequestInit` — об'єкт для передачі у `fetch()`

---

### 🌐 `fetchJson(url, options)`

Основна функція для HTTP-запитів з обробкою помилок, таймаутом та JSON-парсингом.

```javascript
import { fetchJson } from '../effects/http.js';

// GET запит
const result = await fetchJson('/api/price.json');

// З таймаутом
const result = await fetchJson('/api/slow-endpoint', {
  timeout: 30000 // 30 секунд замість дефолтних 10
});

// POST з body
const result = await fetchJson('/api/calculate', {
  method: 'POST',
  body: { form: {...}, price: {...} }
});

// Без JSON парсингу (для тексту/файлів)
const result = await fetchJson('/api/export.txt', {
  parseJson: false
});

// Зовнішній AbortSignal для скасування
const controller = new AbortController();
const result = await fetchJson('/api/data', {
  signal: controller.signal
});
// controller.abort() скасує запит
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `url` | `string` | URL запиту |
| `options.timeout` | `number` | Таймаут у мс (за замовчуванням 10000, 0 = вимкнено) |
| `options.parseJson` | `boolean` | Чи парсити відповідь як JSON (за замовчуванням true) |
| `options.signal` | `AbortSignal` | Зовнішній сигнал для скасування |
| `options.method` | `string` | HTTP метод |
| `options.headers` | `Object` | Додаткові заголовки |
| `options.body` | `Object|string` | Тіло запиту |
| `options.cache` | `RequestCache` | Політика кешування |
| `options.credentials` | `RequestCredentials` | Чи надсилати cookie |

**Повертає:** `Promise<FetchResult>`

**FetchResult структура:**

```javascript
{
  ok: true/false,           // true для статусів 2xx
  status: 200,              // HTTP статус код
  statusText: 'OK',         // Текст статусу
  data: {...},              // Розпарсені дані (або текст)
  error: undefined,         // Error об'єкт, якщо сталася помилка
  response: Response,       // Сирий Response об'єкт
  headers: Headers          // Заголовки відповіді
}
```

---

### 📦 `http.get/post/put/patch/delete`

Зручні wrapper-функції для поширених методів.

```javascript
import { http } from "../effects/http.js";

// GET з query params
const result = await http.get("/api/items", { page: 1, limit: 10 });

// POST з body
const result = await http.post("/api/items", { name: "New Item" });

// PUT для повного оновлення
const result = await http.put("/api/items/123", { name: "Updated" });

// PATCH для часткового оновлення
const result = await http.patch("/api/items/123", { status: "active" });

// DELETE
const result = await http.delete("/api/items/123");
```

**Повертає:** `Promise<FetchResult>`

---

### 🔌 `withMiddleware(fetchFn, middleware)`

Створює wrapper з middleware для логування, retry, auth, кешування.

```javascript
import { http, withMiddleware, createLoggerMiddleware } from "../effects/http.js";

// Fetch з логуванням
const loggedFetch = withMiddleware(http.get, createLoggerMiddleware("api"));

// Fetch з retry (2 спроби при помилці)
const resilientFetch = withMiddleware(http.get, {
  retries: 2,
  retryDelay: 1000, // 1 секунда між спробами
});

// Комбінація middleware
const robustFetch = withMiddleware(http.post, {
  ...createLoggerMiddleware("api", true), // verbose логи
  retries: 3,
  retryDelay: null, // експоненційна затримка: 1s, 2s, 4s...
  shouldRetry: (attempt, error) => {
    // Retry тільки для мережевих помилок та 5xx
    return (
      error?.name === "NetworkError" || error?.name === "TimeoutError" || (error?.status >= 500 && error?.status < 600)
    );
  },
  onRequest: ({ url, options }) => {
    console.log(`→ ${options.method} ${url}`);
  },
  onResponse: ({ result }) => {
    console.log(`← ${result.status} ${result.ok ? "✓" : "✗"}`);
  },
  onError: ({ error }) => {
    console.error(`✗ ${error?.message}`);
  },
});
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `fetchFn` | `Function` | Базова fetch функція (напр. `http.get`) |
| `middleware.onRequest` | `HttpMiddleware` | Викликається перед запитом |
| `middleware.onResponse` | `HttpMiddleware` | Викликається після успішної відповіді |
| `middleware.onError` | `HttpMiddleware` | Викликається при помилці |
| `middleware.retries` | `number` | Кількість повторних спроб |
| `middleware.retryDelay` | `number|null` | Затримка між спробами (null = експоненційна) |
| `middleware.shouldRetry` | `Function` | Чи робити retry: `(attempt, error) => boolean` |

**Повертає:** `Function` — wrapped fetch з тими ж параметрами

---

## 🔌 Middleware

### 📝 `createLoggerMiddleware(label, verbose)`

Middleware для консольного логування запитів.

```javascript
import { withMiddleware, createLoggerMiddleware } from "../effects/http.js";

// Базове логування
const api = withMiddleware(http, createLoggerMiddleware("rack-api"));
// Консоль: [rack-api] → GET /api/price.json
// Консоль: [rack-api] ← 200 ✓ /api/price.json

// Verbose (з тілом запиту/відповіді)
const api = withMiddleware(http, createLoggerMiddleware("rack-api", true));
// Консоль: [rack-api] → POST /api/calculate | body: {"form":{...}}
// Консоль: [rack-api] ← 200 ✓ /api/calculate |  {"rack":{...}}
```

**Коли використовувати:**

- ✅ Dev-режим для дебагу
- ❌ Production (або вимкніть через `process.env.NODE_ENV`)

---

### 🔐 `createAuthMiddleware(getToken, headerName, prefix)`

Автоматичне додавання auth токена в заголовки.

```javascript
import { withMiddleware, createAuthMiddleware } from "../effects/http.js";

// Базове використання (Bearer токен)
const getToken = () => localStorage.getItem("auth_token");
const authFetch = withMiddleware(http, createAuthMiddleware(getToken));

// Custom заголовок
const authFetch = withMiddleware(http, createAuthMiddleware(getToken, "X-API-Key", ""));

// Використання
const result = await authFetch.get("/api/protected");
// → Заголовок: Authorization: Bearer <token>
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `getToken` | `() => string|null` | Функція для отримання токена |
| `headerName` | `string` | Назва заголовка (за замовчуванням 'Authorization') |
| `prefix` | `string` | Префікс токена (за замовчуванням 'Bearer ') |

---

### 💾 `createCacheMiddleware(ttl, keyFn)`

Кешування GET-запитів в memory.

```javascript
import { withMiddleware, createCacheMiddleware } from "../effects/http.js";

// Кеш на 5 хвилин
const { middleware: cacheMiddleware, clear: clearCache } = createCacheMiddleware(
  5 * 60 * 1000, // 5 хвилин ttl
  (url, options) => `${options.method || "GET"}:${url}`, // ключ кешу
);

const cachedFetch = withMiddleware(http.get, cacheMiddleware);

// Використання
const loadPrice = async () => {
  const result = await cachedFetch("/api/price.json");
  return result.ok ? result.data : null;
};

// Примусове оновлення кешу
const refreshPrice = async () => {
  clearCache(); // або clearCache.delete('/api/price.json')
  return loadPrice();
};

// Статистика кешу
const stats = clearCache.getStats();
console.log("Cache:", stats); // { size: 5, keys: [...] }
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `ttl` | `number` | Час життя кешу в мс (за замовчуванням 60000) |
| `keyFn` | `Function` | Функція для генерації ключа кешу |

**Повертає:** `{ middleware, clear, delete, getStats }`

---

## ✨ Best Practices

### 1. Завжди обробляйте `result.ok`

```javascript
// ❌ Погано: припускаємо, що запит успішний
const result = await http.get("/api/data");
console.log(result.data); // Може бути null при помилці!

// ✅ Добре: перевіряємо ok
const result = await http.get("/api/data");
if (result.ok) {
  console.log(result.data);
} else {
  console.error("Request failed:", result.error);
}
```

### 2. Використовуйте `assertOk` для async/await з try/catch

```javascript
import { http, assertOk } from "../effects/http.js";

const loadConfig = async () => {
  try {
    const result = await http.get("/api/config.json");
    const data = assertOk(result).data; // Кидає помилку якщо !result.ok
    return { success: true, config: data };
  } catch (error) {
    console.error("Config load failed:", error);
    return { success: false, error };
  }
};
```

### 3. Налаштуйте адекватний таймаут

```javascript
// ❌ Погано: замалий таймаут для складних запитів
const result = await http.get("/api/report", { timeout: 1000 });

// ✅ Добре: різні таймаути для різних типів запитів
const quickFetch = (url) => http.get(url, { timeout: 5000 });
const reportFetch = (url) => http.get(url, { timeout: 30000 });
const uploadFetch = (url, body) => http.post(url, body, { timeout: 60000 });
```

### 4. Використовуйте middleware для логування тільки в dev

```javascript
// ❌ Погано: логи в production
const api = withMiddleware(http, createLoggerMiddleware("api"));

// ✅ Добре: умовне підключення
const api = process.env.NODE_ENV !== "production" ? withMiddleware(http, createLoggerMiddleware("api")) : http;
```

### 5. Кешуйте тільки безпечні GET-запити

```javascript
// ✅ Добре: кеш для статичних даних
const cachedPrice = withMiddleware(http.get, createCacheMiddleware(5 * 60 * 1000));

// ❌ Погано: кеш для персональних даних
const cachedProfile = withMiddleware(http.get, createCacheMiddleware(60000));
// → Може показати старі дані користувача!
```

### 6. Обробляйте специфічні помилки

```javascript
import { http } from '../effects/http.js';

const loadPrice = async () => {
  const result = await http.get('/api/price.json');

  if (result.ok) {
    return { success: true, data: result.data };
  }

  // Специфічна обробка за типом помилки
  if (result.error?.name === 'TimeoutError') {
    return { success: false, error: 'Закінчився час очікування. Спробуйте ще раз.' };
  }

  if (result.error?.name === 'NetworkError') {
    return { success: false, error: 'Немає з'єднання з інтернетом.' };
  }

  if (result.status === 401) {
    return { success: false, error: 'Необхідно увійти в систему.' };
  }

  if (result.status === 403) {
    return { success: false, error: 'Немає доступу до цього ресурсу.' };
  }

  if (result.status >= 500) {
    return { success: false, error: 'Помилка сервера. Спробуйте пізніше.' };
  }

  return { success: false, error: result.error?.message || 'Невідома помилка' };
};
```

### 7. Експортуйте чисті helpers для тестування

```javascript
// http.js
export const formatApiUrl = (endpoint) => {
  const base = process.env.API_BASE_URL || "https://api.example.com";
  return `${base}${endpoint}`;
};

// tests/http.test.js
import { formatApiUrl } from "../effects/http.js";

it("formats API URL correctly", () => {
  expect(formatApiUrl("/price.json")).toBe("https://api.example.com/price.json");
});
```

---

## 💻 Приклади використання

### Приклад 1: Завантаження цін з retry та логуванням

```javascript
// @ts-check
// js/app/pages/racks/state/rackActions.js

import { http, withMiddleware, createLoggerMiddleware } from "../../../effects/http.js";

// Fetch з логуванням та 2 спробами при помилці
const safeFetch = withMiddleware(http.get, {
  ...createLoggerMiddleware("rack-api", false),
  retries: 2,
  retryDelay: 1000,
  shouldRetry: (attempt, error) => {
    return (
      error?.name === "NetworkError" || error?.name === "TimeoutError" || (error?.status >= 500 && error?.status < 600)
    );
  },
});

export const createRackActions = (state) => ({
  loadPrice: async () => {
    const result = await safeFetch("/api/price.json");

    if (result.ok) {
      state.updateField("price", result.data);
      return { success: true, data: result.data };
    } else {
      console.error("Failed to load price:", result.error);
      return { success: false, error: result.error };
    }
  },
});
```

### Приклад 2: Auth-запити з токеном

```javascript
// @ts-check
// js/app/effects/api.js

import { http, withMiddleware, createAuthMiddleware } from "./http.js";

// Функція отримання токена (з вашого auth-модуля)
const getToken = () => localStorage.getItem("auth_token");

// Fetch з автоматичним додаванням токена
const authFetch = withMiddleware(http, createAuthMiddleware(getToken));

export const api = {
  // Публічні ендпоінти (без auth)
  public: {
    getPrice: () => http.get("/api/price.json"),
    getCatalog: (params) => http.get("/api/catalog", params),
  },

  // Захищені ендпоінти (з auth)
  protected: {
    getProfile: () => authFetch.get("/api/user/profile"),
    savePreset: (data) => authFetch.post("/api/presets", data),
    deletePreset: (id) => authFetch.delete(`/api/presets/${id}`),
  },
};
```

### Приклад 3: Кешування статичних даних

```javascript
// @ts-check
// js/app/effects/api.js

import { http, withMiddleware, createCacheMiddleware } from "./http.js";

// Кеш на 10 хвилин для каталогу
const { middleware: catalogCache, clear: clearCatalogCache } = createCacheMiddleware(
  10 * 60 * 1000,
  (url, options) => `catalog:${url}`,
);

const cachedCatalogFetch = withMiddleware(http.get, catalogCache);

export const loadCatalog = async () => {
  const result = await cachedCatalogFetch("/api/catalog");
  return result.ok ? result.data : null;
};

export const refreshCatalog = async () => {
  clearCatalogCache();
  return loadCatalog();
};
```

### Приклад 4: Завантаження з індикатором прогресу

```javascript
// @ts-check
// js/app/pages/racks/state/rackActions.js

import { fetchJson } from "../../../effects/http.js";

export const createRackActions = (state) => ({
  calculateRack: async (form, price, onProgress) => {
    // Для великих розрахунків — відправляємо частинами
    const result = await fetchJson("/api/calculate", {
      method: "POST",
      body: { form, price },
      timeout: 60000, // 1 хвилина для складних розрахунків
    });

    if (result.ok) {
      state.updateField("currentRack", result.data);
      return { success: true, rack: result.data };
    }

    return { success: false, error: result.error };
  },

  uploadFile: async (file, onProgress) => {
    // Для завантаження файлів з прогресом
    const formData = new FormData();
    formData.append("file", file);

    const result = await fetchJson("/api/upload", {
      method: "POST",
      body: formData,
      timeout: 120000, // 2 хвилини для великих файлів
      headers: {
        // Не встановлюємо Content-Type для FormData
      },
    });

    return result.ok ? { success: true, url: result.data.url } : { success: false, error: result.error };
  },
});
```

### Приклад 5: Batch-запити (кілька запитів паралельно)

```javascript
// @ts-check
// js/app/pages/racks/state/rackActions.js

import { http } from "../../../effects/http.js";

export const createRackActions = (state) => ({
  loadAllData: async () => {
    // Паралельне завантаження незалежних даних
    const [priceResult, catalogResult, presetsResult] = await Promise.all([
      http.get("/api/price.json"),
      http.get("/api/catalog"),
      http.get("/api/presets"),
    ]);

    const results = {
      price: priceResult.ok ? priceResult.data : null,
      catalog: catalogResult.ok ? catalogResult.data : null,
      presets: presetsResult.ok ? presetsResult.data : null,
    };

    const errors = [];
    if (!priceResult.ok) errors.push("price");
    if (!catalogResult.ok) errors.push("catalog");
    if (!presetsResult.ok) errors.push("presets");

    if (errors.length > 0) {
      console.warn("Some data failed to load:", errors);
    }

    // Оновлюємо стейт успішними даними
    if (results.price) state.updateField("price", results.price);
    if (results.catalog) state.updateField("catalog", results.catalog);
    if (results.presets) state.updateField("presets", results.presets);

    return {
      success: errors.length === 0,
      data: results,
      errors,
    };
  },
});
```

---

## 🧪 Тестування

### Мокування HTTP Effects

```javascript
// @ts-check
// tests/effects/http.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchJson, buildUrl, buildFetchOptions, http } from "../../app/effects/http.js";

describe("http utils", () => {
  describe("buildUrl", () => {
    it("appends query params correctly", () => {
      const url = buildUrl("/api/test", { id: 123, active: true });
      expect(url).toContain("/api/test?id=123&active=true");
    });

    it("ignores null/undefined params", () => {
      const url = buildUrl("/api/test", { id: 123, empty: null, undef: undefined });
      expect(url).toBe("/api/test?id=123");
    });

    it("handles relative URLs with origin", () => {
      const url = buildUrl("/api/test", {}, "https://example.com");
      expect(url).toBe("https://example.com/api/test");
    });
  });

  describe("buildFetchOptions", () => {
    it("stringifies object body", () => {
      const options = buildFetchOptions({ body: { a: 1 } });
      expect(options.body).toBe('{"a":1}');
      expect(options.headers["Content-Type"]).toBe("application/json");
    });

    it("preserves string body", () => {
      const options = buildFetchOptions({ body: "raw text" });
      expect(options.body).toBe("raw text");
    });

    it("merges custom headers", () => {
      const options = buildFetchOptions({
        headers: { "X-Custom": "value" },
      });
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(options.headers["X-Custom"]).toBe("value");
    });
  });
});

describe("fetchJson", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns success result for 200 response", async () => {
    const mockData = { price: 100 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => mockData,
      headers: new Headers({ "content-type": "application/json" }),
    });

    const result = await fetchJson("/api/test");

    expect(result.ok).toBe(true);
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeUndefined();
  });

  it("returns error result for network failure", async () => {
    global.fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const result = await fetchJson("/api/test");

    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.name).toBe("NetworkError");
  });

  it("respects timeout option", async () => {
    // Імітуємо повільний запит
    global.fetch.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 100)));

    const result = await fetchJson("/api/test", { timeout: 10 });

    expect(result.ok).toBe(false);
    expect(result.error?.name).toBe("TimeoutError");
  });

  it("handles non-JSON response", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "Plain text",
      headers: new Headers({ "content-type": "text/plain" }),
    });

    const result = await fetchJson("/api/test", { parseJson: true });

    expect(result.ok).toBe(true);
    expect(result.data).toBe("Plain text"); // fallback на текст
  });
});

describe("http wrappers", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: "ok" }),
      headers: new Headers(),
    });
  });

  it("http.get builds correct URL with params", async () => {
    await http.get("/api/items", { page: 1, limit: 10 });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/items?page=1&limit=10"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("http.post sends JSON body", async () => {
    await http.post("/api/items", { name: "Test" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/items",
      expect.objectContaining({
        method: "POST",
        body: '{"name":"Test"}',
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("http.delete sends correct method", async () => {
    await http.delete("/api/items/123");

    expect(global.fetch).toHaveBeenCalledWith("/api/items/123", expect.objectContaining({ method: "DELETE" }));
  });
});

describe("withMiddleware", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: "ok" }),
      headers: new Headers(),
    });
  });

  it("calls onRequest before fetch", async () => {
    const onRequest = vi.fn();
    const middlewareFetch = withMiddleware(http.get, { onRequest });

    await middlewareFetch("/api/test");

    expect(onRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("/api/test"),
        options: expect.objectContaining({ method: "GET" }),
      }),
    );
  });

  it("calls onResponse on success", async () => {
    const onResponse = vi.fn();
    const middlewareFetch = withMiddleware(http.get, { onResponse });

    await middlewareFetch("/api/test");

    expect(onResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        result: expect.objectContaining({ ok: true }),
      }),
    );
  });

  it("calls onError on failure", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const onError = vi.fn();
    const middlewareFetch = withMiddleware(http.get, { onError });

    await middlewareFetch("/api/test");

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(Error),
      }),
    );
  });

  it("retries on failure", async () => {
    global.fetch
      .mockRejectedValueOnce(new Error("First attempt"))
      .mockRejectedValueOnce(new Error("Second attempt"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "ok" }),
        headers: new Headers(),
      });

    const middlewareFetch = withMiddleware(http.get, { retries: 2 });
    const result = await middlewareFetch("/api/test");

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(result.ok).toBe(true);
  });
});
```

---

## 🐛 Troubleshooting

### ❌ CORS помилка

**Симптоми:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Перевірте:**

```javascript
// 1. Чи надсилає сервер правильні заголовки?
// Server має відповідати:
// Access-Control-Allow-Origin: https://yoursite.com
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE
// Access-Control-Allow-Headers: Content-Type, Authorization

// 2. Для локальної розробки — використовуйте proxy
// vite.config.js:
export default {
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
};

// 3. Для production — налаштуйте сервер
// Node.js/Express приклад:
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://yoursite.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
```

### ❌ JSON parse помилка

**Симптоми:** `Unexpected token < in JSON at position 0`

**Перевірте:**

```javascript
// 1. Чи повертає сервер дійсно JSON?
// Перевірте Content-Type відповіді:
const result = await fetchJson("/api/test");
console.log("Content-Type:", result.headers.get("content-type"));

// 2. Чи не повертає сервер HTML замість JSON (напр. при помилці 404/500)?
if (!result.ok) {
  console.log("Status:", result.status);
  console.log("Data:", result.data); // Може бути HTML сторінка помилки
}

// 3. Використовуйте parseJson: false для не-JSON відповідей
const result = await fetchJson("/api/export.txt", { parseJson: false });
```

### ❌ Таймаут не працює

**Симптоми:** Запит триває довше ніж вказаний `timeout`.

**Перевірте:**

```javascript
// 1. Чи timeout > 0?
const result = await fetchJson("/api/test", { timeout: 0 }); // 0 = вимкнено!
const result = await fetchJson("/api/test", { timeout: 10000 }); // ✅

// 2. Чи не скасовується запит зовнішнім сигналом?
const controller = new AbortController();
const result = await fetchJson("/api/test", {
  signal: controller.signal,
  timeout: 10000,
});
// controller.abort() скасує запит незалежно від timeout

// 3. Для дуже довгих запитів збільште timeout
const result = await fetchJson("/api/heavy-report", { timeout: 120000 }); // 2 хвилини
```

### ❌ Token не додається

**Симптоми:** Auth-запити повертають 401, хоча токен є в localStorage.

**Перевірте:**

```javascript
// 1. Чи повертає getToken() актуальний токен?
const getToken = () => localStorage.getItem("auth_token");
console.log("Token:", getToken()); // null = токен відсутній

// 2. Чи виконується middleware ДО запиту?
// createAuthMiddleware виконується в onRequest, який викликається перед fetch
const authFetch = withMiddleware(http, createAuthMiddleware(getToken));

// 3. Чи правильний формат заголовка?
// За замовчуванням: Authorization: Bearer <token>
// Для інших форматів:
const authFetch = withMiddleware(
  http,
  createAuthMiddleware(getToken, "X-API-Key", ""), // Без префіксу
);

// 4. Чи не перезаписується Content-Type?
// createAuthMiddleware не чіпає Content-Type, але перевірте інші middleware
```

### ❌ Кеш не оновлюється

**Симптоми:** Завантажуються старі дані навіть після змін на сервері.

**Перевірте:**

```javascript
// 1. Чи адекватний ttl?
const { middleware, clear } = createCacheMiddleware(
  5 * 60 * 1000, // 5 хвилин
);

// 2. Чи викликаєте clear() при зміні даних?
const saveItem = async (data) => {
  await http.post("/api/items", data);
  clear(); // Очищаємо кеш після запису
};

// 3. Чи правильний ключ кешу?
const { middleware, delete: deleteCache } = createCacheMiddleware(
  60000,
  (url, options) => `${options.method || "GET"}:${url}`,
);

// Для видалення конкретного URL:
deleteCache("/api/items", { method: "GET" });
```

### ❌ Retry зациклюється

**Симптоми:** Запит повторюється нескінченно або занадто багато разів.

**Перевірте:**

```javascript
// 1. Обмежте кількість спроб
const safeFetch = withMiddleware(http.get, {
  retries: 2, // Максимум 2 повторні спроби
});

// 2. Налаштуйте shouldRetry для обмеження умов
const safeFetch = withMiddleware(http.get, {
  retries: 3,
  shouldRetry: (attempt, error) => {
    // Retry тільки для тимчасових помилок
    return (
      error?.name === "NetworkError" || error?.name === "TimeoutError" || (error?.status >= 500 && error?.status < 600)
    );
    // Не retry для 4xx (клієнтські помилки)
  },
});

// 3. Використовуйте експоненційну затримку
const safeFetch = withMiddleware(http.get, {
  retries: 3,
  retryDelay: null, // Експоненційна: 1s, 2s, 4s...
  // або фіксована:
  retryDelay: 2000, // 2 секунди між спробами
});
```

---

## 📚 Додаткові ресурси

| Тема                    | Де шукати                                                             |
| ----------------------- | --------------------------------------------------------------------- |
| **Fetch API reference** | [MDN: Fetch](https://developer.mozilla.org/uk/docs/Web/API/Fetch_API) |
| **HTTP Status Codes**   | [HTTP Status Codes](https://httpstatuses.com/)                        |
| **CORS guide**          | [MDN: CORS](https://developer.mozilla.org/uk/docs/Web/HTTP/CORS)      |
| **Middleware pattern**  | `js/app/effects/http.js` → `withMiddleware`                           |
| **Testing HTTP**        | `tests/effects/http.test.js`                                          |

---

## 🚀 Шпаргалка: Швидкий старт HTTP-запиту

```javascript
// 1. Імпорт
import { http, withMiddleware, createLoggerMiddleware } from "../effects/http.js";

// 2. (Опціонально) Створення fetch з middleware
const api = withMiddleware(http, createLoggerMiddleware("my-api"));

// 3. GET запит
const result = await api.get("/endpoint", { param: "value" });

// 4. POST запит
const result = await api.post("/endpoint", { name: "Test" });

// 5. Обробка результату
if (result.ok) {
  // Успіх: result.data містить дані
  console.log("Data:", result.data);
} else {
  // Помилка: result.error містить деталі
  console.error("Error:", result.error);
}

// 6. Специфічна обробка помилок
if (result.error?.name === "TimeoutError") {
  // Повідомити користувача про таймаут
}

// 7. Готово! 🌐
```

---

> 💡 **Порада**: HTTP Effects — це ваш інструмент для **надійної** комунікації із сервером. Завжди обробляйте `result.ok`, використовуйте middleware для логування в dev, і налаштуйте адекватні таймаути для різних типів запитів.

Успіхів у роботі з мережевими запитами! 🌐✨
