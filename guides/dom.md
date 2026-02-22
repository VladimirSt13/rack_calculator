# 🎨 Гайд по DOM Effects в Rack Calculator

Цей документ описує архітектуру роботи з DOM, принцип роботи функціональних ефектів, патерни маніпуляцій та інструкції для розробників.

---

## 📋 Зміст

1. [Філософія DOM Effects](#філософія-dom-effects)
2. [Архітектура](#архітектура)
3. [API довідник](#api-довідник)
4. [Утиліти для роботи з DOM](#утиліти-для-роботи-з-dom)
5. [Best Practices](#best-practices)
6. [Приклади використання](#приклади-використання)
7. [Тестування](#тестування)
8. [Troubleshooting](#troubleshooting)

---

## 🧭 Філософія DOM Effects

### Чому не `document.querySelector` напряму?

| Прямий DOM API                                         | DOM Effects                                        |
| ------------------------------------------------------ | -------------------------------------------------- |
| ❌ Side-effect у будь-якому місці коду                 | ✅ Явно позначені ефекти: `query()()`              |
| ❌ Неможливо мокати без складних інструментів          | ✅ Легко тестувати: передаємо mock-функції         |
| ❌ Ризик помилок: `null` повертається без попередження | ✅ Валідація + консольні попередження              |
| ❌ Важко композирувати операції                        | ✅ Функції повертають функції → pipe/compose       |
| ❌ Мутації "на місці"                                  | ✅ Чіткий потік: `getElementRef → effect → result` |

### Ключові принципи

```
┌─────────────────────────────────┐
│  DOM Effect = () => Result      │
│                                 │
│  Pure function that returns     │
│  a function with side-effect    │
│                                 │
│  query(selector)                │
│    → () => HTMLElement|null     │
│                                 │
│  setState(el, 'ready')          │
│    → () => boolean              │
└─────────────────────────────────┘
```

| Принцип                  | Опис                                          | Перевага                                         |
| ------------------------ | --------------------------------------------- | ------------------------------------------------ |
| **Lazy Evaluation**      | Ефект не виконується, поки не додано `()`     | Контроль моменту виконання, композиція           |
| **ElementRef Pattern**   | Приймає `HTMLElement` або `() => HTMLElement` | Гнучкість: працює з lazy-елементами              |
| **Safe by Default**      | Перевірка на `null`/`undefined` всередині     | Менше `if (el)` у коді, кращі помилки            |
| **Return Values**        | Кожен ефект повертає результат операції       | Можливість chain / pipe / обробки помилок        |
| **No Mutation of Input** | Не змінює переданий ElementRef                | Передбачуваність, безпечне повторне використання |

---

## 🏗️ Архітектура

### Типи даних

```javascript
/**
 * @typedef {HTMLElement | (() => HTMLElement|null)} ElementRef
 * @description Гнучкий тип: або елемент, або функція, що його повертає
 */

/**
 * @typedef {Record<string, string>} Attributes
 * @description Об'єкт data-* атрибутів: { loading: 'true', id: '123' }
 */

/**
 * @typedef {Object} DomEffectResult
 * @property {boolean} success - чи виконався ефект успішно
 * @property {HTMLElement|null} element - елемент, над яким виконано операцію
 * @property {string} [error] - повідомлення про помилку, якщо сталася
 */
```

### Потік виконання

```
1. DOM Effect factory: query('[data-js="btn"]')
   │
   ▼
2. Returns getter function: () => HTMLElement|null
   │
   ▼
3. Invoke effect: query('[data-js="btn"]')()
   │
   ▼
4. getElement() resolves ElementRef → HTMLElement|null
   │
   ▼
5. Side-effect executes: document.querySelector(...)
   │
   ▼
6. Return result: element or null (+ optional logging)
```

### Чому `() => Result` замість прямого виклику?

```javascript
// ❌ Прямий виклик (менш гнучкий)
const el = document.querySelector("#app");
setState(el, "loading"); // виконується негайно

// ✅ Lazy effect (більш гнучкий)
const getApp = query("#app"); // pure: нічого не робить
const setLoading = setState(getApp, "loading"); // pure: готує ефект
setLoading(); // ← виклик: тепер виконується side-effect

// Композиція через pipe:
pipe(
  query("#app"),
  (el) => setState(el, "loading"),
  (el) => setHTML(el, "<p>Завантаження...</p>"),
  (el) => focus(el),
)(); // ← один виклик запускає весь ланцюжок
```

---

## 📚 API довідник

### 🔍 `query(selector)`

Повертає функцію для пошуку елемента за CSS-селектором.

```javascript
import { query } from "../effects/dom.js";

// Базове використання
const getApp = query("#app");
const appEl = getApp(); // HTMLElement|null

// У композиції
pipe(query('[data-js="rackName"]'), (el) => setText(el, "L1A1-750/430"))();

// З валідацією
const el = query(".nonexistent")();
if (!el) {
  console.warn("Element not found");
}
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `selector` | `string` | CSS-селектор: `'#id'`, `'.class'`, `'[data-js="x"]'` |

**Повертає:** `() => HTMLElement|null` — функція, що при виклику повертає елемент

**Особливості:**

- Повертає `null`, якщо селектор невалідний або елемент не знайдено
- Логує попередження в консоль при помилках (для дебагу)

---

### 🔍 `queryAll(selector)`

Повертає функцію для пошуку ВСІХ елементів за селектором.

```javascript
import { queryAll } from "../effects/dom.js";

// Отримати всі кнопки в таблиці
const getButtons = queryAll(".rack-set-table button");
const buttons = getButtons(); // NodeListOf<HTMLButtonElement>

// Обробка кожного
Array.from(buttons).forEach((btn) => {
  btn.disabled = true;
});
```

**Повертає:** `() => NodeListOf<HTMLElement>`

---

### 🎚️ `setState(elementRef, state)`

Встановлює `data-state` атрибут елемента.

```javascript
import { query, setState } from "../effects/dom.js";

// Базове використання
const nameEl = query('[data-js="rackName"]');
setState(nameEl, "ready")(); // → boolean

// З ElementRef-функцією (lazy)
const getNameEl = () => document.querySelector('[data-js="rackName"]');
setState(getNameEl, "loading")();

// Перевірка результату
const success = setState(nameEl, "error")();
if (!success) {
  console.warn("Failed to set state");
}
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `elementRef` | `ElementRef` | Елемент або функція, що його повертає |
| `state` | `string` | Значення для `data-state`: `'ready'`, `'loading'`, `'error'`, тощо |

**Повертає:** `() => boolean` — `true` якщо успішно, `false` якщо елемент не знайдено

---

### 👁️ `getState(elementRef)`

Отримує поточне значення `data-state`.

```javascript
import { query, getState } from "../effects/dom.js";

const btnState = pipe(query('[data-js="submitBtn"]'), getState)(); // → 'ready' | 'loading' | 'error' | null

if (btnState === "loading") {
  // Показати лоадер
}
```

**Повертає:** `() => string|null`

---

### 🏷️ `setAttributes(elementRef, attributes)`

Встановлює кілька `data-*` атрибутів одночасно.

```javascript
import { query, setAttributes } from "../effects/dom.js";

pipe(query('[data-js="rackSetTable"]'), (el) =>
  setAttributes(el, {
    loading: "true",
    itemCount: "5",
    lastUpdate: Date.now().toString(),
  }),
)();

// Результат у HTML:
// <div data-js="rackSetTable"
//      data-loading="true"
//      data-item-count="5"
//      data-last-update="1234567890">
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `elementRef` | `ElementRef` | Цільовий елемент |
| `attributes` | `Attributes` | Об'єкт `{ key: value }` для `data-*` атрибутів |

**Повертає:** `() => boolean`

---

### 🎨 `toggleClass(elementRef, className, force?)`

Перемикає CSS-клас елемента.

```javascript
import { query, toggleClass } from "../effects/dom.js";

// Toggle (якщо є — видалити, якщо немає — додати)
toggleClass(query(".modal"), "is-open")();

// Force add
toggleClass(query(".alert"), "is-visible", true)();

// Force remove
toggleClass(query(".loader"), "is-active", false)();

// Перевірка результату
const isVisible = toggleClass(query(".tooltip"), "is-shown")();
console.log("Tooltip visible:", isVisible); // true/false
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `elementRef` | `ElementRef` | Цільовий елемент |
| `className` | `string` | Назва CSS-класу |
| `force` | `boolean?` | `true` = додати, `false` = видалити, `undefined` = toggle |

**Повертає:** `() => boolean` — чи клас присутній після операції

---

### ➕ `addClass(elementRef, classNames)` / ➖ `removeClass(elementRef, classNames)`

Додає або видаляє CSS-клас(и).

```javascript
import { query, addClass, removeClass } from "../effects/dom.js";

// Один клас
addClass(query(".card"), "is-selected")();

// Кілька класів
addClass(query(".modal"), ["is-open", "animate-fade-in"])();

// Видалення
removeClass(query(".alert"), "is-error")();
removeClass(query(".form"), ["is-invalid", "is-dirty"])();
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `elementRef` | `ElementRef` | Цільовий елемент |
| `classNames` | `string | string[]` | Один клас або масив класів |

**Повертає:** `() => boolean`

---

### 📝 `setHTML(elementRef, html, sanitize?)` / `setText(elementRef, text)`

Встановлює вміст елемента.

```javascript
import { query, setHTML, setText } from "../effects/dom.js";

// ❌ Небезпечно: XSS-ризик при використанні user input
// setHTML(el, userInput)();

// ✅ Безпечно: setText екранує спеціальні символи
setText(query('[data-js="userName"]'), '<script>alert("xss")</script>')();
// Результат у DOM: &lt;script&gt;alert("xss")&lt;/script&gt;

// ✅ Безпечно: setHTML тільки з довіреним контентом + санітизація
const trustedHtml = "<strong>Успіх!</strong> Стелаж розраховано";
setHTML(query('[data-js="alert"]'), trustedHtml)();

// ✅ З санітизацією user input
const sanitize = (html) => html.replace(/[<>]/g, "");
setHTML(query('[data-js="comment"]'), userInput, sanitize)();
```

**Параметри `setHTML`:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `elementRef` | `ElementRef` | Цільовий елемент |
| `html` | `string` | HTML-рядок для вставки |
| `sanitize` | `(string) => string` | Опціональна функція санітизації |

**Повертає:** `() => boolean`

> ⚠️ **Безпека**: Завжди використовуйте `setText()` для користувачого вводу. `setHTML()` — тільки для довіреного контенту або з санітизацією.

---

### ⌨️ `setValue(elementRef, value)` / `getValue(elementRef)`

Робота з значеннями форм-елементів.

```javascript
import { query, setValue, getValue } from "../effects/dom.js";

// Встановити значення input
setValue(query("#floors"), 3)();

// Отримати значення
const floors = pipe(query("#floors"), getValue)(); // → string

// Конвертація типу
const floorsNum = Number(getValue(query("#floors"))()) || 0;

// setValue автоматично тригерить 'input' event для реактивності
setValue(query("#supports"), "430")();
// → Всі слухачі 'input' на цьому елементі спрацюють
```

**Повертає:**

- `setValue`: `() => boolean`
- `getValue`: `() => string|null`

---

### 🔦 `focus(elementRef, options?)` / `blur(elementRef)`

Керування фокусом.

```javascript
import { query, focus, blur } from "../effects/dom.js";

// Фокус з опціями
focus(query("#firstInput"), { preventScroll: true })();

// З затримкою (після рендеру)
setTimeout(() => {
  focus(query('[data-js="rackName"]'))();
}, 50);

// Приховати фокус
blur(query(".search-input"))();
```

**Параметри `focus`:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `elementRef` | `ElementRef` | Цільовий елемент |
| `options` | `FocusOptions` | Опції: `{ preventScroll, focusVisible }` |

**Повертає:** `() => boolean`

---

### 📜 `scrollIntoView(elementRef, options?)`

Прокрутка елемента у видимість.

```javascript
import { query, scrollIntoView } from "../effects/dom.js";

// Плавна прокрутка до помилки
scrollIntoView(query(".form-error"), {
  behavior: "smooth",
  block: "nearest",
})();

// Миттєва прокрутка до верху
scrollIntoView(query("#app"), { behavior: "auto", block: "start" })();
```

**Повертає:** `() => boolean`

---

### 👁️ `setHidden(elementRef, hidden?)` / `setAriaHidden(elementRef, hidden?)`

Керування видимістю (доступність).

```javascript
import { query, setHidden, setAriaHidden } from "../effects/dom.js";

// Приховати елемент (display: none через [hidden])
setHidden(query(".modal"), true)();

// Показати
setHidden(query(".modal"), false)();

// Для скрінрідерів: aria-hidden
setAriaHidden(query(".decorative-icon"), true)();

// Комбінація для повної доступності
const toggleVisibility = (elRef, show) => {
  setHidden(elRef, !show)();
  setAriaHidden(elRef, !show)();
};
```

---

### ♿ `setAriaCurrent(elementRef, current?)`

Встановлює `aria-current` для навігації.

```javascript
import { query, setAriaCurrent } from "../effects/dom.js";

// Активне посилання в навігації
setAriaCurrent(query('[data-view="rack"]'), "page")();

// Видалити aria-current
setAriaCurrent(query('[data-view="battery"]'), false)();

// Значення: 'page' | 'step' | 'location' | 'date' | 'time' | true | false
```

**Повертає:** `() => boolean`

---

### 🔍 `matches(elementRef, selector)` / `isVisible(elementRef)`

Перевірки елементів.

```javascript
import { query, matches, isVisible } from "../effects/dom.js";

// Чи відповідає елемент селектору?
const isButton = pipe(query("#submit"), (el) => matches(el, 'button[type="submit"]'))(); // → boolean

// Чи видимий елемент? (не display:none, не visibility:hidden, не zero size)
const isModalVisible = pipe(query(".modal"), isVisible)(); // → boolean

// Умовний рендер
if (isVisible(query(".error-banner"))()) {
  // Показати додаткову інформацію
}
```

---

### 🏗️ `createElement(tagName, options?)`

Створення елементів програмно.

```javascript
import { createElement } from "../effects/dom.js";

// Просте створення
const div = createElement("div")();

// З опціями
const beamRow = createElement("div", {
  className: "beam-row",
  dataset: { beamId: "abc123" },
  attrs: { role: "listitem" },
  textContent: "Балка 750",
})();

// З дітьми
const row = createElement("tr", {
  children: [
    createElement("td", { textContent: "1" })(),
    createElement("td", { textContent: "L1A1-750/430" })(),
    createElement("td", { textContent: "5036.00" })(),
  ],
})();
```

**Параметри `options`:**
| Опція | Тип | Опис |
|-------|-----|------|
| `dataset` | `Attributes` | `data-*` атрибути |
| `attrs` | `Record<string, string>` | Звичайні атрибути (`id`, `role`, тощо) |
| `className` | `string` | CSS-клас(и) |
| `textContent` | `string` | Текстовий вміст |
| `children` | `(HTMLElement|Node)[]` | Дочірні елементи |

**Повертає:** `() => HTMLElement`

---

### ➕ `appendChildren(parentRef, children)` / 🗑️ `removeElement(elementRef)` / 🔄 `replaceElement(elementRef, newContent)`

Маніпуляції з деревом DOM.

```javascript
import { query, createElement, appendChildren, removeElement, replaceElement } from "../effects/dom.js";

// Додати кілька елементів
const newRows = [createElement("tr", { textContent: "Row 1" })(), createElement("tr", { textContent: "Row 2" })()];
appendChildren(query("tbody"), newRows)();

// Видалити елемент
removeElement(query(".old-banner"))();

// Замінити елемент
const newAlert = createElement("div", {
  className: "alert alert-success",
  textContent: "Операція виконана!",
})();
replaceElement(query(".alert-loading"), newAlert)();
```

**Повертає:** `() => boolean`

---

## 🛠️ Утиліти для роботи з DOM

### 🔗 `pipe` / `compose` (з `core/compose.js`)

Композиція DOM-ефектів.

```javascript
// @ts-check
import { pipe } from "../core/compose.js";
import { query, setState, setHTML, focus } from "../effects/dom.js";

// Послідовне виконання ефектів
pipe(
  query('[data-js="alert-box"]'), // () => HTMLElement|null
  (el) => setHTML(el, "<strong>Успіх!</strong>"), // () => boolean
  (el) => setState(el, "success"), // () => boolean
  (el) => addClass(el, "animate-pulse"), // () => boolean
  (el) => focus(el, { preventScroll: true }), // () => boolean
)(); // ← виклик запускає весь ланцюжок
```

> 💡 **Порада**: Використовуйте `pipe` для лінійних операцій, `compose` — якщо потрібно виконувати справа наліво.

---

### 🔄 `getElement(elementRef)` (внутрішня утиліта)

Резолвить `ElementRef` у `HTMLElement|null`.

```javascript
// Не експортується, але корисна для розуміння:
const getElement = (elementRef) => {
  if (!elementRef) return null;
  if (typeof elementRef === "function") return elementRef();
  return elementRef instanceof HTMLElement ? elementRef : null;
};

// Всі DOM-ефекти використовують цю логіку всередині
```

---

## ✨ Best Practices

### 1. Завжди перевіряйте результат ефекту

```javascript
// ❌ Погано: ігноруємо можливу помилку
setState(query("#app"), "loading")();

// ✅ Добре: обробляємо результат
const success = setState(query("#app"), "loading")();
if (!success) {
  console.warn("Failed to set loading state");
  // Fallback логіка
}
```

### 2. Використовуйте `setText` для користувачого вводу

```javascript
// ❌ Небезпечно: XSS-ризик
const userName = getUserInput(); // "<script>evil()</script>"
setHTML(query("#userName"), userName)(); // ⚠️ Виконається скрипт!

// ✅ Безпечно: екранування
setText(query("#userName"), userName)();
// → DOM: &lt;script&gt;evil()&lt;/script&gt;
```

### 3. Lazy evaluation для елементів, що з'являються пізніше

```javascript
// ❌ Погано: елемент ще не в DOM
const modal = query(".modal")(); // null на момент виклику
setState(modal, "open")(); // Помилка!

// ✅ Добре: lazy ElementRef
const getModal = () => document.querySelector(".modal");
// Реєструємо ефект, але не виконуємо
const openModal = setState(getModal, "open");

// Виконуємо, коли модалка точно в DOM
setTimeout(() => {
  openModal(); // Тепер працює!
}, 100);
```

### 4. Композиція замість вкладених викликів

```javascript
// ❌ Погано: "callback hell" для DOM
query("#app")((el) => {
  if (el) {
    setHTML(
      el,
      "...",
    )(() => {
      setState(
        el,
        "ready",
      )(() => {
        focus(el)();
      });
    });
  }
});

// ✅ Добре: pipe для лінійного потоку
pipe(
  query("#app"),
  (el) => setHTML(el, "..."),
  (el) => setState(el, "ready"),
  (el) => focus(el),
)();
```

### 5. Використовуйте `createElement` для динамічного UI

```javascript
// ❌ Погано: string concatenation + innerHTML
const html = `
  <div class="beam-row" data-beam-id="${beam.id}">
    <span>${beam.name}</span>
    <input value="${beam.qty}">
  </div>
`;
setHTML(container, html)(); // ⚠️ XSS-ризик, важко підтримувати

// ✅ Добре: createElement + appendChildren
const row = createElement("div", {
  className: "beam-row",
  dataset: { beamId: beam.id },
  children: [
    createElement("span", { textContent: beam.name })(),
    createElement("input", {
      attrs: { value: beam.qty, name: "qty" },
      className: "form__control",
    })(),
  ],
})();
appendChildren(container, [row])();
```

### 6. Експортуйте чисті helpers для тестування

```javascript
// dom.js
export const formatPrice = (value) => {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 2,
  }).format(value);
};

// tests/dom.test.js
import { formatPrice } from "../effects/dom.js";

it("formats price correctly", () => {
  expect(formatPrice(5036)).toBe("5 036,00 ₴");
});
```

---

## 💻 Приклади використання

### Приклад 1: Реактивний рендер назви стелажа

```javascript
// @ts-check
// js/app/pages/racks/calculator/ui/renderRackName.js

import { pipe } from "../../../../core/compose.js";
import { query, setText, setState } from "../../../../effects/dom.js";
import { rackSelectors } from "../../state/rackState.js";

/**
 * Рендерить назву стелажа на основі стейту
 */
export const renderRackName = () => {
  const rack = rackSelectors.getCurrentRack();
  const name = rack?.abbreviation || "---";
  const state = rack ? "ready" : "empty";

  pipe(
    query('[data-js="rackName"]'),
    (el) => setText(el, name),
    (el) => setState(el, state),
  )();

  // Оновлення кнопки "Додати до комплекту"
  const canAdd = !!rack && rackSelectors.isFormValid();
  pipe(query('[data-js="rack-addToSetBtn"]'), (el) => {
    if (!el) return false;
    el.disabled = !canAdd;
    return setState(el, canAdd ? "ready" : "disabled")();
  })();
};

// Підписка на зміни стейту
export const subscribeToRackName = () => {
  return rackSelectors.getState().subscribe((state) => {
    if (state.currentRack || state.form) {
      renderRackName();
    }
  });
};
```

### Приклад 2: Показ/приховування модалки з анімацією

```javascript
// @ts-check
// js/app/ui/modal.js

import { pipe } from "../../core/compose.js";
import { query, setHidden, setAriaHidden, toggleClass, focus } from "../../effects/dom.js";

/**
 * Відкриває модалку з анімацією та фокусом
 * @param {string} modalSelector - селектор модалки
 * @param {string} [focusSelector] - селектор елемента для фокусу
 */
export const openModal = (modalSelector, focusSelector) => {
  pipe(
    query(modalSelector),
    (el) => {
      if (!el) return false;
      // Показуємо для анімації
      el.hidden = false;
      el.setAttribute("aria-hidden", "false");
      return true;
    },
    // Додаємо клас для CSS-анімації
    (el) => toggleClass(el, "is-open", true),
    // Фокус на перший інтерактивний елемент
    (el) => {
      if (focusSelector) {
        setTimeout(() => {
          focus(query(focusSelector), { preventScroll: true })();
        }, 100);
      }
      return true;
    },
  )();
};

/**
 * Закриває модалку з анімацією
 */
export const closeModal = (modalSelector) => {
  pipe(
    query(modalSelector),
    (el) => toggleClass(el, "is-open", false),
    // Чекаємо завершення анімації перед приховуванням
    (el) => {
      if (!el) return false;
      el.addEventListener(
        "transitionend",
        () => {
          setHidden(el, true)();
          setAriaHidden(el, true)();
        },
        { once: true },
      );
      return true;
    },
  )();
};
```

### Приклад 3: Динамічна таблиця з делегуванням

```javascript
// @ts-check
// js/app/pages/racks/set/ui/renderRackSet.js

import { createElement, appendChildren, query } from "../../../../effects/dom.js";
import { createEventManager, addDelegatedListener } from "../../../../effects/events.js";

export const renderRackSet = ({ actions, selectors, refs, mode = "page" }) => {
  const container = refs.rackSetTable;
  const racks = selectors.getAll();

  if (!container || !racks.length) {
    // Порожній стан
    container.innerHTML = '<p class="empty-state">Комплект порожній</p>';
    return;
  }

  // Створюємо рядки таблиці
  const rows = racks.map((item, index) => {
    const rack = item.rack;
    return createElement("tr", {
      className: "rack-set__main-row",
      attrs: { "data-id": item.id },
      children: [
        createElement("td", { textContent: String(index + 1) })(),
        createElement("td", {
          textContent: rack.abbreviation || "—",
          className: "font-semibold",
        })(),
        createElement("td", { textContent: String(item.qty) })(),
        createElement("td", {
          textContent: (rack.totalCost || 0).toFixed(2),
          attrs: { "data-type": "number" },
        })(),
        createElement("td", {
          textContent: ((rack.totalCost || 0) * item.qty).toFixed(2),
          className: "font-bold",
          attrs: { "data-type": "number" },
        })(),
        ...(mode === "page"
          ? [
              createElement("td", {
                children: [
                  createElement("button", {
                    className: "btn-qty-decrease",
                    attrs: { "data-action": "decrease", "aria-label": "Зменшити" },
                    textContent: "−",
                  })(),
                  createElement("button", {
                    className: "btn-qty-increase",
                    attrs: { "data-action": "increase", "aria-label": "Збільшити" },
                    textContent: "+",
                  })(),
                  createElement("button", {
                    className: "btn-remove",
                    attrs: { "data-action": "remove", "aria-label": "Видалити" },
                    textContent: "✕",
                  })(),
                ],
              })(),
            ]
          : []),
      ],
    })();
  });

  // Очищаємо та додаємо нові рядки
  container.innerHTML = "";
  appendChildren(query("tbody", container) || container, rows)();

  // Делегування подій (тільки для сторінки)
  if (mode === "page") {
    const events = createEventManager();
    const tbody = container.querySelector("tbody");

    addDelegatedListener(events, tbody, "click", "button[data-action]", (e, btn) => {
      e.preventDefault();
      const tr = btn.closest("tr[data-id]");
      if (!tr) return;

      const id = tr.dataset.id;
      const action = btn.dataset.action;
      const rackItem = selectors.getAll().find((r) => r.id === id);
      if (!rackItem) return;

      switch (action) {
        case "increase":
          actions.updateQty(id, rackItem.qty + 1);
          break;
        case "decrease": {
          const newQty = rackItem.qty - 1;
          if (newQty <= 0) actions.removeRack(id);
          else actions.updateQty(id, newQty);
          break;
        }
        case "remove":
          actions.removeRack(id);
          break;
      }
    });

    // Повертаємо cleanup
    return () => events.removeAllListeners()();
  }
};
```

### Приклад 4: Валідація форми з візуальним фідбеком

```javascript
// @ts-check
// js/app/pages/racks/calculator/ui/formValidation.js

import { pipe } from "../../../../core/compose.js";
import { query, queryAll, setState, addClass, removeClass, setText, setHTML } from "../../../../effects/dom.js";
import { rackSelectors } from "../../state/rackState.js";

/**
 * Показує помилки валідації у формі
 * @param {string[]} errors - масив повідомлень про помилки
 */
export const renderValidationErrors = (errors) => {
  const errorContainer = query('[data-js="formErrors"]');

  if (!errors?.length) {
    // Очищаємо помилки
    pipe(
      errorContainer,
      (el) => setHTML(el, ""),
      (el) => setState(el, "empty"),
      (el) => removeClass(el, "is-visible"),
    )();
    return;
  }

  // Генеруємо HTML списку помилок
  const errorHtml = `
    <ul class="error-list">
      ${errors.map((err) => `<li>⚠️ ${err}</li>`).join("")}
    </ul>
  `;

  // Показуємо помилки
  pipe(
    errorContainer,
    (el) => setHTML(el, errorHtml),
    (el) => setState(el, "error"),
    (el) => addClass(el, "is-visible"),
    // Прокрутка до першої помилки
    (el) => {
      const firstError = el?.querySelector(".error-list li");
      if (firstError) {
        setTimeout(() => {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      }
      return true;
    },
  )();

  // Підсвітка невалідних полів
  const form = query('[data-js="rackForm"]')();
  if (form) {
    // Спочатку знімаємо всі підсвітки
    queryAll(".form__control.is-invalid", form)().forEach((input) => {
      removeClass(input, "is-invalid")();
    });

    // Підсвічуємо конкретні поля за помилками
    errors.forEach((error) => {
      if (error.includes("поверхів")) {
        addClass(query("#rack-floors"), "is-invalid")();
      }
      if (error.includes("опори") && !error.includes("вертикаль")) {
        addClass(query("#rack-supports"), "is-invalid")();
      }
      if (error.includes("балок")) {
        addClass(query("#rack-beamsPerRow"), "is-invalid")();
        // Також підсвічуємо контейнер балок
        addClass(query('[data-js="rack-beamsContainer"]'), "is-invalid")();
      }
    });
  }
};

/**
 * Очищає валідацію при зміні поля
 * @param {string} fieldId - id поля, що змінилося
 */
export const clearFieldValidation = (fieldId) => {
  pipe(
    query(`#${fieldId}`),
    (el) => removeClass(el, "is-invalid"),
    (el) => {
      // Якщо це останнє поле з помилкою — ховаємо контейнер помилок
      const hasErrors = queryAll(".form__control.is-invalid")().length > 0;
      if (!hasErrors) {
        renderValidationErrors([]);
      }
      return true;
    },
  )();
};
```

---

## 🧪 Тестування

### Мокування DOM Effects

```javascript
// @ts-check
// tests/effects/dom.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { query, setState, setText, createElement } from "../../app/effects/dom.js";

describe("DOM effects", () => {
  beforeEach(() => {
    // Очищаємо DOM перед кожним тестом
    document.body.innerHTML = "";
  });

  describe("query", () => {
    it("returns element getter function", () => {
      const getter = query("#app");
      expect(typeof getter).toBe("function");
    });

    it("returns null for nonexistent selector", () => {
      const el = query("#nonexistent")();
      expect(el).toBeNull();
    });

    it("returns element when exists", () => {
      const div = document.createElement("div");
      div.id = "test";
      document.body.appendChild(div);

      const el = query("#test")();
      expect(el).toBe(div);
    });

    it("warns on invalid selector", () => {
      const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

      // @ts-expect-error - навмисна помилка для тесту
      query(null)();

      expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining("Invalid selector"));
      consoleWarn.mockRestore();
    });
  });

  describe("setState", () => {
    it("sets data-state attribute", () => {
      const el = document.createElement("div");
      const result = setState(el, "loading")();

      expect(result).toBe(true);
      expect(el.dataset.state).toBe("loading");
    });

    it("returns false for null element", () => {
      const result = setState(null, "ready")();
      expect(result).toBe(false);
    });

    it("handles ElementRef function", () => {
      const el = document.createElement("span");
      const getter = () => el;

      setState(getter, "success")();
      expect(el.dataset.state).toBe("success");
    });
  });

  describe("setText vs setHTML", () => {
    it("setText escapes HTML", () => {
      const el = document.createElement("div");
      setText(el, '<script>alert("xss")</script>')();

      expect(el.innerHTML).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(el.textContent).toBe('<script>alert("xss")</script>');
    });

    it("setHTML inserts raw HTML", () => {
      const el = document.createElement("div");
      setHTML(el, "<strong>Bold</strong>")();

      expect(el.innerHTML).toBe("<strong>Bold</strong>");
      expect(el.querySelector("strong")).toBeTruthy();
    });

    it("setHTML with sanitizer", () => {
      const el = document.createElement("div");
      const sanitize = (html) => html.replace(/<script.*?>.*?<\/script>/gi, "");

      setHTML(el, "<p>Safe</p><script>evil()</script>", sanitize)();

      expect(el.innerHTML).toBe("<p>Safe</p>");
      expect(el.innerHTML).not.toContain("script");
    });
  });

  describe("createElement", () => {
    it("creates element with tagName", () => {
      const el = createElement("button")();
      expect(el.tagName).toBe("BUTTON");
    });

    it("sets className", () => {
      const el = createElement("div", { className: "card card--primary" })();
      expect(el.className).toBe("card card--primary");
    });

    it("sets dataset attributes", () => {
      const el = createElement("input", {
        dataset: { js: "rack-floors", testId: "floors-input" },
      })();

      expect(el.dataset.js).toBe("rack-floors");
      expect(el.dataset.testId).toBe("floors-input");
    });

    it("sets textContent", () => {
      const el = createElement("span", { textContent: "Hello" })();
      expect(el.textContent).toBe("Hello");
    });

    it("appends children", () => {
      const child1 = createElement("td", { textContent: "A" })();
      const child2 = createElement("td", { textContent: "B" })();

      const row = createElement("tr", { children: [child1, child2] })();

      expect(row.children.length).toBe(2);
      expect(row.children[0].textContent).toBe("A");
      expect(row.children[1].textContent).toBe("B");
    });
  });
});
```

### Інтеграційний тест: компонент + DOM effects

```javascript
// @ts-check
// tests/ui/renderRackName.integration.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderRackName, subscribeToRackName } from "../../app/pages/racks/calculator/ui/renderRackName.js";

describe("renderRackName integration", () => {
  beforeEach(() => {
    // Готуємо DOM
    document.body.innerHTML = `
      <div id="app">
        <output data-js="rackName">---</output>
        <button data-js="rack-addToSetBtn" disabled>Додати</button>
      </div>
    `;

    // Мокаємо selectors
    vi.mock("../../app/pages/racks/state/rackState.js", () => ({
      rackSelectors: {
        getCurrentRack: vi.fn(),
        isFormValid: vi.fn(),
        getState: () => ({ subscribe: vi.fn() }),
      },
    }));
  });

  it("renders rack name when available", async () => {
    const { rackSelectors } = await import("../../app/pages/racks/state/rackState.js");
    rackSelectors.getCurrentRack.mockReturnValue({ abbreviation: "L1A1-750/430" });
    rackSelectors.isFormValid.mockReturnValue(true);

    renderRackName();

    const nameEl = document.querySelector('[data-js="rackName"]');
    expect(nameEl?.textContent).toBe("L1A1-750/430");
    expect(nameEl?.dataset.state).toBe("ready");

    const btn = document.querySelector('[data-js="rack-addToSetBtn"]');
    expect(btn?.disabled).toBe(false);
    expect(btn?.dataset.state).toBe("ready");
  });

  it("shows placeholder when no rack", () => {
    const { rackSelectors } = require("../../app/pages/racks/state/rackState.js");
    rackSelectors.getCurrentRack.mockReturnValue(null);

    renderRackName();

    const nameEl = document.querySelector('[data-js="rackName"]');
    expect(nameEl?.textContent).toBe("---");
    expect(nameEl?.dataset.state).toBe("empty");
  });

  it("subscription triggers re-render on state change", () => {
    const { rackSelectors } = require("../../app/pages/racks/state/rackState.js");

    let listener;
    rackSelectors.getState = () => ({
      subscribe: (fn) => {
        listener = fn;
        return () => {};
      },
    });

    subscribeToRackName();

    // Симулюємо зміну стейту
    rackSelectors.getCurrentRack.mockReturnValue({ abbreviation: "NEW" });
    listener?.({ currentRack: { abbreviation: "NEW" } });

    expect(document.querySelector('[data-js="rackName"]')?.textContent).toBe("NEW");
  });
});
```

---

## 🐛 Troubleshooting

### ❌ Елемент не знайдено через `query()`

**Симптоми:** `query('#app')()` повертає `null`, хоча елемент є в HTML.

**Перевірте:**

```javascript
// 1. Чи завантажився DOM до виклику query?
// ❌ Погано: скрипт виконується до DOMContentLoaded
const el = query("#app")(); // null

// ✅ Добре: виклик після завантаження DOM
document.addEventListener("DOMContentLoaded", () => {
  const el = query("#app")(); // тепер працює
});

// 2. Чи правильний селектор?
console.log("Looking for:", "#app");
console.log("Found:", document.querySelector("#app")); // перевірка напряму

// 3. Чи не змінюється id/class динамічно?
// Якщо елемент створюється після рендеру — використовуйте lazy ElementRef:
const getApp = () => document.querySelector("#app");
setState(getApp, "loading")(); // виклик, коли елемент точно існує
```

### ❌ `setState` не оновлює UI

**Симптоми:** `data-state` змінюється, але CSS-стилі не застосовуються.

**Перевірте:**

```javascript
// 1. Чи є CSS-правила для [data-state="..."]?
/* CSS має містити: */
.element[data-state="loading"] { /* стилі */ }

// 2. Чи не перевизначає інлайн-стиль?
// Інлайн-стиль має вищий пріоритет за атрибути
el.style.display = 'none'; // перевизначає [data-state="hidden"]

// 3. Використовуйте DevTools для перевірки:
console.log('Current state:', el.dataset.state);
console.log('Computed styles:', getComputedStyle(el));
```

### ❌ `setText` не показує спеціальні символи

**Симптоми:** `setText(el, '5 < 10')()` відображає `5 &lt; 10`.

**Це не помилка — це безпека!** `setText` екранує HTML-символи для захисту від XSS.

**Рішення:**

```javascript
// Для відображення символів < > & — використовуйте setText (це правильно!)
setText(el, "5 < 10")(); // → "5 < 10" у браузері, "&lt; 10" у HTML

// Якщо дійсно потрібен HTML — використовуйте setHTML з довіреним контентом:
setHTML(el, '<span class="math">5 &lt; 10</span>')();

// Для user input — завжди setText:
setText(el, userInput)(); // ✅ Безпечно
setHTML(el, userInput)(); // ❌ Ризик XSS
```

### ❌ `createElement` не додає елемент на сторінку

**Симптоми:** Елемент створено, але його не видно на сторінці.

**Перевірте:**

```javascript
// 1. Чи додано елемент у DOM через appendChildren?
const el = createElement("div")(); // створено, але не в DOM
appendChildren(query("#app"), [el])(); // тепер додано

// 2. Чи не приховано елемент через CSS?
console.log("Element in DOM:", document.body.contains(el));
console.log("Computed display:", getComputedStyle(el).display);

// 3. Для динамічних контейнерів — використовуйте lazy query:
const getContainer = () => document.querySelector("#dynamic-list");
appendChildren(getContainer, [el])(); // виклик, коли контейнер існує
```

### ❌ `focus()` не працює

**Симптоми:** Виклик `focus(el)()` не переміщує фокус на елемент.

**Перевірте:**

```javascript
// 1. Чи видимий та доступний елемент?
// focus() не працює на hidden/disabled елементах
if (el.hidden || el.disabled) {
  console.warn("Cannot focus hidden/disabled element");
  return;
}

// 2. Чи не блокує фокус інша логіка?
// Перевірте preventScroll, focusVisible опції
focus(el, { preventScroll: false })(); // дозволити прокрутку

// 3. Для елементів, що щойно з'явилися — додайте затримку:
setTimeout(() => {
  focus(el)();
}, 50); // 50ms достатньо для більшості анімацій
```

### ❌ `pipe` не виконує всі ефекти

**Симптоми:** Лише перший ефект у `pipe()` виконується, решта ігноруються.

**Перевірте:**

```javascript
// 1. Чи повертають ефекти елемент для наступного кроку?
// ❌ Погано: ефект повертає boolean, а pipe очікує елемент
pipe(
  query('#app'),
  (el) => setState(el, 'loading') // → boolean, не елемент!
  (el) => setHTML(el, '...') // ← не виконається, бо el = boolean
)();

// ✅ Добре: повертаємо елемент після side-effect
pipe(
  query('#app'),
  (el) => { setState(el, 'loading')(); return el; },
  (el) => { setHTML(el, '...')(); return el; }
)();

// АБО використовуйте ефекти, що вже повертають елемент:
pipe(
  query('#app'),
  (el) => setState(el, 'loading'), // → () => boolean, але pipe ігнорує return
  (el) => setHTML(el, '...')
)();
// ← Увага: pipe передає результат попереднього кроку,
// але DOM-ефекти зазвичай ігнорують return у композиції.
// Краще використовувати послідовні виклики для складних сценаріїв.
```

---

## 📚 Додаткові ресурси

| Тема                       | Де шукати                                                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **DOM API reference**      | [MDN: Document](https://developer.mozilla.org/uk/docs/Web/API/Document)                                                             |
| **Accessibility (ARIA)**   | [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)                                                                        |
| **XSS prevention**         | [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) |
| **Functional composition** | `js/app/core/compose.js` → `pipe`, `compose`                                                                                        |
| **Testing DOM**            | `tests/effects/dom.test.js`                                                                                                         |

---

## 🚀 Шпаргалка: Швидкий старт DOM Effects

```javascript
// 1. Імпорт
import { query, setState, setText, pipe } from "../effects/dom.js";

// 2. Просте оновлення UI
pipe(
  query('[data-js="userName"]'),
  (el) => setText(el, "Олександр"),
  (el) => setState(el, "ready"),
)();

// 3. Створення елемента
const card = createElement("div", {
  className: "card",
  dataset: { rackId: "abc123" },
  children: [
    createElement("h3", { textContent: "Стелаж L1A1" })(),
    createElement("p", { textContent: "Ціна: 5036 ₴" })(),
  ],
})();

// 4. Додавання в DOM
appendChildren(query("#rackList"), [card])();

// 5. Реактивне оновлення
const unsub = state.subscribe((s) => {
  pipe(
    query('[data-js="total"]'),
    (el) => setText(el, formatPrice(s.total)),
    (el) => setState(el, s.total > 0 ? "ready" : "empty"),
  )();
});

// 6. Cleanup
const cleanup = () => {
  unsub();
  removeElement(query("#temp-banner"))();
};

// 7. Готово! 🎨
```

---

> 💡 **Порада**: DOM Effects — це ваш інструмент для **безпечної** та **передбачуваної** роботи з інтерфейсом. Завжди використовуйте `setText` для користувачого вводу, плануйте cleanup, і не бійтеся створювати helpers для повторного використання.

Успіхів у створенні красивих інтерфейсів! 🎨✨

---

**Наступний гайд:**

- 🌐 [HTTP Effects Guide](#) — fetch, middleware, обробка помилок, кешування
