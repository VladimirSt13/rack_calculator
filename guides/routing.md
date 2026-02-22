# 🧭 Гайд по роутингу в Rack Calculator

Цей документ описує архітектуру навігації, принцип роботи та інструкції для розробників.

---

## 📋 Зміст

1. [Архітектура](#архітектура)
2. [Як працює навігація](#як-працює-навігація)
3. [Реєстрація нової сторінки](#реєстрація-нової-сторінки)
4. [Життєвий цикл сторінки](#життєвий-цикл-сторінки)
5. [Робота з URL](#робота-з-url)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)# 🧭 Гайд по роутингу в Rack Calculator

Цей документ описує архітектуру навігації, принцип роботи та інструкції для розробників.

---

## 📋 Зміст

1. [Архітектура](#архітектура)
2. [Як працює навігація](#як-працює-навігація)
3. [Реєстрація нової сторінки](#реєстрація-нової-сторінки)
4. [Життєвий цикл сторінки](#життєвий-цикл-сторінки)
5. [Робота з URL](#робота-з-url)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Архітектура

```
┌─────────────────────────────────────┐
│            HTML (index.html)         │
│  • <a data-view="rack">             │
│  • <section id="view-rack">         │
│  • <dialog data-js="modal-rackSet"> │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         js/app/config/              │
│  • app.config.js ← селектори, ID   │
│  • selectors.js  ← мапа data-js    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         js/app/ui/router.js         │
│  • createRouter() ← фабрика        │
│  • navigate(id) ← перехід          │
│  • attachNavigation() ← слухачі    │
│  • history.pushState ← URL         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│        js/app/pages/*/page.js       │
│  • init()    ← завантаження даних  │
│  • activate() ← показ UI, події    │
│  • deactivate() ← cleanup          │
└─────────────────────────────────────┘
```

### Ключові принципи

| Принцип              | Опис                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| **Hash-based**       | Використовуємо `#view-rack` замість `/rack` — не потрібен серверний роутинг    |
| **Immutable Router** | `createRouter()` повертає `Object.freeze()` API — стан інкапсульований         |
| **Lifecycle Hooks**  | Кожна сторінка має `init/activate/deactivate` для чистого управління ресурсами |
| **ARIA-first**       | `aria-current="page"` та `aria-hidden` для доступності                         |
| **Middleware-ready** | Через `state.use()` можна підключати логіку (persist, analytics)               |

---

## 🔄 Як працює навігація

### Крок 1: Клік на посилання

```html
<a href="#view-battery" class="nav-link" data-view="battery">Акумулятор</a>
```

1.  Браузер миттєво змінює URL на `/#view-battery`
2.  Спрацьовує обробник у `router.attachNavigation()`
3.  `e.preventDefault()` зупиняє стрибок до якоря

### Крок 2: Виклик `navigate()`

```javascript
// router.js
const navigate = async (id) => {
  // 1. Deactivate поточної сторінки
  if (context.currentRoute) {
    composeDeactivate(context, context.currentRoute);
  }

  // 2. Init (якщо вперше)
  await composeInit(context, id);

  // 3. Activate нової сторінки
  composeActivate(context, id);

  // 4. Switch DOM (show/hide sections)
  switchView(context, id);

  // 5. Update ARIA навігації
  updateNavigation(context, id);

  // 6. Оновити URL (якщо не співпадає)
  if (window.location.hash !== `#view-${id}`) {
    history.pushState({ pageId: id }, "", `#view-${id}`);
  }

  // 7. Оновити внутрішній стан
  withContext({ currentRoute: id });
};
```

### Крок 3: Реакція сторінки

```javascript
// pages/battery/page.js
export const batteryPage = {
  id: "battery",

  activate: (ctx) => {
    // ctx має: effects, selectors, currentRoute
    const form = document.querySelector('[data-js="batteryForm"]');
    form?.addEventListener("submit", handleSubmit);
  },

  deactivate: (ctx) => {
    // Cleanup: видаляємо слухачі, щоб уникнути витоків пам'яті
    const form = document.querySelector('[data-js="batteryForm"]');
    form?.removeEventListener("submit", handleSubmit);
  },
};
```

---

## 📝 Реєстрація нової сторінки

### Крок 1: Створіть HTML-секцію

```html
<!-- index.html -->
<section
  id="view-reports"
  class="section section--reports"
  aria-labelledby="reports-title"
  data-js="section-reports"
  hidden  <!-- За замовчуванням прихована -->
>
  <header class="section__header">
    <h2 id="reports-title" class="section__title">Звіти</h2>
  </header>

  <div class="section__body">
    <!-- Контент сторінки -->
  </div>
</section>
```

### Крок 2: Додайте посилання в навігацію

```html
<!-- index.html -->
<nav class="site-nav" aria-label="Головна навігація" data-js="site-nav">
  <ul class="nav-list">
    <li><a href="#view-rack" class="nav-link" data-view="rack">Стелаж</a></li>
    <li><a href="#view-battery" class="nav-link" data-view="battery">Акумулятор</a></li>
    <!-- Нова сторінка -->
    <li><a href="#view-reports" class="nav-link" data-view="reports">Звіти</a></li>
  </ul>
</nav>
```

### Крок 3: Створіть модуль сторінки

```javascript
// js/app/pages/reports/page.js
// @ts-check

/**
 * @typedef {import('../../ui/router.js').RouterContext} RouterContext
 */

export const reportsPage = {
  id: "reports",

  /**
   * Ініціалізація (виконується один раз при першому відкритті)
   * @returns {Promise<void>}
   */
  init: async () => {
    // Завантаження даних, якщо потрібно
    // const reports = await fetchReports();
    console.log("[Reports] Initialized");
  },

  /**
   * Активація (кожен раз при переході на сторінку)
   * @param {RouterContext} ctx
   */
  activate: (ctx) => {
    console.log("[Reports] Activated");

    // Реєстрація подій
    const btn = document.querySelector('[data-js="reports-generate"]');
    const handler = () => generateReport();
    btn?.addEventListener("click", handler);

    // Збережіть handler для cleanup, якщо потрібно
    // ctx.effects?.cleanup?.(() => btn?.removeEventListener('click', handler));
  },

  /**
   * Деактивація (кожен раз при переході з сторінки)
   * @param {RouterContext} ctx
   */
  deactivate: (ctx) => {
    console.log("[Reports] Deactivated");

    // Cleanup: видалення слухачів подій
    const btn = document.querySelector('[data-js="reports-generate"]');
    btn?.removeEventListener("click", generateReport);
  },
};

const generateReport = () => {
  // Логіка генерації звіту
};

export default reportsPage;
```

### Крок 4: Зареєструйте сторінку

```javascript
// js/app/pages/index.js
// @ts-check

import { batteryPage } from "./battery/page.js";
import { rackPage } from "./racks/page.js";
import { reportsPage } from "./reports/page.js"; // ← Імпорт нової сторінки

const PAGE_REGISTRY = {
  battery: batteryPage,
  rack: rackPage,
  reports: reportsPage, // ← Реєстрація
};

export const registerAllPages = async () => {
  // ... валідація та повернення routes ...
};
```

### Крок 5: Готово! 🎉

Роутер автоматично:

- ✅ Побачить нову сторінку через `registerRoutes()`
- ✅ Обробить клік на `<a data-view="reports">`
- ✅ Оновить `aria-current` у навігації
- ✅ Покаже `<section id="view-reports">`

---

## 🔄 Життєвий цикл сторінки

```
┌─────────────────┐
│   init()        │ ← Викликається 1 раз при першому відкритті
│   • Завантаження даних  │
│   • Ініціалізація стейту│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   activate()    │ ← Викликається КОЖЕН раз при переході НА сторінку
│   • Реєстрація подій  │
│   • Показ UI          │
│   • Анімації          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   [Користувач взаємодіє] │
│   • Кліки, ввід, тощо   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   deactivate()  │ ← Викликається КОЖЕН раз при переході З сторінки
│   • Видалення слухачів │
│   • Очищення таймерів  │
│   • Збереження стану   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   activate() іншої сторінки │
└─────────────────┘
```

### Коли що використовувати?

| Метод          | Коли викликається                      | Що робити                              | Приклад                                |
| -------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| `init()`       | 1 раз, при першому відкритті           | Завантажити дані, ініціалізувати стейт | `fetch('/api/price.json')`             |
| `activate()`   | Кожен раз при переході **на** сторінку | Показати UI, зареєструвати події       | `form.addEventListener('submit', ...)` |
| `deactivate()` | Кожен раз при переході **з** сторінки  | Видалити події, очистити ресурси       | `form.removeEventListener(...)`        |

---

## 🔗 Робота з URL

### Hash-навігація (поточний підхід)

```
URL: https://yoursite.com/#view-rack
     └─┬─┘ └────┬────┘
       │        │
   base path  hash route
```

**Переваги:**

- ✅ Працює на будь-якому хостингу (не потрібен серверний роутинг)
- ✅ Проста реалізація через `window.location.hash`
- ✅ Кнопки Back/Forward працюють "з коробки"

**Недоліки:**

- ❌ URL виглядає менш "чисто" (`#` замість `/`)
- ❌ SEO-дружність обмежена (пошуковці індексують hash гірше)

### Керування URL програмно

```javascript
// Змінити URL без перезавантаження
history.pushState({ pageId: "rack" }, "", "#view-rack");

// Отримати поточний hash
const currentHash = window.location.hash; // "#view-rack"
const pageId = currentHash.replace("#view-", ""); // "rack"

// Обробка кнопок Back/Forward
window.addEventListener("popstate", (event) => {
  const hash = window.location.hash.replace("#view-", "");
  if (hash) {
    router.navigate(hash); // Перехід без pushState
  }
});
```

### Синхронізація при завантаженні

```javascript
// js/main.js
const initApp = async () => {
  // ... ініціалізація роутера ...

  // Перевіряємо, чи є hash при завантаженні сторінки
  const initialHash = window.location.hash.replace("#view-", "");

  if (initialHash && router.hasRoute(initialHash)) {
    await router.navigate(initialHash);
  } else {
    await router.navigate(APP_CONFIG.DEFAULT_PAGE);
  }
};
```

---

## ✨ Best Practices

### 1. Завжди робіть cleanup у `deactivate()`

```javascript
// ❌ Погано: слухачі накопичуються
activate: (ctx) => {
  btn.addEventListener('click', handler);
},

// ✅ Добре: видаляємо при деактивації
let handler; // Зберігаємо посилання

activate: (ctx) => {
  handler = (e) => handleClick(e);
  btn.addEventListener('click', handler);
},

deactivate: (ctx) => {
  if (handler) {
    btn.removeEventListener('click', handler);
  }
},
```

### 2. Використовуйте `aria-current` для доступності

```html
<!-- Автоматично оновлюється через router.updateNav() -->
<a href="#view-rack" class="nav-link" data-view="rack" aria-current="page"> Стелаж </a>
```

```css
/* CSS: візуальний індикатор активної сторінки */
.nav-link[aria-current="page"] {
  font-weight: 600;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}
```

### 3. Не мутуйте стан сторінки в `init()`

```javascript
// ❌ Погано: пряма мутація
init: async () => {
  rackState.form.floors = 2; // Пряма мутація!
},

// ✅ Добре: через actions
init: async () => {
  rackActions.updateForm({ floors: 2 }); // Через API стейту
},
```

### 4. Використовуйте `batch()` для кількох оновлень

```javascript
// ❌ Погано: кілька сповіщень підряд
activate: () => {
  rackState.updateField('a', 1);
  rackState.updateField('b', 2);
  rackState.updateField('c', 3); // 3 рази notify()
},

// ✅ Добре: одне сповіщення після всіх змін
activate: () => {
  rackState.batch(() => {
    rackState.updateField('a', 1);
    rackState.updateField('b', 2);
    rackState.updateField('c', 3);
  }); // 1 раз notify()
},
```

### 5. Експортуйте селектори для UI

```javascript
// ✅ Добре: UI не знає про структуру стейту
// components/RackName.js
import { rackSelectors } from "../state/rackState.js";

const render = () => {
  const name = rackSelectors.getCurrentRack()?.abbreviation;
  element.textContent = name || "---";
};

// ❌ Погано: UI залежить від внутрішньої структури
const render = () => {
  const name = rackState.get().currentRack?.abbreviation; // Tight coupling!
};
```

---

## 🐛 Troubleshooting

### ❌ Сторінка не перемикається

**Симптоми:** Клік на посилання не змінює контент.

**Перевірте:**

```javascript
// 1. Чи зареєстрована сторінка?
console.log(router.getRoutes()); // Має містити 'rack', 'battery', ...

// 2. Чи співпадає data-view з id сторінки?
// HTML: <a data-view="rack">
// Page: export const rackPage = { id: 'rack', ... }

// 3. Чи є section з id="view-{id}"?
// HTML: <section id="view-rack">
```

### ❌ URL змінюється, але контент ні

**Симптоми:** Адресний рядок оновлюється, але `<section>` не показується.

**Перевірте:**

```javascript
// 1. Чи працює switchView?
// router.js має викликати effects.showPage(id)

// 2. Чи має section правильний data-js?
// HTML: <section data-js="section-rack">
// Config: SELECTORS.rack.section = "[data-js='section-rack']"

// 3. Чи не заблоковано hidden через CSS?
// Перевірте: .section { display: none; } та .section.is-active { display: block; }
```

### ❌ Кнопки Back/Forward не працюють

**Симптоми:** Натискання "Назад" у браузері не змінює сторінку.

**Перевірте:**

```javascript
// 1. Чи додано слухач popstate?
// router.js: window.addEventListener('popstate', handlePopState)

// 2. Чи обробляє handlePopState hash?
const handlePopState = () => {
  const hash = window.location.hash.replace("#view-", "");
  if (hash) navigate(hash); // Без pushState!
};

// 3. Чи не викликається pushState при popstate?
// navigate() має перевіряти: if (window.location.hash !== newHash) pushState(...)
```

### ❌ Витік пам'яті (слухачі не видаляються)

**Симптоми:** Після кількох переходів події спрацьовують кілька разів.

**Перевірте:**

```javascript
// 1. Чи є deactivate() у сторінці?
export const rackPage = {
  deactivate: (ctx) => {
    // Видалення слухачів
  }
};

// 2. Чи зберігаєте ви посилання на handler?
let clickHandler;
activate: () => {
  clickHandler = (e) => handleClick(e);
  btn.addEventListener('click', clickHandler);
},
deactivate: () => {
  btn.removeEventListener('click', clickHandler); // ✅
},

// 3. Використовуйте event delegation для динамічних елементів
// Замість: button.addEventListener(...) на кожному render
// Краще: container.addEventListener(...) на батьківському елементі
```

---

## 🧪 Тестування роутера

```javascript
// @ts-check
// tests/ui/router.test.js

import { describe, it, expect, vi } from "vitest";
import { createRouter, createRouterEffects } from "../../app/ui/router.js";

describe("router", () => {
  const mockEffects = {
    getPageElement: vi.fn((id) => document.createElement("section")),
    showPage: vi.fn(),
    hidePage: vi.fn(),
    updateNav: vi.fn(),
    log: vi.fn(),
  };

  const mockRoutes = {
    rack: {
      id: "rack",
      init: vi.fn().mockResolvedValue(),
      activate: vi.fn(),
      deactivate: vi.fn(),
    },
  };

  it("should navigate to valid route", async () => {
    const router = createRouter({
      routes: mockRoutes,
      defaultRoute: "rack",
      effects: mockEffects,
    });

    const result = await router.navigate("rack");

    expect(result).toBe(true);
    expect(mockRoutes.rack.activate).toHaveBeenCalled();
    expect(mockEffects.showPage).toHaveBeenCalledWith("rack");
  });

  it("should update aria-current on navigation", async () => {
    const router = createRouter({
      routes: mockRoutes,
      defaultRoute: "rack",
      effects: mockEffects,
    });

    await router.navigate("rack");

    expect(mockEffects.updateNav).toHaveBeenCalledWith("rack");
  });

  it("should call deactivate on previous route", async () => {
    const router = createRouter({
      routes: {
        rack: mockRoutes.rack,
        battery: { id: "battery", activate: vi.fn(), deactivate: vi.fn() },
      },
      defaultRoute: "rack",
      effects: mockEffects,
    });

    await router.navigate("rack");
    await router.navigate("battery");

    expect(mockRoutes.rack.deactivate).toHaveBeenCalled();
  });
});
```

---

## 📚 Додаткові ресурси

| Тема                     | Де шукати                                                                     |
| ------------------------ | ----------------------------------------------------------------------------- |
| **Додавання middleware** | `js/app/state/createState.js` → `use()` метод                                 |
| **Робота з стейтом**     | `js/app/state/` → `rackState.js`, `rackActions.js`                            |
| **Доступність (a11y)**   | [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)                  |
| **History API**          | [MDN: History API](https://developer.mozilla.org/uk/docs/Web/API/History_API) |
| **Тестування**           | `tests/ui/router.test.js` (приклад вище)                                      |

---

## 🚀 Шпаргалка: Швидкий старт нової сторінки

```bash
# 1. Створіть HTML-секцію
#    <section id="view-newpage" data-js="section-newpage" hidden>...</section>

# 2. Додайте посилання в навігацію
#    <a href="#view-newpage" data-view="newpage" class="nav-link">Нова</a>

# 3. Створіть js/app/pages/newpage/page.js
export const newPage = {
  id: 'newpage',
  init: async () => { /* завантаження */ },
  activate: (ctx) => { /* події, UI */ },
  deactivate: (ctx) => { /* cleanup */ },
};

# 4. Зареєструйте в js/app/pages/index.js
#    import { newPage } from "./newpage/page.js";
#    const PAGE_REGISTRY = { ..., newpage: newPage };

# 5. Готово! Перевірте в браузері 🔥
```

---

> 💡 **Порада**: Якщо щось не працює — відкрийте консоль браузера. Роутер логує всі переходи: `[Router] Navigated to: {id}`. Це найшвидший спосіб зрозуміти, де саме зупинився процес.

Успіхів у розробці! 🎯# 🧭 Гайд по роутингу в Rack Calculator

Цей документ описує архітектуру навігації, принцип роботи та інструкції для розробників.

---

## 📋 Зміст

1. [Архітектура](#архітектура)
2. [Як працює навігація](#як-працює-навігація)
3. [Реєстрація нової сторінки](#реєстрація-нової-сторінки)
4. [Життєвий цикл сторінки](#життєвий-цикл-сторінки)
5. [Робота з URL](#робота-з-url)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Архітектура

```
┌─────────────────────────────────────┐
│            HTML (index.html)         │
│  • <a data-view="rack">             │
│  • <section id="view-rack">         │
│  • <dialog data-js="modal-rackSet"> │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         js/app/config/              │
│  • app.config.js ← селектори, ID   │
│  • selectors.js  ← мапа data-js    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         js/app/ui/router.js         │
│  • createRouter() ← фабрика        │
│  • navigate(id) ← перехід          │
│  • attachNavigation() ← слухачі    │
│  • history.pushState ← URL         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│        js/app/pages/*/page.js       │
│  • init()    ← завантаження даних  │
│  • activate() ← показ UI, події    │
│  • deactivate() ← cleanup          │
└─────────────────────────────────────┘
```

### Ключові принципи

| Принцип              | Опис                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| **Hash-based**       | Використовуємо `#view-rack` замість `/rack` — не потрібен серверний роутинг    |
| **Immutable Router** | `createRouter()` повертає `Object.freeze()` API — стан інкапсульований         |
| **Lifecycle Hooks**  | Кожна сторінка має `init/activate/deactivate` для чистого управління ресурсами |
| **ARIA-first**       | `aria-current="page"` та `aria-hidden` для доступності                         |
| **Middleware-ready** | Через `state.use()` можна підключати логіку (persist, analytics)               |

---

## 🔄 Як працює навігація

### Крок 1: Клік на посилання

```html
<a href="#view-battery" class="nav-link" data-view="battery">Акумулятор</a>
```

1.  Браузер миттєво змінює URL на `/#view-battery`
2.  Спрацьовує обробник у `router.attachNavigation()`
3.  `e.preventDefault()` зупиняє стрибок до якоря

### Крок 2: Виклик `navigate()`

```javascript
// router.js
const navigate = async (id) => {
  // 1. Deactivate поточної сторінки
  if (context.currentRoute) {
    composeDeactivate(context, context.currentRoute);
  }

  // 2. Init (якщо вперше)
  await composeInit(context, id);

  // 3. Activate нової сторінки
  composeActivate(context, id);

  // 4. Switch DOM (show/hide sections)
  switchView(context, id);

  // 5. Update ARIA навігації
  updateNavigation(context, id);

  // 6. Оновити URL (якщо не співпадає)
  if (window.location.hash !== `#view-${id}`) {
    history.pushState({ pageId: id }, "", `#view-${id}`);
  }

  // 7. Оновити внутрішній стан
  withContext({ currentRoute: id });
};
```

### Крок 3: Реакція сторінки

```javascript
// pages/battery/page.js
export const batteryPage = {
  id: "battery",

  activate: (ctx) => {
    // ctx має: effects, selectors, currentRoute
    const form = document.querySelector('[data-js="batteryForm"]');
    form?.addEventListener("submit", handleSubmit);
  },

  deactivate: (ctx) => {
    // Cleanup: видаляємо слухачі, щоб уникнути витоків пам'яті
    const form = document.querySelector('[data-js="batteryForm"]');
    form?.removeEventListener("submit", handleSubmit);
  },
};
```

---

## 📝 Реєстрація нової сторінки

### Крок 1: Створіть HTML-секцію

```html
<!-- index.html -->
<section
  id="view-reports"
  class="section section--reports"
  aria-labelledby="reports-title"
  data-js="section-reports"
  hidden  <!-- За замовчуванням прихована -->
>
  <header class="section__header">
    <h2 id="reports-title" class="section__title">Звіти</h2>
  </header>

  <div class="section__body">
    <!-- Контент сторінки -->
  </div>
</section>
```

### Крок 2: Додайте посилання в навігацію

```html
<!-- index.html -->
<nav class="site-nav" aria-label="Головна навігація" data-js="site-nav">
  <ul class="nav-list">
    <li><a href="#view-rack" class="nav-link" data-view="rack">Стелаж</a></li>
    <li><a href="#view-battery" class="nav-link" data-view="battery">Акумулятор</a></li>
    <!-- Нова сторінка -->
    <li><a href="#view-reports" class="nav-link" data-view="reports">Звіти</a></li>
  </ul>
</nav>
```

### Крок 3: Створіть модуль сторінки

```javascript
// js/app/pages/reports/page.js
// @ts-check

/**
 * @typedef {import('../../ui/router.js').RouterContext} RouterContext
 */

export const reportsPage = {
  id: "reports",

  /**
   * Ініціалізація (виконується один раз при першому відкритті)
   * @returns {Promise<void>}
   */
  init: async () => {
    // Завантаження даних, якщо потрібно
    // const reports = await fetchReports();
    console.log("[Reports] Initialized");
  },

  /**
   * Активація (кожен раз при переході на сторінку)
   * @param {RouterContext} ctx
   */
  activate: (ctx) => {
    console.log("[Reports] Activated");

    // Реєстрація подій
    const btn = document.querySelector('[data-js="reports-generate"]');
    const handler = () => generateReport();
    btn?.addEventListener("click", handler);

    // Збережіть handler для cleanup, якщо потрібно
    // ctx.effects?.cleanup?.(() => btn?.removeEventListener('click', handler));
  },

  /**
   * Деактивація (кожен раз при переході з сторінки)
   * @param {RouterContext} ctx
   */
  deactivate: (ctx) => {
    console.log("[Reports] Deactivated");

    // Cleanup: видалення слухачів подій
    const btn = document.querySelector('[data-js="reports-generate"]');
    btn?.removeEventListener("click", generateReport);
  },
};

const generateReport = () => {
  // Логіка генерації звіту
};

export default reportsPage;
```

### Крок 4: Зареєструйте сторінку

```javascript
// js/app/pages/index.js
// @ts-check

import { batteryPage } from "./battery/page.js";
import { rackPage } from "./racks/page.js";
import { reportsPage } from "./reports/page.js"; // ← Імпорт нової сторінки

const PAGE_REGISTRY = {
  battery: batteryPage,
  rack: rackPage,
  reports: reportsPage, // ← Реєстрація
};

export const registerAllPages = async () => {
  // ... валідація та повернення routes ...
};
```

### Крок 5: Готово! 🎉

Роутер автоматично:

- ✅ Побачить нову сторінку через `registerRoutes()`
- ✅ Обробить клік на `<a data-view="reports">`
- ✅ Оновить `aria-current` у навігації
- ✅ Покаже `<section id="view-reports">`

---

## 🔄 Життєвий цикл сторінки

```
┌─────────────────┐
│   init()        │ ← Викликається 1 раз при першому відкритті
│   • Завантаження даних  │
│   • Ініціалізація стейту│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   activate()    │ ← Викликається КОЖЕН раз при переході НА сторінку
│   • Реєстрація подій  │
│   • Показ UI          │
│   • Анімації          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   [Користувач взаємодіє] │
│   • Кліки, ввід, тощо   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   deactivate()  │ ← Викликається КОЖЕН раз при переході З сторінки
│   • Видалення слухачів │
│   • Очищення таймерів  │
│   • Збереження стану   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   activate() іншої сторінки │
└─────────────────┘
```

### Коли що використовувати?

| Метод          | Коли викликається                      | Що робити                              | Приклад                                |
| -------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| `init()`       | 1 раз, при першому відкритті           | Завантажити дані, ініціалізувати стейт | `fetch('/api/price.json')`             |
| `activate()`   | Кожен раз при переході **на** сторінку | Показати UI, зареєструвати події       | `form.addEventListener('submit', ...)` |
| `deactivate()` | Кожен раз при переході **з** сторінки  | Видалити події, очистити ресурси       | `form.removeEventListener(...)`        |

---

## 🔗 Робота з URL

### Hash-навігація (поточний підхід)

```
URL: https://yoursite.com/#view-rack
     └─┬─┘ └────┬────┘
       │        │
   base path  hash route
```

**Переваги:**

- ✅ Працює на будь-якому хостингу (не потрібен серверний роутинг)
- ✅ Проста реалізація через `window.location.hash`
- ✅ Кнопки Back/Forward працюють "з коробки"

**Недоліки:**

- ❌ URL виглядає менш "чисто" (`#` замість `/`)
- ❌ SEO-дружність обмежена (пошуковці індексують hash гірше)

### Керування URL програмно

```javascript
// Змінити URL без перезавантаження
history.pushState({ pageId: "rack" }, "", "#view-rack");

// Отримати поточний hash
const currentHash = window.location.hash; // "#view-rack"
const pageId = currentHash.replace("#view-", ""); // "rack"

// Обробка кнопок Back/Forward
window.addEventListener("popstate", (event) => {
  const hash = window.location.hash.replace("#view-", "");
  if (hash) {
    router.navigate(hash); // Перехід без pushState
  }
});
```

### Синхронізація при завантаженні

```javascript
// js/main.js
const initApp = async () => {
  // ... ініціалізація роутера ...

  // Перевіряємо, чи є hash при завантаженні сторінки
  const initialHash = window.location.hash.replace("#view-", "");

  if (initialHash && router.hasRoute(initialHash)) {
    await router.navigate(initialHash);
  } else {
    await router.navigate(APP_CONFIG.DEFAULT_PAGE);
  }
};
```

---

## ✨ Best Practices

### 1. Завжди робіть cleanup у `deactivate()`

```javascript
// ❌ Погано: слухачі накопичуються
activate: (ctx) => {
  btn.addEventListener('click', handler);
},

// ✅ Добре: видаляємо при деактивації
let handler; // Зберігаємо посилання

activate: (ctx) => {
  handler = (e) => handleClick(e);
  btn.addEventListener('click', handler);
},

deactivate: (ctx) => {
  if (handler) {
    btn.removeEventListener('click', handler);
  }
},
```

### 2. Використовуйте `aria-current` для доступності

```html
<!-- Автоматично оновлюється через router.updateNav() -->
<a href="#view-rack" class="nav-link" data-view="rack" aria-current="page"> Стелаж </a>
```

```css
/* CSS: візуальний індикатор активної сторінки */
.nav-link[aria-current="page"] {
  font-weight: 600;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}
```

### 3. Не мутуйте стан сторінки в `init()`

```javascript
// ❌ Погано: пряма мутація
init: async () => {
  rackState.form.floors = 2; // Пряма мутація!
},

// ✅ Добре: через actions
init: async () => {
  rackActions.updateForm({ floors: 2 }); // Через API стейту
},
```

### 4. Використовуйте `batch()` для кількох оновлень

```javascript
// ❌ Погано: кілька сповіщень підряд
activate: () => {
  rackState.updateField('a', 1);
  rackState.updateField('b', 2);
  rackState.updateField('c', 3); // 3 рази notify()
},

// ✅ Добре: одне сповіщення після всіх змін
activate: () => {
  rackState.batch(() => {
    rackState.updateField('a', 1);
    rackState.updateField('b', 2);
    rackState.updateField('c', 3);
  }); // 1 раз notify()
},
```

### 5. Експортуйте селектори для UI

```javascript
// ✅ Добре: UI не знає про структуру стейту
// components/RackName.js
import { rackSelectors } from "../state/rackState.js";

const render = () => {
  const name = rackSelectors.getCurrentRack()?.abbreviation;
  element.textContent = name || "---";
};

// ❌ Погано: UI залежить від внутрішньої структури
const render = () => {
  const name = rackState.get().currentRack?.abbreviation; // Tight coupling!
};
```

---

## 🐛 Troubleshooting

### ❌ Сторінка не перемикається

**Симптоми:** Клік на посилання не змінює контент.

**Перевірте:**

```javascript
// 1. Чи зареєстрована сторінка?
console.log(router.getRoutes()); // Має містити 'rack', 'battery', ...

// 2. Чи співпадає data-view з id сторінки?
// HTML: <a data-view="rack">
// Page: export const rackPage = { id: 'rack', ... }

// 3. Чи є section з id="view-{id}"?
// HTML: <section id="view-rack">
```

### ❌ URL змінюється, але контент ні

**Симптоми:** Адресний рядок оновлюється, але `<section>` не показується.

**Перевірте:**

```javascript
// 1. Чи працює switchView?
// router.js має викликати effects.showPage(id)

// 2. Чи має section правильний data-js?
// HTML: <section data-js="section-rack">
// Config: SELECTORS.rack.section = "[data-js='section-rack']"

// 3. Чи не заблоковано hidden через CSS?
// Перевірте: .section { display: none; } та .section.is-active { display: block; }
```

### ❌ Кнопки Back/Forward не працюють

**Симптоми:** Натискання "Назад" у браузері не змінює сторінку.

**Перевірте:**

```javascript
// 1. Чи додано слухач popstate?
// router.js: window.addEventListener('popstate', handlePopState)

// 2. Чи обробляє handlePopState hash?
const handlePopState = () => {
  const hash = window.location.hash.replace("#view-", "");
  if (hash) navigate(hash); // Без pushState!
};

// 3. Чи не викликається pushState при popstate?
// navigate() має перевіряти: if (window.location.hash !== newHash) pushState(...)
```

### ❌ Витік пам'яті (слухачі не видаляються)

**Симптоми:** Після кількох переходів події спрацьовують кілька разів.

**Перевірте:**

```javascript
// 1. Чи є deactivate() у сторінці?
export const rackPage = {
  deactivate: (ctx) => {
    // Видалення слухачів
  }
};

// 2. Чи зберігаєте ви посилання на handler?
let clickHandler;
activate: () => {
  clickHandler = (e) => handleClick(e);
  btn.addEventListener('click', clickHandler);
},
deactivate: () => {
  btn.removeEventListener('click', clickHandler); // ✅
},

// 3. Використовуйте event delegation для динамічних елементів
// Замість: button.addEventListener(...) на кожному render
// Краще: container.addEventListener(...) на батьківському елементі
```

---

## 🧪 Тестування роутера

```javascript
// @ts-check
// tests/ui/router.test.js

import { describe, it, expect, vi } from "vitest";
import { createRouter, createRouterEffects } from "../../app/ui/router.js";

describe("router", () => {
  const mockEffects = {
    getPageElement: vi.fn((id) => document.createElement("section")),
    showPage: vi.fn(),
    hidePage: vi.fn(),
    updateNav: vi.fn(),
    log: vi.fn(),
  };

  const mockRoutes = {
    rack: {
      id: "rack",
      init: vi.fn().mockResolvedValue(),
      activate: vi.fn(),
      deactivate: vi.fn(),
    },
  };

  it("should navigate to valid route", async () => {
    const router = createRouter({
      routes: mockRoutes,
      defaultRoute: "rack",
      effects: mockEffects,
    });

    const result = await router.navigate("rack");

    expect(result).toBe(true);
    expect(mockRoutes.rack.activate).toHaveBeenCalled();
    expect(mockEffects.showPage).toHaveBeenCalledWith("rack");
  });

  it("should update aria-current on navigation", async () => {
    const router = createRouter({
      routes: mockRoutes,
      defaultRoute: "rack",
      effects: mockEffects,
    });

    await router.navigate("rack");

    expect(mockEffects.updateNav).toHaveBeenCalledWith("rack");
  });

  it("should call deactivate on previous route", async () => {
    const router = createRouter({
      routes: {
        rack: mockRoutes.rack,
        battery: { id: "battery", activate: vi.fn(), deactivate: vi.fn() },
      },
      defaultRoute: "rack",
      effects: mockEffects,
    });

    await router.navigate("rack");
    await router.navigate("battery");

    expect(mockRoutes.rack.deactivate).toHaveBeenCalled();
  });
});
```

---

## 📚 Додаткові ресурси

| Тема                     | Де шукати                                                                     |
| ------------------------ | ----------------------------------------------------------------------------- |
| **Додавання middleware** | `js/app/state/createState.js` → `use()` метод                                 |
| **Робота з стейтом**     | `js/app/state/` → `rackState.js`, `rackActions.js`                            |
| **Доступність (a11y)**   | [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)                  |
| **History API**          | [MDN: History API](https://developer.mozilla.org/uk/docs/Web/API/History_API) |
| **Тестування**           | `tests/ui/router.test.js` (приклад вище)                                      |

---

## 🚀 Шпаргалка: Швидкий старт нової сторінки

```bash
# 1. Створіть HTML-секцію
#    <section id="view-newpage" data-js="section-newpage" hidden>...</section>

# 2. Додайте посилання в навігацію
#    <a href="#view-newpage" data-view="newpage" class="nav-link">Нова</a>

# 3. Створіть js/app/pages/newpage/page.js
export const newPage = {
  id: 'newpage',
  init: async () => { /* завантаження */ },
  activate: (ctx) => { /* події, UI */ },
  deactivate: (ctx) => { /* cleanup */ },
};

# 4. Зареєструйте в js/app/pages/index.js
#    import { newPage } from "./newpage/page.js";
#    const PAGE_REGISTRY = { ..., newpage: newPage };

# 5. Готово! Перевірте в браузері 🔥
```

---

> 💡 **Порада**: Якщо щось не працює — відкрийте консоль браузера. Роутер логує всі переходи: `[Router] Navigated to: {id}`. Це найшвидший спосіб зрозуміти, де саме зупинився процес.

Успіхів у розробці! 🎯# 🧭 Гайд по роутингу в Rack Calculator

Цей документ описує архітектуру навігації, принцип роботи та інструкції для розробників.

---

## 📋 Зміст

1. [Архітектура](#архітектура)
2. [Як працює навігація](#як-працює-навігація)
3. [Реєстрація нової сторінки](#реєстрація-нової-сторінки)
4. [Життєвий цикл сторінки](#життєвий-цикл-сторінки)
5. [Робота з URL](#робота-з-url)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Архітектура

```
┌─────────────────────────────────────┐
│            HTML (index.html)         │
│  • <a data-view="rack">             │
│  • <section id="view-rack">         │
│  • <dialog data-js="modal-rackSet"> │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         js/app/config/              │
│  • app.config.js ← селектори, ID   │
│  • selectors.js  ← мапа data-js    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         js/app/ui/router.js         │
│  • createRouter() ← фабрика        │
│  • navigate(id) ← перехід          │
│  • attachNavigation() ← слухачі    │
│  • history.pushState ← URL         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│        js/app/pages/*/page.js       │
│  • init()    ← завантаження даних  │
│  • activate() ← показ UI, події    │
│  • deactivate() ← cleanup          │
└─────────────────────────────────────┘
```

### Ключові принципи

| Принцип              | Опис                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| **Hash-based**       | Використовуємо `#view-rack` замість `/rack` — не потрібен серверний роутинг    |
| **Immutable Router** | `createRouter()` повертає `Object.freeze()` API — стан інкапсульований         |
| **Lifecycle Hooks**  | Кожна сторінка має `init/activate/deactivate` для чистого управління ресурсами |
| **ARIA-first**       | `aria-current="page"` та `aria-hidden` для доступності                         |
| **Middleware-ready** | Через `state.use()` можна підключати логіку (persist, analytics)               |

---

## 🔄 Як працює навігація

### Крок 1: Клік на посилання

```html
<a href="#view-battery" class="nav-link" data-view="battery">Акумулятор</a>
```

1.  Браузер миттєво змінює URL на `/#view-battery`
2.  Спрацьовує обробник у `router.attachNavigation()`
3.  `e.preventDefault()` зупиняє стрибок до якоря

### Крок 2: Виклик `navigate()`

```javascript
// router.js
const navigate = async (id) => {
  // 1. Deactivate поточної сторінки
  if (context.currentRoute) {
    composeDeactivate(context, context.currentRoute);
  }

  // 2. Init (якщо вперше)
  await composeInit(context, id);

  // 3. Activate нової сторінки
  composeActivate(context, id);

  // 4. Switch DOM (show/hide sections)
  switchView(context, id);

  // 5. Update ARIA навігації
  updateNavigation(context, id);

  // 6. Оновити URL (якщо не співпадає)
  if (window.location.hash !== `#view-${id}`) {
    history.pushState({ pageId: id }, "", `#view-${id}`);
  }

  // 7. Оновити внутрішній стан
  withContext({ currentRoute: id });
};
```

### Крок 3: Реакція сторінки

```javascript
// pages/battery/page.js
export const batteryPage = {
  id: "battery",

  activate: (ctx) => {
    // ctx має: effects, selectors, currentRoute
    const form = document.querySelector('[data-js="batteryForm"]');
    form?.addEventListener("submit", handleSubmit);
  },

  deactivate: (ctx) => {
    // Cleanup: видаляємо слухачі, щоб уникнути витоків пам'яті
    const form = document.querySelector('[data-js="batteryForm"]');
    form?.removeEventListener("submit", handleSubmit);
  },
};
```

---

## 📝 Реєстрація нової сторінки

### Крок 1: Створіть HTML-секцію

```html
<!-- index.html -->
<section
  id="view-reports"
  class="section section--reports"
  aria-labelledby="reports-title"
  data-js="section-reports"
  hidden  <!-- За замовчуванням прихована -->
>
  <header class="section__header">
    <h2 id="reports-title" class="section__title">Звіти</h2>
  </header>

  <div class="section__body">
    <!-- Контент сторінки -->
  </div>
</section>
```

### Крок 2: Додайте посилання в навігацію

```html
<!-- index.html -->
<nav class="site-nav" aria-label="Головна навігація" data-js="site-nav">
  <ul class="nav-list">
    <li><a href="#view-rack" class="nav-link" data-view="rack">Стелаж</a></li>
    <li><a href="#view-battery" class="nav-link" data-view="battery">Акумулятор</a></li>
    <!-- Нова сторінка -->
    <li><a href="#view-reports" class="nav-link" data-view="reports">Звіти</a></li>
  </ul>
</nav>
```

### Крок 3: Створіть модуль сторінки

```javascript
// js/app/pages/reports/page.js
// @ts-check

/**
 * @typedef {import('../../ui/router.js').RouterContext} RouterContext
 */

export const reportsPage = {
  id: "reports",

  /**
   * Ініціалізація (виконується один раз при першому відкритті)
   * @returns {Promise<void>}
   */
  init: async () => {
    // Завантаження даних, якщо потрібно
    // const reports = await fetchReports();
    console.log("[Reports] Initialized");
  },

  /**
   * Активація (кожен раз при переході на сторінку)
   * @param {RouterContext} ctx
   */
  activate: (ctx) => {
    console.log("[Reports] Activated");

    // Реєстрація подій
    const btn = document.querySelector('[data-js="reports-generate"]');
    const handler = () => generateReport();
    btn?.addEventListener("click", handler);

    // Збережіть handler для cleanup, якщо потрібно
    // ctx.effects?.cleanup?.(() => btn?.removeEventListener('click', handler));
  },

  /**
   * Деактивація (кожен раз при переході з сторінки)
   * @param {RouterContext} ctx
   */
  deactivate: (ctx) => {
    console.log("[Reports] Deactivated");

    // Cleanup: видалення слухачів подій
    const btn = document.querySelector('[data-js="reports-generate"]');
    btn?.removeEventListener("click", generateReport);
  },
};

const generateReport = () => {
  // Логіка генерації звіту
};

export default reportsPage;
```

### Крок 4: Зареєструйте сторінку

```javascript
// js/app/pages/index.js
// @ts-check

import { batteryPage } from "./battery/page.js";
import { rackPage } from "./racks/page.js";
import { reportsPage } from "./reports/page.js"; // ← Імпорт нової сторінки

const PAGE_REGISTRY = {
  battery: batteryPage,
  rack: rackPage,
  reports: reportsPage, // ← Реєстрація
};

export const registerAllPages = async () => {
  // ... валідація та повернення routes ...
};
```

### Крок 5: Готово! 🎉

Роутер автоматично:

- ✅ Побачить нову сторінку через `registerRoutes()`
- ✅ Обробить клік на `<a data-view="reports">`
- ✅ Оновить `aria-current` у навігації
- ✅ Покаже `<section id="view-reports">`

---

## 🔄 Життєвий цикл сторінки

```
┌─────────────────┐
│   init()        │ ← Викликається 1 раз при першому відкритті
│   • Завантаження даних  │
│   • Ініціалізація стейту│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   activate()    │ ← Викликається КОЖЕН раз при переході НА сторінку
│   • Реєстрація подій  │
│   • Показ UI          │
│   • Анімації          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   [Користувач взаємодіє] │
│   • Кліки, ввід, тощо   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   deactivate()  │ ← Викликається КОЖЕН раз при переході З сторінки
│   • Видалення слухачів │
│   • Очищення таймерів  │
│   • Збереження стану   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   activate() іншої сторінки │
└─────────────────┘
```

### Коли що використовувати?

| Метод          | Коли викликається                      | Що робити                              | Приклад                                |
| -------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| `init()`       | 1 раз, при першому відкритті           | Завантажити дані, ініціалізувати стейт | `fetch('/api/price.json')`             |
| `activate()`   | Кожен раз при переході **на** сторінку | Показати UI, зареєструвати події       | `form.addEventListener('submit', ...)` |
| `deactivate()` | Кожен раз при переході **з** сторінки  | Видалити події, очистити ресурси       | `form.removeEventListener(...)`        |

---

## 🔗 Робота з URL

### Hash-навігація (поточний підхід)

```
URL: https://yoursite.com/#view-rack
     └─┬─┘ └────┬────┘
       │        │
   base path  hash route
```

**Переваги:**

- ✅ Працює на будь-якому хостингу (не потрібен серверний роутинг)
- ✅ Проста реалізація через `window.location.hash`
- ✅ Кнопки Back/Forward працюють "з коробки"

**Недоліки:**

- ❌ URL виглядає менш "чисто" (`#` замість `/`)
- ❌ SEO-дружність обмежена (пошуковці індексують hash гірше)

### Керування URL програмно

```javascript
// Змінити URL без перезавантаження
history.pushState({ pageId: "rack" }, "", "#view-rack");

// Отримати поточний hash
const currentHash = window.location.hash; // "#view-rack"
const pageId = currentHash.replace("#view-", ""); // "rack"

// Обробка кнопок Back/Forward
window.addEventListener("popstate", (event) => {
  const hash = window.location.hash.replace("#view-", "");
  if (hash) {
    router.navigate(hash); // Перехід без pushState
  }
});
```

### Синхронізація при завантаженні

```javascript
// js/main.js
const initApp = async () => {
  // ... ініціалізація роутера ...

  // Перевіряємо, чи є hash при завантаженні сторінки
  const initialHash = window.location.hash.replace("#view-", "");

  if (initialHash && router.hasRoute(initialHash)) {
    await router.navigate(initialHash);
  } else {
    await router.navigate(APP_CONFIG.DEFAULT_PAGE);
  }
};
```

---

## ✨ Best Practices

### 1. Завжди робіть cleanup у `deactivate()`

```javascript
// ❌ Погано: слухачі накопичуються
activate: (ctx) => {
  btn.addEventListener('click', handler);
},

// ✅ Добре: видаляємо при деактивації
let handler; // Зберігаємо посилання

activate: (ctx) => {
  handler = (e) => handleClick(e);
  btn.addEventListener('click', handler);
},

deactivate: (ctx) => {
  if (handler) {
    btn.removeEventListener('click', handler);
  }
},
```

### 2. Використовуйте `aria-current` для доступності

```html
<!-- Автоматично оновлюється через router.updateNav() -->
<a href="#view-rack" class="nav-link" data-view="rack" aria-current="page"> Стелаж </a>
```

```css
/* CSS: візуальний індикатор активної сторінки */
.nav-link[aria-current="page"] {
  font-weight: 600;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}
```

### 3. Не мутуйте стан сторінки в `init()`

```javascript
// ❌ Погано: пряма мутація
init: async () => {
  rackState.form.floors = 2; // Пряма мутація!
},

// ✅ Добре: через actions
init: async () => {
  rackActions.updateForm({ floors: 2 }); // Через API стейту
},
```

### 4. Використовуйте `batch()` для кількох оновлень

```javascript
// ❌ Погано: кілька сповіщень підряд
activate: () => {
  rackState.updateField('a', 1);
  rackState.updateField('b', 2);
  rackState.updateField('c', 3); // 3 рази notify()
},

// ✅ Добре: одне сповіщення після всіх змін
activate: () => {
  rackState.batch(() => {
    rackState.updateField('a', 1);
    rackState.updateField('b', 2);
    rackState.updateField('c', 3);
  }); // 1 раз notify()
},
```

### 5. Експортуйте селектори для UI

```javascript
// ✅ Добре: UI не знає про структуру стейту
// components/RackName.js
import { rackSelectors } from "../state/rackState.js";

const render = () => {
  const name = rackSelectors.getCurrentRack()?.abbreviation;
  element.textContent = name || "---";
};

// ❌ Погано: UI залежить від внутрішньої структури
const render = () => {
  const name = rackState.get().currentRack?.abbreviation; // Tight coupling!
};
```

---

## 🐛 Troubleshooting

### ❌ Сторінка не перемикається

**Симптоми:** Клік на посилання не змінює контент.

**Перевірте:**

```javascript
// 1. Чи зареєстрована сторінка?
console.log(router.getRoutes()); // Має містити 'rack', 'battery', ...

// 2. Чи співпадає data-view з id сторінки?
// HTML: <a data-view="rack">
// Page: export const rackPage = { id: 'rack', ... }

// 3. Чи є section з id="view-{id}"?
// HTML: <section id="view-rack">
```

### ❌ URL змінюється, але контент ні

**Симптоми:** Адресний рядок оновлюється, але `<section>` не показується.

**Перевірте:**

```javascript
// 1. Чи працює switchView?
// router.js має викликати effects.showPage(id)

// 2. Чи має section правильний data-js?
// HTML: <section data-js="section-rack">
// Config: SELECTORS.rack.section = "[data-js='section-rack']"

// 3. Чи не заблоковано hidden через CSS?
// Перевірте: .section { display: none; } та .section.is-active { display: block; }
```

### ❌ Кнопки Back/Forward не працюють

**Симптоми:** Натискання "Назад" у браузері не змінює сторінку.

**Перевірте:**

```javascript
// 1. Чи додано слухач popstate?
// router.js: window.addEventListener('popstate', handlePopState)

// 2. Чи обробляє handlePopState hash?
const handlePopState = () => {
  const hash = window.location.hash.replace("#view-", "");
  if (hash) navigate(hash); // Без pushState!
};

// 3. Чи не викликається pushState при popstate?
// navigate() має перевіряти: if (window.location.hash !== newHash) pushState(...)
```

### ❌ Витік пам'яті (слухачі не видаляються)

**Симптоми:** Після кількох переходів події спрацьовують кілька разів.

**Перевірте:**

```javascript
// 1. Чи є deactivate() у сторінці?
export const rackPage = {
  deactivate: (ctx) => {
    // Видалення слухачів
  }
};

// 2. Чи зберігаєте ви посилання на handler?
let clickHandler;
activate: () => {
  clickHandler = (e) => handleClick(e);
  btn.addEventListener('click', clickHandler);
},
deactivate: () => {
  btn.removeEventListener('click', clickHandler); // ✅
},

// 3. Використовуйте event delegation для динамічних елементів
// Замість: button.addEventListener(...) на кожному render
// Краще: container.addEventListener(...) на батьківському елементі
```

---

## 🧪 Тестування роутера

```javascript
// @ts-check
// tests/ui/router.test.js

import { describe, it, expect, vi } from "vitest";
import { createRouter, createRouterEffects } from "../../app/ui/router.js";

describe("router", () => {
  const mockEffects = {
    getPageElement: vi.fn((id) => document.createElement("section")),
    showPage: vi.fn(),
    hidePage: vi.fn(),
    updateNav: vi.fn(),
    log: vi.fn(),
  };

  const mockRoutes = {
    rack: {
      id: "rack",
      init: vi.fn().mockResolvedValue(),
      activate: vi.fn(),
      deactivate: vi.fn(),
    },
  };

  it("should navigate to valid route", async () => {
    const router = createRouter({
      routes: mockRoutes,
      defaultRoute: "rack",
      effects: mockEffects,
    });

    const result = await router.navigate("rack");

    expect(result).toBe(true);
    expect(mockRoutes.rack.activate).toHaveBeenCalled();
    expect(mockEffects.showPage).toHaveBeenCalledWith("rack");
  });

  it("should update aria-current on navigation", async () => {
    const router = createRouter({
      routes: mockRoutes,
      defaultRoute: "rack",
      effects: mockEffects,
    });

    await router.navigate("rack");

    expect(mockEffects.updateNav).toHaveBeenCalledWith("rack");
  });

  it("should call deactivate on previous route", async () => {
    const router = createRouter({
      routes: {
        rack: mockRoutes.rack,
        battery: { id: "battery", activate: vi.fn(), deactivate: vi.fn() },
      },
      defaultRoute: "rack",
      effects: mockEffects,
    });

    await router.navigate("rack");
    await router.navigate("battery");

    expect(mockRoutes.rack.deactivate).toHaveBeenCalled();
  });
});
```

---

## 📚 Додаткові ресурси

| Тема                     | Де шукати                                                                     |
| ------------------------ | ----------------------------------------------------------------------------- |
| **Додавання middleware** | `js/app/state/createState.js` → `use()` метод                                 |
| **Робота з стейтом**     | `js/app/state/` → `rackState.js`, `rackActions.js`                            |
| **Доступність (a11y)**   | [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)                  |
| **History API**          | [MDN: History API](https://developer.mozilla.org/uk/docs/Web/API/History_API) |
| **Тестування**           | `tests/ui/router.test.js` (приклад вище)                                      |

---

## 🚀 Шпаргалка: Швидкий старт нової сторінки

```bash
# 1. Створіть HTML-секцію
#    <section id="view-newpage" data-js="section-newpage" hidden>...</section>

# 2. Додайте посилання в навігацію
#    <a href="#view-newpage" data-view="newpage" class="nav-link">Нова</a>

# 3. Створіть js/app/pages/newpage/page.js
export const newPage = {
  id: 'newpage',
  init: async () => { /* завантаження */ },
  activate: (ctx) => { /* події, UI */ },
  deactivate: (ctx) => { /* cleanup */ },
};

# 4. Зареєструйте в js/app/pages/index.js
#    import { newPage } from "./newpage/page.js";
#    const PAGE_REGISTRY = { ..., newpage: newPage };

# 5. Готово! Перевірте в браузері 🔥
```

---

> 💡 **Порада**: Якщо щось не працює — відкрийте консоль браузера. Роутер логує всі переходи: `[Router] Navigated to: {id}`. Це найшвидший спосіб зрозуміти, де саме зупинився процес.

Успіхів у розробці! 🎯# 🧭 Гайд по роутингу в Rack Calculator

Цей документ описує архітектуру навігації, принцип роботи та інструкції для розробників.

---

## 📋 Зміст

1. [Архітектура](#архітектура)
2. [Як працює навігація](#як-працює-навігація)
3. [Реєстрація нової сторінки](#реєстрація-нової-сторінки)
4. [Життєвий цикл сторінки](#життєвий-цикл-сторінки)
5. [Робота з URL](#робота-з-url)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Архітектура

```
┌─────────────────────────────────────┐
│            HTML (index.html)         │
│  • <a data-view="rack">             │
│  • <section id="view-rack">         │
│  • <dialog data-js="modal-rackSet"> │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         js/app/config/              │
│  • app.config.js ← селектори, ID   │
│  • selectors.js  ← мапа data-js    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         js/app/ui/router.js         │
│  • createRouter() ← фабрика        │
│  • navigate(id) ← перехід          │
│  • attachNavigation() ← слухачі    │
│  • history.pushState ← URL         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│        js/app/pages/*/page.js       │
│  • init()    ← завантаження даних  │
│  • activate() ← показ UI, події    │
│  • deactivate() ← cleanup          │
└─────────────────────────────────────┘
```

### Ключові принципи

| Принцип              | Опис                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| **Hash-based**       | Використовуємо `#view-rack` замість `/rack` — не потрібен серверний роутинг    |
| **Immutable Router** | `createRouter()` повертає `Object.freeze()` API — стан інкапсульований         |
| **Lifecycle Hooks**  | Кожна сторінка має `init/activate/deactivate` для чистого управління ресурсами |
| **ARIA-first**       | `aria-current="page"` та `aria-hidden` для доступності                         |
| **Middleware-ready** | Через `state.use()` можна підключати логіку (persist, analytics)               |

---

## 🔄 Як працює навігація

### Крок 1: Клік на посилання

```html
<a href="#view-battery" class="nav-link" data-view="battery">Акумулятор</a>
```

1.  Браузер миттєво змінює URL на `/#view-battery`
2.  Спрацьовує обробник у `router.attachNavigation()`
3.  `e.preventDefault()` зупиняє стрибок до якоря

### Крок 2: Виклик `navigate()`

```javascript
// router.js
const navigate = async (id) => {
  // 1. Deactivate поточної сторінки
  if (context.currentRoute) {
    composeDeactivate(context, context.currentRoute);
  }

  // 2. Init (якщо вперше)
  await composeInit(context, id);

  // 3. Activate нової сторінки
  composeActivate(context, id);

  // 4. Switch DOM (show/hide sections)
  switchView(context, id);

  // 5. Update ARIA навігації
  updateNavigation(context, id);

  // 6. Оновити URL (якщо не співпадає)
  if (window.location.hash !== `#view-${id}`) {
    history.pushState({ pageId: id }, "", `#view-${id}`);
  }

  // 7. Оновити внутрішній стан
  withContext({ currentRoute: id });
};
```

### Крок 3: Реакція сторінки

```javascript
// pages/battery/page.js
export const batteryPage = {
  id: "battery",

  activate: (ctx) => {
    // ctx має: effects, selectors, currentRoute
    const form = document.querySelector('[data-js="batteryForm"]');
    form?.addEventListener("submit", handleSubmit);
  },

  deactivate: (ctx) => {
    // Cleanup: видаляємо слухачі, щоб уникнути витоків пам'яті
    const form = document.querySelector('[data-js="batteryForm"]');
    form?.removeEventListener("submit", handleSubmit);
  },
};
```

---

## 📝 Реєстрація нової сторінки

### Крок 1: Створіть HTML-секцію

```html
<!-- index.html -->
<section
  id="view-reports"
  class="section section--reports"
  aria-labelledby="reports-title"
  data-js="section-reports"
  hidden  <!-- За замовчуванням прихована -->
>
  <header class="section__header">
    <h2 id="reports-title" class="section__title">Звіти</h2>
  </header>

  <div class="section__body">
    <!-- Контент сторінки -->
  </div>
</section>
```

### Крок 2: Додайте посилання в навігацію

```html
<!-- index.html -->
<nav class="site-nav" aria-label="Головна навігація" data-js="site-nav">
  <ul class="nav-list">
    <li><a href="#view-rack" class="nav-link" data-view="rack">Стелаж</a></li>
    <li><a href="#view-battery" class="nav-link" data-view="battery">Акумулятор</a></li>
    <!-- Нова сторінка -->
    <li><a href="#view-reports" class="nav-link" data-view="reports">Звіти</a></li>
  </ul>
</nav>
```

### Крок 3: Створіть модуль сторінки

```javascript
// js/app/pages/reports/page.js
// @ts-check

/**
 * @typedef {import('../../ui/router.js').RouterContext} RouterContext
 */

export const reportsPage = {
  id: "reports",

  /**
   * Ініціалізація (виконується один раз при першому відкритті)
   * @returns {Promise<void>}
   */
  init: async () => {
    // Завантаження даних, якщо потрібно
    // const reports = await fetchReports();
    console.log("[Reports] Initialized");
  },

  /**
   * Активація (кожен раз при переході на сторінку)
   * @param {RouterContext} ctx
   */
  activate: (ctx) => {
    console.log("[Reports] Activated");

    // Реєстрація подій
    const btn = document.querySelector('[data-js="reports-generate"]');
    const handler = () => generateReport();
    btn?.addEventListener("click", handler);

    // Збережіть handler для cleanup, якщо потрібно
    // ctx.effects?.cleanup?.(() => btn?.removeEventListener('click', handler));
  },

  /**
   * Деактивація (кожен раз при переході з сторінки)
   * @param {RouterContext} ctx
   */
  deactivate: (ctx) => {
    console.log("[Reports] Deactivated");

    // Cleanup: видалення слухачів подій
    const btn = document.querySelector('[data-js="reports-generate"]');
    btn?.removeEventListener("click", generateReport);
  },
};

const generateReport = () => {
  // Логіка генерації звіту
};

export default reportsPage;
```

### Крок 4: Зареєструйте сторінку

```javascript
// js/app/pages/index.js
// @ts-check

import { batteryPage } from "./battery/page.js";
import { rackPage } from "./racks/page.js";
import { reportsPage } from "./reports/page.js"; // ← Імпорт нової сторінки

const PAGE_REGISTRY = {
  battery: batteryPage,
  rack: rackPage,
  reports: reportsPage, // ← Реєстрація
};

export const registerAllPages = async () => {
  // ... валідація та повернення routes ...
};
```

### Крок 5: Готово! 🎉

Роутер автоматично:

- ✅ Побачить нову сторінку через `registerRoutes()`
- ✅ Обробить клік на `<a data-view="reports">`
- ✅ Оновить `aria-current` у навігації
- ✅ Покаже `<section id="view-reports">`

---

## 🔄 Життєвий цикл сторінки

```
┌─────────────────┐
│   init()        │ ← Викликається 1 раз при першому відкритті
│   • Завантаження даних  │
│   • Ініціалізація стейту│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   activate()    │ ← Викликається КОЖЕН раз при переході НА сторінку
│   • Реєстрація подій  │
│   • Показ UI          │
│   • Анімації          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   [Користувач взаємодіє] │
│   • Кліки, ввід, тощо   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   deactivate()  │ ← Викликається КОЖЕН раз при переході З сторінки
│   • Видалення слухачів │
│   • Очищення таймерів  │
│   • Збереження стану   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   activate() іншої сторінки │
└─────────────────┘
```

### Коли що використовувати?

| Метод          | Коли викликається                      | Що робити                              | Приклад                                |
| -------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| `init()`       | 1 раз, при першому відкритті           | Завантажити дані, ініціалізувати стейт | `fetch('/api/price.json')`             |
| `activate()`   | Кожен раз при переході **на** сторінку | Показати UI, зареєструвати події       | `form.addEventListener('submit', ...)` |
| `deactivate()` | Кожен раз при переході **з** сторінки  | Видалити події, очистити ресурси       | `form.removeEventListener(...)`        |

---

## 🔗 Робота з URL

### Hash-навігація (поточний підхід)

```
URL: https://yoursite.com/#view-rack
     └─┬─┘ └────┬────┘
       │        │
   base path  hash route
```

**Переваги:**

- ✅ Працює на будь-якому хостингу (не потрібен серверний роутинг)
- ✅ Проста реалізація через `window.location.hash`
- ✅ Кнопки Back/Forward працюють "з коробки"

**Недоліки:**

- ❌ URL виглядає менш "чисто" (`#` замість `/`)
- ❌ SEO-дружність обмежена (пошуковці індексують hash гірше)

### Керування URL програмно

```javascript
// Змінити URL без перезавантаження
history.pushState({ pageId: "rack" }, "", "#view-rack");

// Отримати поточний hash
const currentHash = window.location.hash; // "#view-rack"
const pageId = currentHash.replace("#view-", ""); // "rack"

// Обробка кнопок Back/Forward
window.addEventListener("popstate", (event) => {
  const hash = window.location.hash.replace("#view-", "");
  if (hash) {
    router.navigate(hash); // Перехід без pushState
  }
});
```

### Синхронізація при завантаженні

```javascript
// js/main.js
const initApp = async () => {
  // ... ініціалізація роутера ...

  // Перевіряємо, чи є hash при завантаженні сторінки
  const initialHash = window.location.hash.replace("#view-", "");

  if (initialHash && router.hasRoute(initialHash)) {
    await router.navigate(initialHash);
  } else {
    await router.navigate(APP_CONFIG.DEFAULT_PAGE);
  }
};
```

---

## ✨ Best Practices

### 1. Завжди робіть cleanup у `deactivate()`

```javascript
// ❌ Погано: слухачі накопичуються
activate: (ctx) => {
  btn.addEventListener('click', handler);
},

// ✅ Добре: видаляємо при деактивації
let handler; // Зберігаємо посилання

activate: (ctx) => {
  handler = (e) => handleClick(e);
  btn.addEventListener('click', handler);
},

deactivate: (ctx) => {
  if (handler) {
    btn.removeEventListener('click', handler);
  }
},
```

### 2. Використовуйте `aria-current` для доступності

```html
<!-- Автоматично оновлюється через router.updateNav() -->
<a href="#view-rack" class="nav-link" data-view="rack" aria-current="page"> Стелаж </a>
```

```css
/* CSS: візуальний індикатор активної сторінки */
.nav-link[aria-current="page"] {
  font-weight: 600;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}
```

### 3. Не мутуйте стан сторінки в `init()`

```javascript
// ❌ Погано: пряма мутація
init: async () => {
  rackState.form.floors = 2; // Пряма мутація!
},

// ✅ Добре: через actions
init: async () => {
  rackActions.updateForm({ floors: 2 }); // Через API стейту
},
```

### 4. Використовуйте `batch()` для кількох оновлень

```javascript
// ❌ Погано: кілька сповіщень підряд
activate: () => {
  rackState.updateField('a', 1);
  rackState.updateField('b', 2);
  rackState.updateField('c', 3); // 3 рази notify()
},

// ✅ Добре: одне сповіщення після всіх змін
activate: () => {
  rackState.batch(() => {
    rackState.updateField('a', 1);
    rackState.updateField('b', 2);
    rackState.updateField('c', 3);
  }); // 1 раз notify()
},
```

### 5. Експортуйте селектори для UI

```javascript
// ✅ Добре: UI не знає про структуру стейту
// components/RackName.js
import { rackSelectors } from "../state/rackState.js";

const render = () => {
  const name = rackSelectors.getCurrentRack()?.abbreviation;
  element.textContent = name || "---";
};

// ❌ Погано: UI залежить від внутрішньої структури
const render = () => {
  const name = rackState.get().currentRack?.abbreviation; // Tight coupling!
};
```

---

## 🐛 Troubleshooting

### ❌ Сторінка не перемикається

**Симптоми:** Клік на посилання не змінює контент.

**Перевірте:**

```javascript
// 1. Чи зареєстрована сторінка?
console.log(router.getRoutes()); // Має містити 'rack', 'battery', ...

// 2. Чи співпадає data-view з id сторінки?
// HTML: <a data-view="rack">
// Page: export const rackPage = { id: 'rack', ... }

// 3. Чи є section з id="view-{id}"?
// HTML: <section id="view-rack">
```

### ❌ URL змінюється, але контент ні

**Симптоми:** Адресний рядок оновлюється, але `<section>` не показується.

**Перевірте:**

```javascript
// 1. Чи працює switchView?
// router.js має викликати effects.showPage(id)

// 2. Чи має section правильний data-js?
// HTML: <section data-js="section-rack">
// Config: SELECTORS.rack.section = "[data-js='section-rack']"

// 3. Чи не заблоковано hidden через CSS?
// Перевірте: .section { display: none; } та .section.is-active { display: block; }
```

### ❌ Кнопки Back/Forward не працюють

**Симптоми:** Натискання "Назад" у браузері не змінює сторінку.

**Перевірте:**

```javascript
// 1. Чи додано слухач popstate?
// router.js: window.addEventListener('popstate', handlePopState)

// 2. Чи обробляє handlePopState hash?
const handlePopState = () => {
  const hash = window.location.hash.replace("#view-", "");
  if (hash) navigate(hash); // Без pushState!
};

// 3. Чи не викликається pushState при popstate?
// navigate() має перевіряти: if (window.location.hash !== newHash) pushState(...)
```

### ❌ Витік пам'яті (слухачі не видаляються)

**Симптоми:** Після кількох переходів події спрацьовують кілька разів.

**Перевірте:**

```javascript
// 1. Чи є deactivate() у сторінці?
export const rackPage = {
  deactivate: (ctx) => {
    // Видалення слухачів
  }
};

// 2. Чи зберігаєте ви посилання на handler?
let clickHandler;
activate: () => {
  clickHandler = (e) => handleClick(e);
  btn.addEventListener('click', clickHandler);
},
deactivate: () => {
  btn.removeEventListener('click', clickHandler); // ✅
},

// 3. Використовуйте event delegation для динамічних елементів
// Замість: button.addEventListener(...) на кожному render
// Краще: container.addEventListener(...) на батьківському елементі
```

---

## 🧪 Тестування роутера

```javascript
// @ts-check
// tests/ui/router.test.js

import { describe, it, expect, vi } from "vitest";
import { createRouter, createRouterEffects } from "../../app/ui/router.js";

describe("router", () => {
  const mockEffects = {
    getPageElement: vi.fn((id) => document.createElement("section")),
    showPage: vi.fn(),
    hidePage: vi.fn(),
    updateNav: vi.fn(),
    log: vi.fn(),
  };

  const mockRoutes = {
    rack: {
      id: "rack",
      init: vi.fn().mockResolvedValue(),
      activate: vi.fn(),
      deactivate: vi.fn(),
    },
  };

  it("should navigate to valid route", async () => {
    const router = createRouter({
      routes: mockRoutes,
      defaultRoute: "rack",
      effects: mockEffects,
    });

    const result = await router.navigate("rack");

    expect(result).toBe(true);
    expect(mockRoutes.rack.activate).toHaveBeenCalled();
    expect(mockEffects.showPage).toHaveBeenCalledWith("rack");
  });

  it("should update aria-current on navigation", async () => {
    const router = createRouter({
      routes: mockRoutes,
      defaultRoute: "rack",
      effects: mockEffects,
    });

    await router.navigate("rack");

    expect(mockEffects.updateNav).toHaveBeenCalledWith("rack");
  });

  it("should call deactivate on previous route", async () => {
    const router = createRouter({
      routes: {
        rack: mockRoutes.rack,
        battery: { id: "battery", activate: vi.fn(), deactivate: vi.fn() },
      },
      defaultRoute: "rack",
      effects: mockEffects,
    });

    await router.navigate("rack");
    await router.navigate("battery");

    expect(mockRoutes.rack.deactivate).toHaveBeenCalled();
  });
});
```

---

## 📚 Додаткові ресурси

| Тема                     | Де шукати                                                                     |
| ------------------------ | ----------------------------------------------------------------------------- |
| **Додавання middleware** | `js/app/state/createState.js` → `use()` метод                                 |
| **Робота з стейтом**     | `js/app/state/` → `rackState.js`, `rackActions.js`                            |
| **Доступність (a11y)**   | [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)                  |
| **History API**          | [MDN: History API](https://developer.mozilla.org/uk/docs/Web/API/History_API) |
| **Тестування**           | `tests/ui/router.test.js` (приклад вище)                                      |

---

## 🚀 Шпаргалка: Швидкий старт нової сторінки

```bash
# 1. Створіть HTML-секцію
#    <section id="view-newpage" data-js="section-newpage" hidden>...</section>

# 2. Додайте посилання в навігацію
#    <a href="#view-newpage" data-view="newpage" class="nav-link">Нова</a>

# 3. Створіть js/app/pages/newpage/page.js
export const newPage = {
  id: 'newpage',
  init: async () => { /* завантаження */ },
  activate: (ctx) => { /* події, UI */ },
  deactivate: (ctx) => { /* cleanup */ },
};

# 4. Зареєструйте в js/app/pages/index.js
#    import { newPage } from "./newpage/page.js";
#    const PAGE_REGISTRY = { ..., newpage: newPage };

# 5. Готово! Перевірте в браузері 🔥
```

---

> 💡 **Порада**: Якщо щось не працює — відкрийте консоль браузера. Роутер логує всі переходи: `[Router] Navigated to: {id}`. Це найшвидший спосіб зрозуміти, де саме зупинився процес.

Успіхів у розробці! 🎯

---

## 🏗️ Архітектура

```
┌─────────────────────────────────────┐
│            HTML (index.html)         │
│  • <a data-view="rack">             │
│  • <section id="view-rack">         │
│  • <dialog data-js="modal-rackSet"> │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         js/app/config/              │
│  • app.config.js ← селектори, ID   │
│  • selectors.js  ← мапа data-js    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         js/app/ui/router.js         │
│  • createRouter() ← фабрика        │
│  • navigate(id) ← перехід          │
│  • attachNavigation() ← слухачі    │
│  • history.pushState ← URL         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│        js/app/pages/*/page.js       │
│  • init()    ← завантаження даних  │
│  • activate() ← показ UI, події    │
│  • deactivate() ← cleanup          │
└─────────────────────────────────────┘
```

### Ключові принципи

| Принцип              | Опис                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| **Hash-based**       | Використовуємо `#view-rack` замість `/rack` — не потрібен серверний роутинг    |
| **Immutable Router** | `createRouter()` повертає `Object.freeze()` API — стан інкапсульований         |
| **Lifecycle Hooks**  | Кожна сторінка має `init/activate/deactivate` для чистого управління ресурсами |
| **ARIA-first**       | `aria-current="page"` та `aria-hidden` для доступності                         |
| **Middleware-ready** | Через `state.use()` можна підключати логіку (persist, analytics)               |

---

## 🔄 Як працює навігація

### Крок 1: Клік на посилання

```html
<a href="#view-battery" class="nav-link" data-view="battery">Акумулятор</a>
```

1.  Браузер миттєво змінює URL на `/#view-battery`
2.  Спрацьовує обробник у `router.attachNavigation()`
3.  `e.preventDefault()` зупиняє стрибок до якоря

### Крок 2: Виклик `navigate()`

```javascript
// router.js
const navigate = async (id) => {
  // 1. Deactivate поточної сторінки
  if (context.currentRoute) {
    composeDeactivate(context, context.currentRoute);
  }

  // 2. Init (якщо вперше)
  await composeInit(context, id);

  // 3. Activate нової сторінки
  composeActivate(context, id);

  // 4. Switch DOM (show/hide sections)
  switchView(context, id);

  // 5. Update ARIA навігації
  updateNavigation(context, id);

  // 6. Оновити URL (якщо не співпадає)
  if (window.location.hash !== `#view-${id}`) {
    history.pushState({ pageId: id }, "", `#view-${id}`);
  }

  // 7. Оновити внутрішній стан
  withContext({ currentRoute: id });
};
```

### Крок 3: Реакція сторінки

```javascript
// pages/battery/page.js
export const batteryPage = {
  id: "battery",

  activate: (ctx) => {
    // ctx має: effects, selectors, currentRoute
    const form = document.querySelector('[data-js="batteryForm"]');
    form?.addEventListener("submit", handleSubmit);
  },

  deactivate: (ctx) => {
    // Cleanup: видаляємо слухачі, щоб уникнути витоків пам'яті
    const form = document.querySelector('[data-js="batteryForm"]');
    form?.removeEventListener("submit", handleSubmit);
  },
};
```

---

## 📝 Реєстрація нової сторінки

### Крок 1: Створіть HTML-секцію

```html
<!-- index.html -->
<section
  id="view-reports"
  class="section section--reports"
  aria-labelledby="reports-title"
  data-js="section-reports"
  hidden  <!-- За замовчуванням прихована -->
>
  <header class="section__header">
    <h2 id="reports-title" class="section__title">Звіти</h2>
  </header>

  <div class="section__body">
    <!-- Контент сторінки -->
  </div>
</section>
```

### Крок 2: Додайте посилання в навігацію

```html
<!-- index.html -->
<nav class="site-nav" aria-label="Головна навігація" data-js="site-nav">
  <ul class="nav-list">
    <li><a href="#view-rack" class="nav-link" data-view="rack">Стелаж</a></li>
    <li><a href="#view-battery" class="nav-link" data-view="battery">Акумулятор</a></li>
    <!-- Нова сторінка -->
    <li><a href="#view-reports" class="nav-link" data-view="reports">Звіти</a></li>
  </ul>
</nav>
```

### Крок 3: Створіть модуль сторінки

```javascript
// js/app/pages/reports/page.js
// @ts-check

/**
 * @typedef {import('../../ui/router.js').RouterContext} RouterContext
 */

export const reportsPage = {
  id: "reports",

  /**
   * Ініціалізація (виконується один раз при першому відкритті)
   * @returns {Promise<void>}
   */
  init: async () => {
    // Завантаження даних, якщо потрібно
    // const reports = await fetchReports();
    console.log("[Reports] Initialized");
  },

  /**
   * Активація (кожен раз при переході на сторінку)
   * @param {RouterContext} ctx
   */
  activate: (ctx) => {
    console.log("[Reports] Activated");

    // Реєстрація подій
    const btn = document.querySelector('[data-js="reports-generate"]');
    const handler = () => generateReport();
    btn?.addEventListener("click", handler);

    // Збережіть handler для cleanup, якщо потрібно
    // ctx.effects?.cleanup?.(() => btn?.removeEventListener('click', handler));
  },

  /**
   * Деактивація (кожен раз при переході з сторінки)
   * @param {RouterContext} ctx
   */
  deactivate: (ctx) => {
    console.log("[Reports] Deactivated");

    // Cleanup: видалення слухачів подій
    const btn = document.querySelector('[data-js="reports-generate"]');
    btn?.removeEventListener("click", generateReport);
  },
};

const generateReport = () => {
  // Логіка генерації звіту
};

export default reportsPage;
```

### Крок 4: Зареєструйте сторінку

```javascript
// js/app/pages/index.js
// @ts-check

import { batteryPage } from "./battery/page.js";
import { rackPage } from "./racks/page.js";
import { reportsPage } from "./reports/page.js"; // ← Імпорт нової сторінки

const PAGE_REGISTRY = {
  battery: batteryPage,
  rack: rackPage,
  reports: reportsPage, // ← Реєстрація
};

export const registerAllPages = async () => {
  // ... валідація та повернення routes ...
};
```

### Крок 5: Готово! 🎉

Роутер автоматично:

- ✅ Побачить нову сторінку через `registerRoutes()`
- ✅ Обробить клік на `<a data-view="reports">`
- ✅ Оновить `aria-current` у навігації
- ✅ Покаже `<section id="view-reports">`

---

## 🔄 Життєвий цикл сторінки

```
┌─────────────────┐
│   init()        │ ← Викликається 1 раз при першому відкритті
│   • Завантаження даних  │
│   • Ініціалізація стейту│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   activate()    │ ← Викликається КОЖЕН раз при переході НА сторінку
│   • Реєстрація подій  │
│   • Показ UI          │
│   • Анімації          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   [Користувач взаємодіє] │
│   • Кліки, ввід, тощо   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   deactivate()  │ ← Викликається КОЖЕН раз при переході З сторінки
│   • Видалення слухачів │
│   • Очищення таймерів  │
│   • Збереження стану   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   activate() іншої сторінки │
└─────────────────┘
```

### Коли що використовувати?

| Метод          | Коли викликається                      | Що робити                              | Приклад                                |
| -------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| `init()`       | 1 раз, при першому відкритті           | Завантажити дані, ініціалізувати стейт | `fetch('/api/price.json')`             |
| `activate()`   | Кожен раз при переході **на** сторінку | Показати UI, зареєструвати події       | `form.addEventListener('submit', ...)` |
| `deactivate()` | Кожен раз при переході **з** сторінки  | Видалити події, очистити ресурси       | `form.removeEventListener(...)`        |

---

## 🔗 Робота з URL

### Hash-навігація (поточний підхід)

```
URL: https://yoursite.com/#view-rack
     └─┬─┘ └────┬────┘
       │        │
   base path  hash route
```

**Переваги:**

- ✅ Працює на будь-якому хостингу (не потрібен серверний роутинг)
- ✅ Проста реалізація через `window.location.hash`
- ✅ Кнопки Back/Forward працюють "з коробки"

**Недоліки:**

- ❌ URL виглядає менш "чисто" (`#` замість `/`)
- ❌ SEO-дружність обмежена (пошуковці індексують hash гірше)

### Керування URL програмно

```javascript
// Змінити URL без перезавантаження
history.pushState({ pageId: "rack" }, "", "#view-rack");

// Отримати поточний hash
const currentHash = window.location.hash; // "#view-rack"
const pageId = currentHash.replace("#view-", ""); // "rack"

// Обробка кнопок Back/Forward
window.addEventListener("popstate", (event) => {
  const hash = window.location.hash.replace("#view-", "");
  if (hash) {
    router.navigate(hash); // Перехід без pushState
  }
});
```

### Синхронізація при завантаженні

```javascript
// js/main.js
const initApp = async () => {
  // ... ініціалізація роутера ...

  // Перевіряємо, чи є hash при завантаженні сторінки
  const initialHash = window.location.hash.replace("#view-", "");

  if (initialHash && router.hasRoute(initialHash)) {
    await router.navigate(initialHash);
  } else {
    await router.navigate(APP_CONFIG.DEFAULT_PAGE);
  }
};
```

---

## ✨ Best Practices

### 1. Завжди робіть cleanup у `deactivate()`

```javascript
// ❌ Погано: слухачі накопичуються
activate: (ctx) => {
  btn.addEventListener('click', handler);
},

// ✅ Добре: видаляємо при деактивації
let handler; // Зберігаємо посилання

activate: (ctx) => {
  handler = (e) => handleClick(e);
  btn.addEventListener('click', handler);
},

deactivate: (ctx) => {
  if (handler) {
    btn.removeEventListener('click', handler);
  }
},
```

### 2. Використовуйте `aria-current` для доступності

```html
<!-- Автоматично оновлюється через router.updateNav() -->
<a href="#view-rack" class="nav-link" data-view="rack" aria-current="page"> Стелаж </a>
```

```css
/* CSS: візуальний індикатор активної сторінки */
.nav-link[aria-current="page"] {
  font-weight: 600;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}
```

### 3. Не мутуйте стан сторінки в `init()`

```javascript
// ❌ Погано: пряма мутація
init: async () => {
  rackState.form.floors = 2; // Пряма мутація!
},

// ✅ Добре: через actions
init: async () => {
  rackActions.updateForm({ floors: 2 }); // Через API стейту
},
```

### 4. Використовуйте `batch()` для кількох оновлень

```javascript
// ❌ Погано: кілька сповіщень підряд
activate: () => {
  rackState.updateField('a', 1);
  rackState.updateField('b', 2);
  rackState.updateField('c', 3); // 3 рази notify()
},

// ✅ Добре: одне сповіщення після всіх змін
activate: () => {
  rackState.batch(() => {
    rackState.updateField('a', 1);
    rackState.updateField('b', 2);
    rackState.updateField('c', 3);
  }); // 1 раз notify()
},
```

### 5. Експортуйте селектори для UI

```javascript
// ✅ Добре: UI не знає про структуру стейту
// components/RackName.js
import { rackSelectors } from "../state/rackState.js";

const render = () => {
  const name = rackSelectors.getCurrentRack()?.abbreviation;
  element.textContent = name || "---";
};

// ❌ Погано: UI залежить від внутрішньої структури
const render = () => {
  const name = rackState.get().currentRack?.abbreviation; // Tight coupling!
};
```

---

## 🐛 Troubleshooting

### ❌ Сторінка не перемикається

**Симптоми:** Клік на посилання не змінює контент.

**Перевірте:**

```javascript
// 1. Чи зареєстрована сторінка?
console.log(router.getRoutes()); // Має містити 'rack', 'battery', ...

// 2. Чи співпадає data-view з id сторінки?
// HTML: <a data-view="rack">
// Page: export const rackPage = { id: 'rack', ... }

// 3. Чи є section з id="view-{id}"?
// HTML: <section id="view-rack">
```

### ❌ URL змінюється, але контент ні

**Симптоми:** Адресний рядок оновлюється, але `<section>` не показується.

**Перевірте:**

```javascript
// 1. Чи працює switchView?
// router.js має викликати effects.showPage(id)

// 2. Чи має section правильний data-js?
// HTML: <section data-js="section-rack">
// Config: SELECTORS.rack.section = "[data-js='section-rack']"

// 3. Чи не заблоковано hidden через CSS?
// Перевірте: .section { display: none; } та .section.is-active { display: block; }
```

### ❌ Кнопки Back/Forward не працюють

**Симптоми:** Натискання "Назад" у браузері не змінює сторінку.

**Перевірте:**

```javascript
// 1. Чи додано слухач popstate?
// router.js: window.addEventListener('popstate', handlePopState)

// 2. Чи обробляє handlePopState hash?
const handlePopState = () => {
  const hash = window.location.hash.replace("#view-", "");
  if (hash) navigate(hash); // Без pushState!
};

// 3. Чи не викликається pushState при popstate?
// navigate() має перевіряти: if (window.location.hash !== newHash) pushState(...)
```

### ❌ Витік пам'яті (слухачі не видаляються)

**Симптоми:** Після кількох переходів події спрацьовують кілька разів.

**Перевірте:**

```javascript
// 1. Чи є deactivate() у сторінці?
export const rackPage = {
  deactivate: (ctx) => {
    // Видалення слухачів
  }
};

// 2. Чи зберігаєте ви посилання на handler?
let clickHandler;
activate: () => {
  clickHandler = (e) => handleClick(e);
  btn.addEventListener('click', clickHandler);
},
deactivate: () => {
  btn.removeEventListener('click', clickHandler); // ✅
},

// 3. Використовуйте event delegation для динамічних елементів
// Замість: button.addEventListener(...) на кожному render
// Краще: container.addEventListener(...) на батьківському елементі
```

---

## 🧪 Тестування роутера

```javascript
// @ts-check
// tests/ui/router.test.js

import { describe, it, expect, vi } from "vitest";
import { createRouter, createRouterEffects } from "../../app/ui/router.js";

describe("router", () => {
  const mockEffects = {
    getPageElement: vi.fn((id) => document.createElement("section")),
    showPage: vi.fn(),
    hidePage: vi.fn(),
    updateNav: vi.fn(),
    log: vi.fn(),
  };

  const mockRoutes = {
    rack: {
      id: "rack",
      init: vi.fn().mockResolvedValue(),
      activate: vi.fn(),
      deactivate: vi.fn(),
    },
  };

  it("should navigate to valid route", async () => {
    const router = createRouter({
      routes: mockRoutes,
      defaultRoute: "rack",
      effects: mockEffects,
    });

    const result = await router.navigate("rack");

    expect(result).toBe(true);
    expect(mockRoutes.rack.activate).toHaveBeenCalled();
    expect(mockEffects.showPage).toHaveBeenCalledWith("rack");
  });

  it("should update aria-current on navigation", async () => {
    const router = createRouter({
      routes: mockRoutes,
      defaultRoute: "rack",
      effects: mockEffects,
    });

    await router.navigate("rack");

    expect(mockEffects.updateNav).toHaveBeenCalledWith("rack");
  });

  it("should call deactivate on previous route", async () => {
    const router = createRouter({
      routes: {
        rack: mockRoutes.rack,
        battery: { id: "battery", activate: vi.fn(), deactivate: vi.fn() },
      },
      defaultRoute: "rack",
      effects: mockEffects,
    });

    await router.navigate("rack");
    await router.navigate("battery");

    expect(mockRoutes.rack.deactivate).toHaveBeenCalled();
  });
});
```

---

## 📚 Додаткові ресурси

| Тема                     | Де шукати                                                                     |
| ------------------------ | ----------------------------------------------------------------------------- |
| **Додавання middleware** | `js/app/state/createState.js` → `use()` метод                                 |
| **Робота з стейтом**     | `js/app/state/` → `rackState.js`, `rackActions.js`                            |
| **Доступність (a11y)**   | [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)                  |
| **History API**          | [MDN: History API](https://developer.mozilla.org/uk/docs/Web/API/History_API) |
| **Тестування**           | `tests/ui/router.test.js` (приклад вище)                                      |

---

## 🚀 Шпаргалка: Швидкий старт нової сторінки

```bash
# 1. Створіть HTML-секцію
#    <section id="view-newpage" data-js="section-newpage" hidden>...</section>

# 2. Додайте посилання в навігацію
#    <a href="#view-newpage" data-view="newpage" class="nav-link">Нова</a>

# 3. Створіть js/app/pages/newpage/page.js
export const newPage = {
  id: 'newpage',
  init: async () => { /* завантаження */ },
  activate: (ctx) => { /* події, UI */ },
  deactivate: (ctx) => { /* cleanup */ },
};

# 4. Зареєструйте в js/app/pages/index.js
#    import { newPage } from "./newpage/page.js";
#    const PAGE_REGISTRY = { ..., newpage: newPage };

# 5. Готово! Перевірте в браузері 🔥
```

---

> 💡 **Порада**: Якщо щось не працює — відкрийте консоль браузера. Роутер логує всі переходи: `[Router] Navigated to: {id}`. Це найшвидший спосіб зрозуміти, де саме зупинився процес.

Успіхів у розробці! 🎯
