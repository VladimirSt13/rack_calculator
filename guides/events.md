# 🎧 Гайд по Events Effects в Rack Calculator

Цей документ описує архітектуру роботи з подіями, принцип роботи `EventManager`, патерни делегування та інструкції для розробників.

---

## 📋 Зміст

1. [Філософія Events](#філософія-events)
2. [Архітектура EventManager](#архітектура-eventmanager)
3. [API довідник](#api-довідник)
4. [Утиліти для роботи з подіями](#утиліти-для-роботи-з-подіями)
5. [Best Practices](#best-practices)
6. [Приклади використання](#приклади-використання)
7. [Тестування](#тестування)
8. [Troubleshooting](#troubleshooting)

---

## 🧭 Філософія Events

### Чому не `addEventListener` напряму?

| Прямий `addEventListener`         | EventManager                           |
| --------------------------------- | -------------------------------------- |
| ❌ Важко відстежувати всі слухачі | ✅ Централізований реєстр              |
| ❌ Ризик витоків пам'яті          | ✅ Автоматичний cleanup                |
| ❌ Дублікати слухачів             | ✅ Вбудована дедуплікація              |
| ❌ Неможливо "відкотити" зміни    | ✅ Immutable: кожна зміна → новий стан |
| ❌ Важко тестувати                | ✅ Легко мокати та ізолювати           |

### Ключові принципи

```
┌─────────────────────────────────┐
│  EventManager (immutable)       │
│                                 │
│  addListener → new EventManager │
│  removeListener → new Manager   │
│  getListeners → readonly copy   │
│                                 │
│  • Жодних мутацій оригіналу    │
│  • Кожен слухач має унікальний ID│
│  • Валідація аргументів "на вході"│
└─────────────────────────────────┘
```

| Принцип           | Опис                                       | Перевага                                        |
| ----------------- | ------------------------------------------ | ----------------------------------------------- |
| **Immutable**     | Кожна операція повертає новий EventManager | Безпечне спільне використання, передбачуваність |
| **Curried API**   | `addListener(target)(event)(handler)`      | Гнучке часткове застосування, композиція        |
| **Unique IDs**    | Кожен слухач має унікальний `id`           | Точне видалення, дебаг, тестування              |
| **Validation**    | Перевірка аргументів перед реєстрацією     | Раннє виявлення помилок, кращі повідомлення     |
| **Deduplication** | Не додає дублікати слухачів                | Уникнення витоків пам'яті, продуктивність       |

---

## 🏗️ Архітектура EventManager

### Структура даних

```javascript
/**
 * @typedef {Object} Listener
 * @property {string} id - унікальний ідентифікатор
 * @property {EventTarget} target - DOM елемент або інший EventTarget
 * @property {string} event - тип події ('click', 'input', тощо)
 * @property {Function} handler - функція-обробник
 * @property {AddEventListenerOptions} [options] - опції addEventListener
 */

/**
 * @typedef {Object} EventManager
 * @property {Function} addListener - curried: (target) => (event) => (handler) => (options?) => EventManager
 * @property {(id: string) => EventManager} removeListener - видалити за ID
 * @property {(predicate: (l: Listener) => boolean) => EventManager} removeListeners - видалити за умовою
 * @property {() => EventManager} removeAllListeners - очистити всі
 * @property {() => readonly Listener[]} getListeners - отримати копію списку
 * @property {() => number} count - кількість активних слухачів
 */
```

### Потік даних

```
1. createEventManager()
   │
   ▼
2. events.addListener(target)(event)(handler)(options)
   │
   ▼
3. validateListener() → чи валідні аргументи?
   │
   ▼
4. listenerEquals() → чи вже існує такий слухач?
   │
   ▼
5. registerInDOM() → target.addEventListener(...)
   │
   ▼
6. return createEventManager([...listeners, newListener])
   │
   ▼
7. Новий immutable EventManager готовий до використання
```

### Чому immutable?

```javascript
// ❌ Мутабельний підхід (ризик багів)
const events = createEventManager();
events.addListener(btn, "click", handler); // мутує внутрішній стан
// Інша частина коду може мати старе посилання на events!

// ✅ Immutable підхід (передбачуваність)
const events1 = createEventManager();
const events2 = events1.addListener(btn)("click")(handler);
// events1 залишається незмінним, events2 — нова версія зі слухачем
```

---

## 📚 API довідник

### 🏭 `createEventManager(initialListeners = [])`

Створює новий екземпляр EventManager.

```javascript
import { createEventManager } from "../effects/events.js";

// Базове використання
const events = createEventManager();

// З попередніми слухачами (для тестів або відновлення стану)
const restored = createEventManager(savedListeners);
```

**Повертає:** `EventManager` object (immutable, frozen)

---

### ➕ `addListener` (curried)

Додає новий слухач подій.

```javascript
// Повний curried виклик:
const newEvents = events.addListener(target)(
  // EventTarget
  "click",
)(
  // string: тип події
  handler,
)(
  // Function: обробник
  options,
); // AddEventListenerOptions (опціонально)

// Скорочений виклик (options за замовчуванням {}):
const newEvents = events.addListener(target)("click")(handler);

// Часткове застосування (reusable helpers):
const addClick = events.addListener(button)("click");
const logClick = addClick((e) => console.log("Clicked!", e));

const addFormInput = events.addListener(form)("input");
addFormInput(handleNameChange);
addFormInput(handleEmailChange);
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `target` | `EventTarget` | DOM елемент, `window`, `document`, тощо |
| `event` | `string` | Тип події: `'click'`, `'input'`, `'submit'`, тощо |
| `handler` | `Function` | Функція-обробник: `(event: Event) => void` |
| `options` | `AddEventListenerOptions` | Опції: `{ once, passive, capture }` |

**Повертає:** Новий `EventManager` з доданим слухачем

**Валідація:**

- `target` має бути екземпляром `EventTarget`
- `event` має бути непорожнім рядком
- `handler` має бути функцією
- Дублікати автоматично ігноруються

---

### ➖ `removeListener(id)`

Видаляє слухач за унікальним ID.

```javascript
// Отримуємо ID слухача
const listeners = events.getListeners();
const clickListener = listeners.find((l) => l.event === "click");
const id = clickListener?.id;

// Видаляємо
const cleanedEvents = events.removeListener(id);
```

**Повертає:** Новий `EventManager` без видаленого слухача

---

### 🧹 `removeListeners(predicate)`

Видаляє слухачі, що задовольняють умову.

```javascript
// Видалити всі слухачі події 'click'
const noClicks = events.removeListeners((l) => l.event === "click");

// Видалити всі слухачі конкретного елемента
const cleaned = events.removeListeners((l) => l.target === button);

// Видалити слухачі з певною опцією
const noOnce = events.removeListeners((l) => l.options?.once);
```

**Параметри:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `predicate` | `(Listener) => boolean` | Функція, що повертає `true` для слухачів на видалення |

**Повертає:** Новий `EventManager` з відфільтрованими слухачами

---

### 🗑️ `removeAllListeners()`

Очищає всі зареєстровані слухачі.

```javascript
// Повний cleanup
const emptyEvents = events.removeAllListeners();
// emptyEvents.count() === 0
```

**Повертає:** Новий порожній `EventManager`

> ⚠️ **Важливо:** Завжди викликайте це у `deactivate()` або cleanup-функціях, щоб уникнути витоків пам'яті!

---

### 👁️ `getListeners()`

Повертає immutable копію списку слухачів.

```javascript
const listeners = events.getListeners();

// Аналіз: скільки слухачів на кожному елементі?
const byTarget = listeners.reduce((acc, l) => {
  acc[l.target] = (acc[l.target] || 0) + 1;
  return acc;
}, {});

// Дебаг: вивести всі активні слухачі
console.log(
  "Active listeners:",
  listeners.map((l) => ({
    id: l.id.slice(0, 20) + "...",
    target: l.target.tagName || l.target,
    event: l.event,
  })),
);
```

**Повертає:** `readonly Listener[]` — копія, зміни не вплинуть на оригінал

---

### 🔢 `count()`

Повертає кількість активних слухачів.

```javascript
console.log(`Active listeners: ${events.count()}`);

// Перевірка в тестах
expect(events.count()).toBe(0); // після cleanup
```

**Повертає:** `number`

---

## 🛠️ Утиліти для роботи з подіями

### 🔄 `debounceHandler(handler, delay = 300)`

Створює debounced версію обробника (чекає паузу між викликами).

```javascript
import { debounceHandler } from "../effects/events.js";

// Пошук: чекаємо 300ms після останнього вводу
const debouncedSearch = debounceHandler((e) => {
  searchApi(e.target.value);
}, 300);

events.addListener(input)("input")(debouncedSearch);
```

**Коли використовувати:**

- Пошук / фільтрація
- Авто-збереження форми
- Валідація в реальному часі

---

### ⚡ `throttleHandler(handler, limit = 100)`

Створює throttled версію обробника (обмежує частоту викликів).

```javascript
import { throttleHandler } from "../effects/events.js";

// Скролл: обробляємо не частіше ніж раз на 100ms
const throttledScroll = throttleHandler((e) => {
  updateStickyHeader(window.scrollY);
}, 100);

events.addListener(window)("scroll")(throttledScroll);
```

**Коли використовувати:**

- Скролл / ресайз
- Drag-and-drop
- Анімації на основі подій

---

### 🎯 `addDelegatedListener(events, container, eventType, selector, handler)`

Додає делегований слухач (event delegation pattern).

```javascript
import { addDelegatedListener } from "../effects/events.js";

// Один слухач на tbody обробляє всі кнопки в рядках
addDelegatedListener(
  events,
  tbody, // контейнер
  "click", // тип події
  "button[data-action]", // селектор цілей
  (e, target) => {
    // handler отримує (event, matchedElement)
    const action = target.dataset.action;
    const rowId = target.closest("tr")?.dataset.id;
    handleAction(action, rowId);
  },
);
```

**Переваги:**

- ✅ Продуктивність: 1 слухач замість N
- ✅ Працює з динамічно доданими елементами
- ✅ Автоматичний cleanup через EventManager

---

### 🎲 `addOnceListener(events, target, event, handler, options)`

Додає слухач, який автоматично видаляється після першого виклику.

```javascript
import { addOnceListener } from "../effects/events.js";

// Показати тултіп тільки один раз
addOnceListener(events, tooltipBtn, "mouseenter", (e) => showTooltip("Це підказка!"), { passive: true });
```

---

### ⌨️ `createKeyboardHandler(handler, keys, options)`

Створює обробник для гарячих клавіш.

```javascript
import { createKeyboardHandler } from "../effects/events.js";

const shortcutHandler = createKeyboardHandler(
  (e, key) => {
    switch (key) {
      case "Enter":
        actions.calculate?.();
        break;
      case "Escape":
        actions.reset?.();
        break;
      case "s":
        if (e.ctrlKey) {
          e.preventDefault();
          actions.save?.();
        }
        break;
    }
  },
  ["enter", "escape", "s"], // ключі для відстеження
  { ctrl: false }, // опції модифікаторів
);

events.addListener(document)("keydown")(shortcutHandler);
```

---

### 🔗 `syncInput(events, input, getValue, setValue, event = 'input')`

Двостороння синхронізація форми (two-way binding).

```javascript
import { syncInput } from "../effects/events.js";

const { unsubscribe, update } = syncInput(
  events,
  floorsInput,
  () => state.get().form.floors, // getValue: state → UI
  (value) => actions.updateForm({ floors: value }), // setValue: UI → state
  "input",
);

// Якщо стейт змінюється зовні — оновлюємо UI
const unsubState = state.subscribe((s) => {
  if (s.form.floors !== Number(floorsInput.value)) {
    update();
  }
});

// Cleanup
return () => {
  unsubscribe();
  unsubState();
};
```

---

## ✨ Best Practices

### 1. Завжди робіть cleanup

```javascript
// ❌ Погано: слухачі накопичуються
activate: () => {
  events.addListener(btn)('click')(handler);
  // Немає cleanup → витік пам'яті!
},

// ✅ Добре: зберігаємо та очищуємо
let eventsRef;

activate: () => {
  eventsRef = createEventManager();
  const withHandler = eventsRef.addListener(btn)('click')(handler);
  // Зберігаємо withHandler для cleanup
  return () => withHandler.removeAllListeners()();
},

deactivate: (cleanup) => {
  cleanup?.(); // Викликаємо повернену функцію cleanup
},
```

### 2. Використовуйте делегування для динамічних списків

```javascript
// ❌ Погано: слухач на кожному елементі
racks.forEach((rack) => {
  const btn = rack.querySelector(".btn-remove");
  events.addListener(btn)("click")(handleRemove); // N слухачів!
});

// ✅ Добре: один делегований слухач
addDelegatedListener(events, container, "click", ".btn-remove", (e, btn) => {
  const rackId = btn.closest("[data-rack-id]")?.dataset.rackId;
  handleRemove(rackId);
}); // 1 слухач для всіх!
```

### 3. Уникайте анонімних функцій у циклах

```javascript
// ❌ Погано: неможливо видалити конкретний слухач
for (const btn of buttons) {
  events.addListener(btn)("click")((e) => handleClick(e, btn));
  // Кожна ітерація створює нову анонімну функцію → дедуплікація не працює!
}

// ✅ Добре: зберігаємо посилання на handler
const handlers = new Map();

for (const btn of buttons) {
  const handler = (e) => handleClick(e, btn);
  handlers.set(btn, handler);
  events.addListener(btn)("click")(handler);
}

// Для видалення:
handlers.forEach((handler, btn) => {
  // ... знайти ID та видалити
});
```

### 4. Використовуйте `debounce` / `throttle` для частих подій

```javascript
// ❌ Погано: обробка кожного натискання
events.addListener(input)("input")((e) => {
  searchApi(e.target.value); // Може бути 10+ викликів на секунду!
});

// ✅ Добре: debounce для пошуку
const debouncedSearch = debounceHandler((e) => {
  searchApi(e.target.value);
}, 300);
events.addListener(input)("input")(debouncedSearch);

// ✅ Добре: throttle для скролла
const throttledScroll = throttleHandler((e) => {
  updateLazyImages();
}, 100);
events.addListener(window)("scroll")(throttledScroll);
```

### 5. Валідуйте дані в handler, не в реєстрації

```javascript
// ❌ Погано: складна логіка при реєстрації
events.addListener(form)("submit")((e) => {
  e.preventDefault();
  if (!validateForm()) return;
  if (!isConnected()) return;
  if (isRateLimited()) return;
  submitForm();
});

// ✅ Добре: реєстрація проста, логіка в окремій функції
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showErrors(getValidationErrors());
    return;
  }

  try {
    await submitForm();
    showSuccess("Збережено!");
  } catch (error) {
    showError(error);
  }
};

events.addListener(form)("submit")(handleSubmit);
```

### 6. Експортуйте чисті helpers для тестування

```javascript
// events.js
export const parseFormData = (form) => {
  const data = {};
  for (const [key, value] of new FormData(form)) {
    data[key] = value;
  }
  return data;
};

// tests/events.test.js
import { parseFormData } from "../effects/events.js";

it("parses form data correctly", () => {
  const form = document.createElement("form");
  form.innerHTML = '<input name="name" value="Test">';

  expect(parseFormData(form)).toEqual({ name: "Test" });
});
```

---

## 💻 Приклади використання

### Приклад 1: Форма з валідацією в реальному часі

```javascript
// @ts-check
// js/app/pages/racks/calculator/ui/formHandler.js

import { createEventManager, debounceHandler, syncInput } from "../../../../effects/events.js";
import { rackActions, rackSelectors } from "../../state/rackState.js";

export const initFormHandlers = ({ refs }) => {
  const events = createEventManager();

  // ===== Двостороння синхронізація полів =====
  const syncField = (inputRef, stateKey, transform = (v) => v) => {
    const input = inputRef();
    if (!input) return () => {};

    return syncInput(
      events,
      input,
      () => transform(rackSelectors.getForm()[stateKey]),
      (value) => rackActions.updateForm({ [stateKey]: transform(value) }),
      input.type === "number" ? "change" : "input",
    );
  };

  const unsubFloors = syncField(
    () => refs.floorsInput,
    "floors",
    (v) => Number(v) || 0,
  );

  // ===== Debounced валідація =====
  const debouncedValidate = debounceHandler(() => {
    const errors = rackSelectors.getValidationErrors();
    renderErrors(errors);
  }, 200);

  const withValidate = events.addListener(refs.form)("input")(debouncedValidate);

  // ===== Submit handler =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rackSelectors.isFormValid()) {
      renderErrors(rackSelectors.getValidationErrors());
      return;
    }

    refs.submitBtn?.setAttribute("data-state", "loading");

    try {
      await rackActions.calculateRack();
      refs.submitBtn?.setAttribute("data-state", "success");
    } catch (error) {
      refs.submitBtn?.setAttribute("data-state", "error");
      showError(error);
    }
  };

  const withSubmit = events.addListener(refs.form)("submit")(handleSubmit);

  // ===== Cleanup =====
  return () => {
    unsubFloors();
    withValidate.removeAllListeners()();
    withSubmit.removeAllListeners()();
  };
};
```

### Приклад 2: Делегування для таблиці комплекту

```javascript
// @ts-check
// js/app/pages/racks/set/ui/renderRackSet.js

import { createEventManager, addDelegatedListener } from "../../../../effects/events.js";

export const renderRackSet = ({ actions, selectors, refs, mode = "page" }) => {
  if (mode !== "page") return;

  const tbody = refs.rackSetTable?.querySelector("tbody");
  if (!tbody) return;

  const events = createEventManager();

  // Один слухач обробляє всі кнопки в таблиці
  const withDelegated = addDelegatedListener(events, tbody, "click", "button[data-action]", (e, btn) => {
    e.preventDefault();
    e.stopPropagation();

    const tr = btn.closest("tr.rack-set__main-row[data-id]");
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
        if (newQty <= 0) {
          actions.removeRack(id);
        } else {
          actions.updateQty(id, newQty);
        }
        break;
      }

      case "remove":
        actions.removeRack(id);
        break;
    }
  });

  // Повертаємо cleanup функцію
  return () => {
    withDelegated.removeAllListeners()();
  };
};
```

### Приклад 3: Гарячі клавіші для навігації

```javascript
// @ts-check
// js/app/ui/keyboardShortcuts.js

import { createEventManager, createKeyboardHandler } from "../effects/events.js";

/**
 * Ініціалізує глобальні гарячі клавіші
 * @param {Object} actions - доступні дії
 * @returns {Function} cleanup function
 */
export const initKeyboardShortcuts = (actions = {}) => {
  const events = createEventManager();

  const handler = createKeyboardHandler(
    (e, key) => {
      // Навігація
      if (key === "1" && actions.goToRack) actions.goToRack();
      if (key === "2" && actions.goToBattery) actions.goToBattery();

      // Дії на сторінці
      if (key === "Enter" && actions.calculate) actions.calculate();
      if (key === "Escape" && actions.reset) actions.reset();

      // Збереження
      if (key === "s" && e.ctrlKey && actions.save) {
        e.preventDefault();
        actions.save();
      }

      // Допомога
      if (key === "?" && actions.showHelp) {
        e.preventDefault();
        actions.showHelp();
      }
    },
    ["1", "2", "enter", "escape", "s", "?"],
    { ctrl: false },
  );

  const withListener = events.addListener(document)("keydown")(handler);

  return () => withListener.removeAllListeners()();
};

// ===== Використання в main.js =====
// import { initKeyboardShortcuts } from './ui/keyboardShortcuts.js';
//
// const cleanupShortcuts = initKeyboardShortcuts({
//   goToRack: () => router.navigate('rack'),
//   goToBattery: () => router.navigate('battery'),
//   calculate: () => rackActions.calculateRack(),
//   reset: () => rackActions.resetForm(),
//   save: () => savePreset(),
//   showHelp: () => showHelpModal(),
// });
//
// // Cleanup при виході
// window.addEventListener('beforeunload', cleanupShortcuts);
```

### Приклад 4: Авто-збереження форми

```javascript
// @ts-check
// js/app/state/middleware.js

import { debounceHandler } from "../effects/events.js";

/**
 * Middleware для авто-збереження форми в localStorage
 * @param {string} storageKey
 * @param {(state: any) => any} selectData - яку частину стейту зберігати
 * @param {number} [debounceMs=1000]
 * @returns {Middleware}
 */
export const createAutoSaveMiddleware = (storageKey, selectData, debounceMs = 1000) => {
  // Debounced функція збереження
  const debouncedSave = debounceHandler((data) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`[AutoSave] Saved ${storageKey}`);
    } catch (e) {
      console.warn(`[AutoSave] Failed:`, e);
    }
  }, debounceMs);

  return (ctx) => {
    // Зберігаємо тільки якщо змінилося те, що нас цікавить
    const dataToSave = selectData(ctx.nextState);
    if (!dataToSave) return;

    debouncedSave(dataToSave);
  };
};

// ===== Використання =====
import { createState, createAutoSaveMiddleware } from "../state/createState.js";

const rackState = createState(initialRackState);

// Авто-зберігаємо тільки форму
rackState.use(
  createAutoSaveMiddleware(
    "rack-form-autosave",
    (state) => state.form,
    1000, // debounce 1 секунда
  ),
);

// При завантаженні: відновлюємо збережену форму
const saved = localStorage.getItem("rack-form-autosave");
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    rackState.updateField("form", { ...initialRackState.form, ...parsed });
  } catch (e) {
    console.warn("Failed to restore autosaved form:", e);
  }
}
```

---

## 🧪 Тестування

### Мокування EventManager

```javascript
// @ts-check
// tests/effects/events.test.js

import { describe, it, expect, vi } from "vitest";
import { createEventManager, debounceHandler, throttleHandler } from "../../app/effects/events.js";

describe("createEventManager", () => {
  it("addListener returns new immutable manager", () => {
    const events1 = createEventManager();
    const mockTarget = { addEventListener: vi.fn() };

    const events2 = events1.addListener(mockTarget)("click")(() => {});

    expect(events1).not.toBe(events2);
    expect(events1.count()).toBe(0);
    expect(events2.count()).toBe(1);
  });

  it("does not add duplicate listeners", () => {
    const events = createEventManager();
    const mockTarget = { addEventListener: vi.fn() };
    const handler = () => {};

    const once = events.addListener(mockTarget)("click")(handler);
    const twice = once.addListener(mockTarget)("click")(handler);

    expect(twice.count()).toBe(1); // дублікат не додано
  });

  it("removeListener by id works", () => {
    const events = createEventManager();
    const mockTarget = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    const withListener = events.addListener(mockTarget)("click")(() => {});
    const id = withListener.getListeners()[0].id;

    const cleaned = withListener.removeListener(id);

    expect(mockTarget.removeEventListener).toHaveBeenCalled();
    expect(cleaned.count()).toBe(0);
  });

  it("validates arguments and warns on invalid", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const events = createEventManager();

    // @ts-expect-error - навмисна помилка для тесту
    events.addListener(null)("click")(() => {});

    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining("target не є EventTarget"));

    consoleWarn.mockRestore();
  });
});

describe("debounceHandler", () => {
  it("delays handler execution", async () => {
    const handler = vi.fn();
    const debounced = debounceHandler(handler, 50);

    debounced();
    debounced();
    debounced();

    expect(handler).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("preserves this context", () => {
    const obj = {
      count: 0,
      increment: function () {
        this.count++;
      },
    };

    const debounced = debounceHandler(obj.increment, 10);
    debounced.call(obj);

    // Після затримки this має бути збережено
    setTimeout(() => {
      expect(obj.count).toBe(1);
    }, 50);
  });
});

describe("throttleHandler", () => {
  it("limits handler execution frequency", async () => {
    const handler = vi.fn();
    const throttled = throttleHandler(handler, 50);

    throttled();
    throttled();
    throttled();

    expect(handler).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setTimeout(resolve, 100));
    throttled();
    expect(handler).toHaveBeenCalledTimes(2);
  });
});

describe("addDelegatedListener", () => {
  it("calls handler for matching selector", () => {
    const events = createEventManager();
    const container = document.createElement("div");
    const child = document.createElement("button");
    child.className = "btn-action";
    container.appendChild(child);

    const handler = vi.fn();
    const withDelegated = addDelegatedListener(events, container, "click", ".btn-action", handler);

    // Симулюємо подію
    child.click();

    expect(handler).toHaveBeenCalledWith(
      expect.any(Event),
      child, // другий аргумент — matched element
    );
  });

  it("ignores events outside selector", () => {
    const events = createEventManager();
    const container = document.createElement("div");
    const other = document.createElement("span");
    container.appendChild(other);

    const handler = vi.fn();
    const withDelegated = addDelegatedListener(events, container, "click", ".btn-action", handler);

    other.click();
    expect(handler).not.toHaveBeenCalled();
  });
});
```

### Інтеграційний тест: компонент + events

```javascript
// @ts-check
// tests/ui/formHandler.integration.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEventManager } from "../../app/effects/events.js";
import { initFormHandlers } from "../../app/pages/racks/calculator/ui/formHandler.js";

describe("initFormHandlers integration", () => {
  let mockRefs, mockActions, cleanup;

  beforeEach(() => {
    // Мокаємо DOM елементи
    mockRefs = {
      form: document.createElement("form"),
      floorsInput: Object.assign(document.createElement("input"), {
        id: "floors",
        type: "number",
        value: "1",
      }),
      submitBtn: document.createElement("button"),
    };

    mockRefs.form.appendChild(mockRefs.floorsInput);

    // Мокаємо actions
    mockActions = {
      updateForm: vi.fn(),
      calculateRack: vi.fn().mockResolvedValue({ success: true }),
    };

    // Мокаємо selectors
    vi.mock("../../app/pages/racks/state/rackState.js", () => ({
      rackSelectors: {
        getForm: () => ({ floors: 1 }),
        isFormValid: () => true,
        getValidationErrors: () => [],
      },
      rackActions: mockActions,
    }));
  });

  it("registers input listeners and calls updateForm", () => {
    cleanup = initFormHandlers({ refs: mockRefs });

    // Симулюємо ввід
    mockRefs.floorsInput.value = "3";
    mockRefs.floorsInput.dispatchEvent(new Event("input", { bubbles: true }));

    // Перевіряємо виклик action
    expect(mockActions.updateForm).toHaveBeenCalledWith(expect.objectContaining({ floors: 3 }));
  });

  it("cleanup removes all listeners", () => {
    const events = createEventManager();
    cleanup = initFormHandlers({ refs: mockRefs, events });

    const initialCount = events.count();
    cleanup();

    expect(events.count()).toBeLessThan(initialCount);
  });
});
```

---

## 🐛 Troubleshooting

### ❌ Слухачі не видаляються (витік пам'яті)

**Симптоми:** Після кількох переходів між сторінками події спрацьовують кілька разів.

**Перевірте:**

```javascript
// 1. Чи викликається removeAllListeners() у cleanup?
deactivate: () => {
  events.removeAllListeners()(); // ✅ Дужки для виклику!
},

// 2. Чи не створюєте ви новий EventManager при кожному render?
// ❌ Погано:
const render = () => {
  const events = createEventManager(); // Новий менеджер кожен раз!
  events.addListener(...)();
};

// ✅ Добре:
let events; // Зберігаємо поза render
const init = () => {
  events = createEventManager();
  // ...
};
const cleanup = () => {
  events?.removeAllListeners()();
};

// 3. Використовуйте getListeners() для дебагу
console.log('Active listeners:', events.getListeners().map(l => ({
  target: l.target.tagName,
  event: l.event,
  id: l.id.slice(0, 15) + '...'
})));
```

### ❌ Handler не викликається

**Симптоми:** Подія реєструється, але обробник не спрацьовує.

**Перевірте:**

```javascript
// 1. Чи існує target в DOM на момент реєстрації?
const btn = document.querySelector("#myBtn");
if (!btn) {
  console.warn("Button not found, skipping listener registration");
  return;
}

// 2. Чи не зупиняє подію інший обробник?
// Перевірте e.stopPropagation() або e.preventDefault() в інших слухачах

// 3. Чи правильний тип події?
// 'click' для кнопок, 'input' для полів, 'submit' для форм
events.addListener(btn)("click")(handler); // ✅
events.addListener(btn)("onclick")(handler); // ❌

// 4. Для делегованих слухачів: чи працює selector?
const target = e.target.closest(".btn-action");
console.log("Matched element:", target); // null = selector не спрацював
```

### ❌ Debounce/throttle не працюють як очікується

**Симптоми:** Обробник викликається занадто часто або занадто рідко.

**Перевірте:**

```javascript
// 1. Чи передаєте ви оригінальний handler, а не результат виклику?
// ❌ Погано:
events.addListener(input)("input")(debounceHandler(() => search(), 300)());

// ✅ Добре:
const debouncedSearch = debounceHandler(() => search(), 300);
events.addListener(input)("input")(debouncedSearch);

// 2. Чи зберігається контекст `this`?
// Debounce/throttle зберігають контекст через .apply(this, args)
// Якщо потрібен специфічний контекст — використовуйте bind:
const boundHandler = debounceHandler(obj.method.bind(obj), 300);

// 3. Для throttle: чи не блокує подію preventDefault?
// Throttled handler може не встигнути виконатися, якщо подія скасована
```

### ❌ Делегування не знаходить target

**Симптоми:** `addDelegatedListener` реєструється, але handler не отримує правильний елемент.

**Перевірте:**

```javascript
// 1. Чи підтримує браузер element.closest()?
// Для старих браузерів додайте поліфіл:
if (!Element.prototype.closest) {
  Element.prototype.closest = function (selector) {
    let el = this;
    while (el) {
      if (el.matches(selector)) return el;
      el = el.parentElement;
    }
    return null;
  };
}

// 2. Чи не зупиняє подію вкладений елемент?
// Якщо кнопка містить іконку: <button><span>🗑️</span> Видалити</button>
// e.target буде span, а closest('.btn-remove') поверне button ✅

// 3. Чи правильний селектор?
// '.btn-remove' — клас
// '[data-action="remove"]' — атрибут
// 'button.remove-btn' — комбінація
addDelegatedListener(events, container, "click", ".btn-remove", handler);
```

### ❌ EventManager повертає помилку валідації

**Симптоми:** `console.warn: [EventManager] handler повинен бути функцією`

**Перевірте:**

```javascript
// 1. Чи не передаєте ви результат виклику функції замість самої функції?
// ❌ Погано:
events.addListener(btn)("click")(handleClick()); // handleClick() виконується негайно!

// ✅ Добре:
events.addListener(btn)("click")(handleClick); // передаємо посилання на функцію

// 2. Для arrow functions: чи не забули дужки?
// ❌ Погано:
events.addListener(btn)("click")((e) => handleClick(e)); // ✅ це правильно
// Але якщо handleClick не потребує e:
events.addListener(btn)("click")(handleClick); // простіше

// 3. Для методів об'єкта: чи зберігається this?
// ❌ Погано:
events.addListener(btn)("click")(obj.method); // this буде undefined

// ✅ Добре:
events.addListener(btn)("click")(obj.method.bind(obj));
// або
events.addListener(btn)("click")((e) => obj.method(e));
```

---

## 📚 Додаткові ресурси

| Тема                   | Де шукати                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| **EventTarget API**    | [MDN: EventTarget](https://developer.mozilla.org/uk/docs/Web/API/EventTarget)             |
| **Event delegation**   | [JavaScript.info: Bubbling and capturing](https://javascript.info/bubbling-and-capturing) |
| **Debounce/throttle**  | [lodash.debounce source](https://github.com/lodash/lodash/blob/master/debounce.js)        |
| **Immutable patterns** | `js/app/state/createState.js` → `cloneValue`, `applyPatch`                                |
| **Testing events**     | `tests/effects/events.test.js`                                                            |

---

## 🚀 Шпаргалка: Швидкий старт EventManager

```javascript
// 1. Імпорт
import { createEventManager, debounceHandler, addDelegatedListener } from "../effects/events.js";

// 2. Створення менеджера
const events = createEventManager();

// 3. Простий слухач
const withClick = events.addListener(button)("click")((e) => handleClick(e));

// 4. З опціями
const withPassive = events.addListener(window)("scroll")(handleScroll)({ passive: true });

// 5. Debounced search
const debouncedSearch = debounceHandler((e) => {
  search(e.target.value);
}, 300);
events.addListener(input)("input")(debouncedSearch);

// 6. Делегування для списку
addDelegatedListener(events, listContainer, "click", ".item-btn", (e, btn) => handleItemClick(btn.dataset.id));

// 7. Cleanup (ОБОВ'ЯЗКОВО!)
const cleanup = () => {
  withClick.removeAllListeners()();
  withPassive.removeAllListeners()();
  // ... інші cleanup
};

// 8. Готово! 🎉
```

---

> 💡 **Порада**: EventManager — це ваш інструмент для **контролю** над подіями. Завжди плануйте cleanup на етапі написання коду, використовуйте делегування для динамічних елементів, і не бійтеся створювати helpers для повторного використання.

Успіхів у керуванні подіями! 🎧✨

---

**Наступні гайди:**

- 🎨 [DOM Effects Guide](#) — робота з елементами, атрибутами, стилями
- 🌐 [HTTP Effects Guide](#) — fetch, middleware, обробка помилок

Який хочете наступним? 😊
