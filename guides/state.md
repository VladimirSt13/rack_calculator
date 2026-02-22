# 🧠 Гайд по стейт-менеджменту в Rack Calculator

Цей документ описує архітектуру управління станом, принцип роботи `createState`, патерни Actions/Selectors та інструкції для розробників.

---

## 📋 Зміст

1. [Архітектура](#архітектура)
2. [Як працює createState](#як-працює-createstate)
3. [Actions: логіка змін](#actions-логіка-змін)
4. [Selectors: читання стану](#selectors-читання-стану)
5. [Middleware: side-effects](#middleware-side-effects)
6. [Best Practices](#best-practices)
7. [Приклади використання](#приклади-використання)
8. [Troubleshooting](#troubleshooting)
9. [Тестування](#тестування)

---

## 🏗️ Архітектура

```
┌─────────────────────────────────────┐
│         js/app/state/               │
│  • createState.js ← ядро (immutable)│
│  • middleware.js  ← розширення      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│     js/app/pages/*/state/           │
│  • rackState.js   ← ініціалізація   │
│  • rackActions.js ← логіка змін     │
│  • rackSelectors.js ← геттери       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│        UI Components                │
│  • Тільки читають через selectors   │
│  • Тільки змінюють через actions    │
│  • Ніколи не працюють зі стейтом   │
│    напряму!                         │
└─────────────────────────────────────┘
```

### Ключові принципи

| Принцип               | Опис                                                        | Перевага                           |
| --------------------- | ----------------------------------------------------------- | ---------------------------------- |
| **Immutable**         | Стан ніколи не мутується, кожна зміна повертає новий об'єкт | Передбачуваність, легке тестування |
| **Pure Core**         | Логіка оновлення — чисті функції без побічних ефектів       | Можливість тестувати ізольовано    |
| **Actions/Selectors** | Розділення логіки запису та читання                         | Чистий API, менше багів            |
| **Middleware**        | Side-effects підключаються через `.use()`                   | Гнучкість без забруднення ядра     |
| **Batching**          | Кілька змін об'єднуються в одне сповіщення                  | Продуктивність, менше ре-рендерів  |

---

## ⚙️ Як працює createState

### Базове використання

```javascript
// @ts-check
import { createState } from "../state/createState.js";

// 1. Визначте початковий стан
const initialState = {
  count: 0,
  user: { name: "", email: "" },
  items: [],
};

// 2. Створіть інстанс стейту
const store = createState(initialState);

// 3. Отримайте стан (immutable snapshot)
console.log(store.get()); // { count: 0, user: {...}, items: [] }

// 4. Оновіть стан
store.updateField("count", 1); // → true (змінено)
store.updateField("count", 1); // → false (не змінилося)

// 5. Підпишіться на зміни
const unsubscribe = store.subscribe((newState) => {
  console.log("State changed:", newState);
});

// 6. Очистіть підписку, коли більше не потрібно
unsubscribe();
```

### Методи API

```javascript
// @ts-check
/** @type {import('../state/createState.js').StateInstance<MyState>} */
const state;

// ===== ЧИТАННЯ =====

state.get()
// → Повертає immutable snapshot поточного стану
// → Кожне викликання створює нову копію (безпека!)

// ===== ЗАПИС =====

state.set(patch: Partial<T>)
// → Оновлює кілька полів одночасно
// → Повертає boolean: чи були реальні зміни?
state.set({ count: 1, user: { name: 'New' } });

state.updateField<K extends keyof T>(key: K, value: T[K])
// → Оновлює одне поле
// → Автоматично порівнює зі старим значенням (shallowEqual)
state.updateField('count', 42);

state.updateNestedField<K extends keyof T>(key: K, patch: Partial<T[K]>)
// → Оновлює вкладений об'єкт (merge, не заміна!)
state.updateNestedField('user', { email: 'test@example.com' });
// → Результат: { ...oldUser, email: 'test@example.com' }

state.reset()
// → Скидає стан до initialState
// → Повертає boolean: чи були зміни?

// ===== БАЧИНГ (оптимізація) =====

state.batch(callback: () => void)
// → Виконує кілька змін без проміжних сповіщень
// → Notify викликається тільки один раз після batch
state.batch(() => {
  state.updateField('a', 1);
  state.updateField('b', 2);
  state.updateField('c', 3);
  // → Лише 1 сповіщення замість 3!
});

// ===== ПІДПИСКА =====

state.subscribe(listener: (state: T) => void)
// → Підписується на зміни стану
// → Повертає функцію unsubscribe для очищення
const unsub = state.subscribe((s) => renderUI(s));
// ...
unsub(); // Важливо: завжди очищуйте підписки!

// ===== MIDDLEWARE =====

state.use(middleware: Middleware<T>)
// → Підключає side-effect логіку
// → Повертає функцію для відключення
const unuse = state.use(createLoggerMiddleware('myState'));
unuse(); // Відключити middleware

// ===== DEBUG (тільки для розробки) =====

state._debug.getCurrentState()
// → Повертає ПОСИЛАННЯ на внутрішній стан (не копію!)
// → Тільки для дебагу, НЕ для продакшн-коду!

state._debug.getListenerCount()
// → Кількість активних підписників

state._debug.getMiddlewareCount()
// → Кількість підключених middleware
```

### Як працює порівняння змін

```javascript
// createState використовує shallowEqual для оптимізації

// ✅ Приклад: зміна не відбудеться, якщо значення однакове
state.updateField("count", 5); // count був 5 → нічого не станеться
state.updateField("count", 6); // count був 5 → оновлення + notify

// ✅ Array/Map порівнюються правильно
const oldArr = [1, 2, 3];
const newArr = [1, 2, 3];
shallowEqual(oldArr, newArr); // → true (однакові значення)

const oldMap = new Map([["a", 1]]);
const newMap = new Map([["a", 1]]);
shallowEqual(oldMap, newMap); // → true

// ⚠️ Об'єкти порівнюються shallow (тільки перший рівень)
const oldObj = { a: 1, b: { c: 2 } };
const newObj = { a: 1, b: { c: 2 } };
shallowEqual(oldObj, newObj); // → false (різні посилання на b!)

// ✅ Рішення: використовуйте updateNestedField для вкладених об'єктів
state.updateNestedField("b", { c: 2 }); // → порівняє вкладені поля
```

---

## ✍️ Actions: логіка змін

### Навіщо потрібні Actions?

| Без Actions                                | З Actions                             |
| ------------------------------------------ | ------------------------------------- |
| `state.updateField('form', { floors: 2 })` | `rackActions.updateFloors(2)`         |
| Логіка розкидана по компонентах            | Логіка централізована в одному місці  |
| Важко тестувати UI-компоненти              | Легко тестувати чисті функції actions |
| Ризик дублювання логіки                    | Єдине джерело правди для змін         |

### Структура actions-файлу

```javascript
// @ts-check
// js/app/pages/racks/state/rackActions.js

/**
 * Фабрика actions для стелажа
 * @param {import('../../../state/createState.js').StateInstance<import('./rackState.js').RackState>} state
 * @param {Object} initialState - для reset
 * @returns {Object}
 */
export const createRackActions = (state, initialState) => {
  // ===== PRIVATE HELPERS (не експортуються) =====

  const _validateBeam = (beam) => {
    return beam?.item && beam?.quantity > 0;
  };

  const _canCalculate = (form) => {
    return (
      form.floors > 0 &&
      form.rows > 0 &&
      form.supports &&
      form.beamsPerRow >= 2 &&
      Array.from(form.beams.values()).some(_validateBeam) &&
      (form.floors === 1 || form.verticalSupports)
    );
  };

  // ===== PUBLIC ACTIONS (експортуються) =====

  return {
    /**
     * Оновити просте поле форми
     * @param {Partial<import('./rackState').RackForm>} patch
     */
    updateForm: (patch) => {
      state.updateNestedField("form", patch);
    },

    /**
     * Додати нову балку
     * @returns {string} id нової балки
     */
    addBeam: () => {
      const form = state.get().form;
      const beams = new Map(form.beams);

      // Генеруємо унікальний id
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      beams.set(id, { item: "", quantity: 1 });

      // Оновлюємо стейт (нове посилання на Map!)
      state.updateField("form", { ...form, beams });

      return id;
    },

    /**
     * Оновити балку за id
     * @param {string} id
     * @param {Partial<{item: string, quantity: number}>} patch
     */
    updateBeam: (id, patch) => {
      const form = state.get().form;
      const beams = new Map(form.beams);

      if (!beams.has(id)) return;

      beams.set(id, { ...beams.get(id), ...patch });
      state.updateField("form", { ...form, beams });
    },

    /**
     * Видалити балку за id
     * @param {string} id
     */
    removeBeam: (id) => {
      const form = state.get().form;
      const beams = new Map(form.beams);

      beams.delete(id);
      state.updateField("form", { ...form, beams });
    },

    /**
     * Перевірити чи можна розраховувати стелаж
     * @returns {boolean}
     */
    canCalculate: () => {
      return _canCalculate(state.get().form);
    },

    /**
     * Скинути форму до початкового стану
     */
    resetForm: () => {
      // Використовуємо cloneValue для безпеки
      state.updateField("form", cloneValue(initialState.form));
      state.updateField("currentRack", null);
    },
  };
};

// Helper для клонування (або імпортуйте з createState)
const cloneValue = (val) => {
  if (val === null || typeof val !== "object") return val;
  if (Array.isArray(val)) return [...val];
  if (val instanceof Map) return new Map(val);
  return { ...val };
};

export default createRackActions;
```

### Правила написання Actions

```javascript
// ✅ ДОБРЕ: чисті дії з чіткими іменами
export const createRackActions = (state) => ({
  updateFloors: (value) => {
    state.updateNestedField("form", { floors: Number(value) });
  },

  addBeam: () => {
    /* ... */
  },

  calculateRack: async (price) => {
    const form = state.get().form;
    const result = await computeRack(form, price);
    state.updateField("currentRack", result);
  },
});

// ❌ ПОГАНО: змішування логіки та побічних ефектів
export const createRackActions = (state) => ({
  // Не робіть так: action не повинен знати про UI
  updateFloorsAndRender: (value) => {
    state.updateNestedField("form", { floors: value });
    document.getElementById("floorsDisplay").textContent = value; // ❌
  },

  // Не робіть так: async логіка без обробки помилок
  calculateRack: async () => {
    const result = await api.calculate(state.get().form); // Може впасти!
    state.updateField("currentRack", result);
  },
});

// ✅ КРАЩЕ: async з обробкою помилок
export const createRackActions = (state) => ({
  calculateRack: async (price) => {
    try {
      const form = state.get().form;
      const result = await computeRack(form, price);
      state.updateField("currentRack", result);
      return { success: true, result };
    } catch (error) {
      console.error("[Actions] Calculation failed:", error);
      return { success: false, error };
    }
  },
});
```

---

## 👁️ Selectors: читання стану

### Навіщо потрібні Selectors?

| Без Selectors                        | З Selectors                        |
| ------------------------------------ | ---------------------------------- |
| `state.get().form.beams`             | `rackSelectors.getBeamsArray()`    |
| UI знає структуру стейту             | UI знає тільки API селекторів      |
| Зміна структури = правки в 10 файлах | Зміна структури = правки в 1 файлі |
| Важко мемоізувати обчислення         | Легко додати memoization пізніше   |

### Структура selectors-файлу

```javascript
// @ts-check
// js/app/pages/racks/state/rackSelectors.js

/**
 * Фабрика селекторів для стелажа
 * @param {import('../../../state/createState.js').StateInstance<import('./rackState.js').RackState>} state
 * @returns {Object}
 */
export const createRackSelectors = (state) => {
  // ===== PURE HELPERS (можна виносити окремо для тестів) =====

  const _getBeamsArray = (beamsMap) => {
    return Array.from(beamsMap.values());
  };

  const _calculateTotalBeams = (beamsMap) => {
    return _getBeamsArray(beamsMap).reduce((sum, b) => sum + (b.quantity || 0), 0);
  };

  const _isFormValid = (form) => {
    return form.floors > 0 && form.rows > 0 && form.supports && form.beamsPerRow >= 2;
  };

  // ===== PUBLIC SELECTORS (експортуються) =====

  return {
    /**
     * Отримати повний стан
     * @returns {import('./rackState').RackState}
     */
    getState: () => state.get(),

    /**
     * Отримати форму
     * @returns {import('./rackState').RackForm}
     */
    getForm: () => state.get().form,

    /**
     * Отримати масив балок (зручніше для рендеру ніж Map)
     * @returns {Array<{id: string, item: string, quantity: number}>}
     */
    getBeams: () => {
      const form = state.get().form;
      return _getBeamsArray(form.beams);
    },

    /**
     * Отримати загальну кількість балок
     * @returns {number}
     */
    getTotalBeamsCount: () => {
      const form = state.get().form;
      return _calculateTotalBeams(form.beams);
    },

    /**
     * Отримати поточний розрахований стелаж
     * @returns {Object|null}
     */
    getCurrentRack: () => state.get().currentRack,

    /**
     * Перевірити валідність форми
     * @returns {boolean}
     */
    isFormValid: () => {
      return _isFormValid(state.get().form);
    },

    /**
     * Перевірити чи є хоч одна заповнена балка
     * @returns {boolean}
     */
    hasValidBeam: () => {
      const beams = _getBeamsArray(state.get().form.beams);
      return beams.some((b) => b.item && b.quantity > 0);
    },

    /**
     * Отримати помилки валідації (для UI)
     * @returns {string[]}
     */
    getValidationErrors: () => {
      const form = state.get().form;
      const errors = [];

      if (form.floors < 1) errors.push("Кількість поверхів має бути ≥ 1");
      if (form.rows < 1) errors.push("Кількість рядів має бути ≥ 1");
      if (!form.supports) errors.push("Оберіть тип опори");
      if (form.beamsPerRow < 2) errors.push("Балок в ряду має бути ≥ 2");
      if (!_getBeamsArray(form.beams).some((b) => b.item && b.quantity > 0)) {
        errors.push("Додайте хоча б одну балку");
      }
      if (form.floors > 1 && !form.verticalSupports) {
        errors.push("Оберіть вертикальну опору");
      }

      return errors;
    },
  };
};

export default createRackSelectors;
```

### Правила написання Selectors

```javascript
// ✅ ДОБРЕ: селектори повертають готові до використання дані
export const createRackSelectors = (state) => ({
  // Конвертує Map → Array для зручного рендеру в UI
  getBeamsArray: () => Array.from(state.get().form.beams.values()),

  // Обчислює похідне значення
  getTotalCost: () => {
    const rack = state.get().currentRack;
    return rack?.totalCost || 0;
  },

  // Повертає масив помилок для відображення
  getErrors: () => {
    const form = state.get().form;
    const errors = [];
    if (!form.supports) errors.push("Оберіть опору");
    return errors;
  },
});

// ❌ ПОГАНО: селектори повертають внутрішні структури
export const createRackSelectors = (state) => ({
  // UI тепер має знати, що beams — це Map
  getBeamsMap: () => state.get().form.beams, // ❌ Tight coupling!

  // Обчислення в UI = дублювання логіки
  // Краще винести в селектор:
  // const total = rackSelectors.getTotalCost();
});

// ✅ КРАЩЕ: мемоізація для дорогих обчислень (опціонально)
export const createRackSelectors = (state) => {
  let lastForm = null;
  let cachedErrors = null;

  return {
    getValidationErrors: () => {
      const form = state.get().form;

      // Перераховуємо тільки якщо форма змінилася
      if (form === lastForm && cachedErrors !== null) {
        return cachedErrors;
      }

      lastForm = form;
      cachedErrors = computeErrors(form); // Дорога функція
      return cachedErrors;
    },
  };
};
```

---

## 🔌 Middleware: side-effects

### Навіщо потрібні Middleware?

Middleware дозволяють підключати побічні ефекти (логі, persist, analytics) **без зміни коду actions**.

### Вбудовані middleware

```javascript
import { createState, createLoggerMiddleware, createPersistMiddleware } from "../state/createState.js";

const state = createState(initialState);

// 📝 Логування змін (для дебагу)
state.use(createLoggerMiddleware("rack", false));
// Консоль: [State:rack] update: ["form", "currentRack"]

// 💾 Авто-збереження в localStorage
state.use(
  createPersistMiddleware(
    "rack-state",
    (s) => JSON.stringify({ form: s.form }), // Зберігаємо тільки форму
  ),
);

// 🔙 Undo/Redo (експериментально)
const { middleware: undoMiddleware, undo, redo } = createUndoMiddleware(10);
state.use(undoMiddleware);
// undo() / redo() доступні для відкату змін
```

### Створення власного middleware

```javascript
// @ts-check
// js/app/state/middleware.js

/**
 * @template T
 * @typedef {Object} MiddlewareContext
 * @property {T} prevState
 * @property {T} nextState
 * @property {Record<string, {before: any, after: any}>} changes
 * @property {string} actionType
 */

/**
 * @template T
 * @typedef {(ctx: MiddlewareContext<T>) => void | Promise<void>} Middleware
 */

/**
 * Middleware для відправки змін у WebSocket
 * @template T
 * @param {WebSocket} ws
 * @returns {Middleware<T>}
 */
export const createWebSocketMiddleware = (ws) => (ctx) => {
  if (ws.readyState !== WebSocket.OPEN) return;

  const message = {
    type: "STATE_CHANGE",
    action: ctx.actionType,
    changes: ctx.changes,
    timestamp: Date.now(),
  };

  ws.send(JSON.stringify(message));
};

/**
 * Middleware для аналітики
 * @template T
 * @param {Function} track - функція аналітики
 * @param {string[]} eventsToTrack - які actionType відстежувати
 * @returns {Middleware<T>}
 */
export const createAnalyticsMiddleware =
  (track, eventsToTrack = []) =>
  (ctx) => {
    if (eventsToTrack.length && !eventsToTrack.includes(ctx.actionType)) {
      return;
    }

    track("state_change", {
      action: ctx.actionType,
      changedFields: Object.keys(ctx.changes),
    });
  };

// ===== ВИКОРИСТАННЯ =====

const state = createState(initialState);

// Підключаємо middleware
state.use(createWebSocketMiddleware(myWebSocket));
state.use(createAnalyticsMiddleware(analytics.track, ["rack:calculated"]));

// При зміні стейту middleware виконаються автоматично
state.updateField("currentRack", rackData);
// → 1. Оновлення стейту
// → 2. createLoggerMiddleware: лог у консоль
// → 3. createPersistMiddleware: збереження в localStorage
// → 4. createWebSocketMiddleware: відправка на сервер
// → 5. createAnalyticsMiddleware: подія в аналітику
// → 6. notify(): оновлення UI
```

### Порядок виконання middleware

```
state.updateField('key', value)
         │
         ▼
┌─────────────────┐
│ 1. applyPatch   │ ← Pure: обчислення нового стану
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Middleware   │ ← Виконуються ПОСЛІДОВНО в порядку .use()
│    chain:       │
│    • Logger     │
│    • Persist    │
│    • Analytics  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Listeners    │ ← UI отримує оновлений стан
└─────────────────┘
```

> ⚠️ **Важливо**: Middleware виконуються синхронно. Якщо потрібен async — повертайте Promise і обробляйте помилки всередині middleware.

---

## ✨ Best Practices

### 1. Ніколи не мутуйте стан напряму

```javascript
// ❌ Погано: пряма мутація
const form = state.get().form;
form.floors = 5; // Мутація snapshot! Не спрацює notify!

// ✅ Добре: через API стейту
state.updateNestedField("form", { floors: 5 });

// ✅ Або через actions
rackActions.updateFloors(5);
```

### 2. Завжди очищуйте підписки

```javascript
// ❌ Погано: витік пам'яті
activate: () => {
  state.subscribe((s) => render(s));
  // Підписка залишається після деактивації!
},

// ✅ Добре: зберігаємо та очищуємо
let unsubscribe;

activate: () => {
  unsubscribe = state.subscribe((s) => render(s));
},

deactivate: () => {
  unsubscribe?.(); // Очищаємо підписку
},
```

### 3. Використовуйте `batch()` для кількох змін

```javascript
// ❌ Погано: 3 окремих notify()
state.updateField("a", 1);
state.updateField("b", 2);
state.updateField("c", 3);

// ✅ Добре: 1 notify() після всіх змін
state.batch(() => {
  state.updateField("a", 1);
  state.updateField("b", 2);
  state.updateField("c", 3);
});
```

### 4. Експортуйте чисті helpers для тестування

```javascript
// rackSelectors.js
const _calculateTotal = (items) => {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
};

export const createRackSelectors = (state) => ({
  getTotal: () => _calculateTotal(state.get().items),
});

// Експортуємо helper окремо для тестів
export { _calculateTotal as calculateTotalPure };

// tests/selectors.test.js
import { calculateTotalPure } from "../rackSelectors.js";

it("calculates total correctly", () => {
  const items = [
    { price: 10, qty: 2 },
    { price: 5, qty: 3 },
  ];
  expect(calculateTotalPure(items)).toBe(35);
});
```

### 5. Не зберігайте обчислювані дані в стейті

```javascript
// ❌ Погано: дублювання даних
const initialState = {
  items: [],
  total: 0, // Обчислюване значення в стейті!
};

// При зміні items треба не забути оновити total...
actions.addItem = (item) => {
  state.updateField("items", [...state.get().items, item]);
  state.updateField("total", computeTotal(state.get().items)); // ❌ Ризик розсинхронізації
};

// ✅ Добре: обчислюйте в selectors
const initialState = {
  items: [],
  // total немає в стейті!
};

const selectors = {
  getTotal: () => {
    const items = state.get().items;
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },
};

// UI: const total = rackSelectors.getTotal();
// → Завжди актуально, неможливо "забути" оновити
```

### 6. Використовуйте TypeScript-like JSDoc

```javascript
// @ts-check
/**
 * @typedef {Object} RackForm
 * @property {number} floors
 * @property {number} rows
 * @property {string} supports
 * @property {Map<string, {item: string, quantity: number}>} beams
 * @property {number} beamsPerRow
 * @property {string} verticalSupports
 */

/**
 * @typedef {Object} RackState
 * @property {RackForm} form
 * @property {Object|null} currentRack
 * @property {Object|null} price
 */

/**
 * @param {import('../createState').StateInstance<RackState>} state
 * @returns {Object}
 */
export const createRackSelectors = (state) => {
  // VS Code буде підказувати типи!
};
```

---

## 💻 Приклади використання

### Приклад 1: Оновлення форми з UI

```javascript
// js/app/pages/racks/calculator/ui/formHandler.js
// @ts-check

import { rackActions, rackSelectors } from "../state/rackState.js";

export const initFormHandlers = ({ addListener, refs }) => {
  const handleInput = (e) => {
    const { id, value, type } = e.target;

    // Конвертація типів
    const parsed = type === "number" ? Number(value) : value;

    // Оновлюємо через action
    rackActions.updateForm({ [id]: parsed });
  };

  const handleBeamChange = (beamId, field, value) => {
    rackActions.updateBeam(beamId, { [field]: value });
  };

  // Реєстрація слухачів
  addListener(refs.form, "input", handleInput);

  // Для динамічних елементів використовуємо делегування
  addListener(refs.beamsContainer, "change", (e) => {
    const row = e.target.closest("[data-beam-id]");
    if (!row) return;

    const beamId = row.dataset.beamId;
    const field = e.target.name;
    const value = e.target.value;

    handleBeamChange(beamId, field, value);
  });
};
```

### Приклад 2: Реактивний рендер UI

```javascript
// js/app/pages/racks/calculator/ui/render.js
// @ts-check

import { rackSelectors } from "../state/rackState.js";

export const renderRackName = () => {
  const nameEl = document.querySelector('[data-js="rackName"]');
  if (!nameEl) return;

  // Читаємо через selector
  const rack = rackSelectors.getCurrentRack();
  nameEl.textContent = rack?.abbreviation || "---";

  // Оновлюємо стан кнопки
  const btn = document.querySelector('[data-js="rack-addToSetBtn"]');
  if (btn) {
    const canAdd = rack && rackSelectors.isFormValid();
    btn.disabled = !canAdd;
    btn.dataset.state = canAdd ? "ready" : "disabled";
  }
};

// Підписка на зміни
export const subscribeToRackUpdates = (callback) => {
  return rackSelectors.getState().subscribe((state) => {
    // Перевіряємо, чи змінилося те, що нас цікавить
    if (state.currentRack || state.form) {
      callback(state);
    }
  });
};
```

### Приклад 3: Async action з обробкою помилок

```javascript
// js/app/pages/racks/state/rackActions.js
export const createRackActions = (state) => ({
  calculateRack: async (price) => {
    const form = state.get().form;

    // Валідація перед розрахунком
    if (!rackSelectors.isFormValid()) {
      return { success: false, error: "Form invalid" };
    }

    try {
      // Імітуємо async розрахунок
      const result = await computeRack(form, price);

      // Оновлюємо стейт з результатом
      state.updateField("currentRack", result);

      return { success: true, result };
    } catch (error) {
      console.error("[Actions] Calculation failed:", error);

      // Очищаємо попередній результат при помилці
      state.updateField("currentRack", null);

      return { success: false, error: error.message };
    }
  },
});

// Використання в UI
const handleCalculate = async () => {
  // Показуємо лоадер
  setUIState("loading");

  const result = await rackActions.calculateRack(priceData);

  if (result.success) {
    setUIState("success");
    renderResults(result.result);
  } else {
    setUIState("error");
    showErrorMessage(result.error);
  }
};
```

---

## 🐛 Troubleshooting

### ❌ UI не оновлюється після змін стейту

**Симптоми:** `state.updateField()` повертає `true`, але компонент не перерендерюється.

**Перевірте:**

```javascript
// 1. Чи підписаний компонент на зміни?
const unsub = state.subscribe(render);
// Чи не викликано unsub() завчасно?

// 2. Чи змінюється значення реально?
const changed = state.updateField("count", 5);
console.log("Changed:", changed); // false = значення не змінилося

// 3. Чи не мутуєте стан напряму?
const form = state.get().form;
form.floors = 3; // ❌ Це не спрацює!
// Правильно:
state.updateNestedField("form", { floors: 3 });

// 4. Чи працює shallowEqual для ваших даних?
// Для вкладених об'єктів використовуйте updateNestedField
```

### ❌ Витік пам'яті (слухачі не видаляються)

**Симптоми:** Після кількох переходів між сторінками події спрацьовують кілька разів.

**Перевірте:**

```javascript
// 1. Чи є cleanup у deactivate?
let unsubscribe;
activate: () => { unsubscribe = state.subscribe(render); },
deactivate: () => { unsubscribe?.(); }, // ✅

// 2. Чи не створюєте ви нові підписки при кожному render?
// ❌ Погано:
const render = () => {
  state.subscribe(updateUI); // Нова підписка при кожному рендері!
};

// ✅ Добре:
const unsub = state.subscribe(updateUI); // Одна підписка при монтажі
// ...
unsub(); // Очищення при демонтажі

// 3. Використовуйте state._debug.getListenerCount() для дебагу
console.log('Active listeners:', state._debug.getListenerCount());
```

### ❌ Middleware не виконується

**Симптоми:** Підключили `createLoggerMiddleware`, але логів немає.

**Перевірте:**

```javascript
// 1. Чи підключено middleware ДО змін?
state.use(createLoggerMiddleware("test"));
state.updateField("a", 1); // ✅ Лог з'явиться

state.updateField("a", 1);
state.use(createLoggerMiddleware("test")); // ❌ Запізно!

// 2. Чи не повертає middleware помилку?
// Middleware має обробляти помилки самостійно
export const createSafeMiddleware = () => (ctx) => {
  try {
    // ваша логіка
  } catch (e) {
    console.error("[Middleware] Error:", e);
    // Не кидаємо помилку, щоб не зламати chain
  }
};

// 3. Перевірте кількість middleware
console.log("Middleware count:", state._debug.getMiddlewareCount());
```

### ❌ Batch не працює як очікується

**Симптоми:** `state.batch()` викликається, але notify все одно кілька разів.

**Перевірте:**

```javascript
// 1. Чи не викликаєте ви batch всередині batch?
state.batch(() => {
  state.batch(() => {
    // ❌ Вкладений batch не створює нову чергу
    state.updateField("a", 1);
  });
});
// → Працює, але вкладений batch просто виконує callback

// 2. Чи не викликаєте ви notify напряму?
// batch контролює тільки notify(), викликані через updateField/set
// Якщо ви викликаєте notify() вручну — він виконається негайно

// 3. Перевірте, що зміни дійсно відбуваються
state.batch(() => {
  const c1 = state.updateField("a", 1); // true
  const c2 = state.updateField("a", 1); // false (не змінилося)
  console.log(c1, c2);
});
// → notify() викличеться, бо була хоч одна реальна зміна
```

---

## 🧪 Тестування

### Тестування createState utils

```javascript
// @ts-check
// tests/state/createState.test.js

import { describe, it, expect, vi } from "vitest";
import { createState, cloneValue, shallowEqual, applyPatch } from "../../app/state/createState.js";

describe("cloneValue", () => {
  it("clones primitives by value", () => {
    expect(cloneValue(42)).toBe(42);
    expect(cloneValue("test")).toBe("test");
  });

  it("clones arrays deeply", () => {
    const original = [1, { a: 2 }];
    const cloned = cloneValue(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[1]).not.toBe(original[1]);
  });

  it("clones Maps correctly", () => {
    const original = new Map([["key", { val: 1 }]]);
    const cloned = cloneValue(original);

    expect(cloned).toBeInstanceOf(Map);
    expect(cloned.get("key")).toEqual({ val: 1 });
    expect(cloned.get("key")).not.toBe(original.get("key"));
  });
});

describe("shallowEqual", () => {
  it("compares primitives", () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual(1, 2)).toBe(false);
  });

  it("compares arrays by values", () => {
    expect(shallowEqual([1, 2], [1, 2])).toBe(true);
    expect(shallowEqual([1, 2], [2, 1])).toBe(false);
  });

  it("compares Maps by entries", () => {
    const a = new Map([["x", 1]]);
    const b = new Map([["x", 1]]);
    expect(shallowEqual(a, b)).toBe(true);
  });
});

describe("applyPatch", () => {
  it("returns unchanged if no differences", () => {
    const state = { a: 1, b: 2 };
    const result = applyPatch(state, { a: 1 });

    expect(result.changed).toBe(false);
    expect(result.newState).toBe(state); // same reference
  });

  it("returns new state with changes", () => {
    const state = { a: 1, b: 2 };
    const result = applyPatch(state, { b: 3 });

    expect(result.changed).toBe(true);
    expect(result.newState).toEqual({ a: 1, b: 3 });
    expect(result.newState).not.toBe(state);
  });
});
```

### Тестування Actions/Selectors

```javascript
// @ts-check
// tests/pages/rackActions.test.js

import { describe, it, expect, vi } from "vitest";
import { createState } from "../../app/state/createState.js";
import { createRackActions } from "../../app/pages/racks/state/rackActions.js";
import { createRackSelectors } from "../../app/pages/racks/state/rackSelectors.js";

describe("rackActions", () => {
  const initialState = {
    form: {
      floors: 1,
      beams: new Map(),
      // ... інші поля
    },
    currentRack: null,
  };

  it("addBeam creates new beam with unique id", () => {
    const state = createState(initialState);
    const actions = createRackActions(state, initialState);

    const id1 = actions.addBeam();
    const id2 = actions.addBeam();

    expect(id1).not.toBe(id2); // Унікальні id
    expect(state.get().form.beams.size).toBe(2);
  });

  it("updateBeam modifies existing beam", () => {
    const state = createState(initialState);
    const actions = createRackActions(state, initialState);

    const id = actions.addBeam();
    actions.updateBeam(id, { item: "750", quantity: 2 });

    const beams = state.get().form.beams;
    expect(beams.get(id)).toEqual({ item: "750", quantity: 2 });
  });

  it("canCalculate returns false for invalid form", () => {
    const state = createState(initialState);
    const actions = createRackActions(state, initialState);

    expect(actions.canCalculate()).toBe(false); // Порожня форма
  });
});

describe("rackSelectors", () => {
  it("getBeams converts Map to array", () => {
    const state = createState({
      form: { beams: new Map([["a", { item: "X" }]]) },
    });
    const selectors = createRackSelectors(state);

    const beams = selectors.getBeams();
    expect(Array.isArray(beams)).toBe(true);
    expect(beams[0].item).toBe("X");
  });

  it("getValidationErrors returns array of strings", () => {
    const state = createState({
      form: { floors: 0, rows: 1, supports: "", beamsPerRow: 2, beams: new Map() },
    });
    const selectors = createRackSelectors(state);

    const errors = selectors.getValidationErrors();
    expect(Array.isArray(errors)).toBe(true);
    expect(errors.some((e) => e.includes("поверхів"))).toBe(true);
  });
});
```

### Мокування стейту в тестах компонентів

```javascript
// @ts-check
// tests/ui/rackForm.test.js

import { describe, it, expect, vi } from "vitest";
import { initFormHandlers } from "../../app/pages/racks/calculator/ui/formHandler.js";

describe("initFormHandlers", () => {
  it("calls updateForm on input change", () => {
    // Мокаємо actions
    const mockActions = {
      updateForm: vi.fn(),
    };

    // Мокаємо DOM
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.id = "floors";
    input.type = "number";
    input.value = "3";
    form.appendChild(input);

    // Мокаємо addListener
    const listeners = new Map();
    const addListener = (el, event, handler) => {
      listeners.set(`${event}:${el.tagName}`, handler);
    };

    // Ініціалізуємо
    initFormHandlers({
      addListener,
      refs: { form, beamsContainer: document.createElement("div") },
      actions: mockActions,
    });

    // Симулюємо подію
    const handler = listeners.get("input:FORM");
    handler({ target: input });

    // Перевіряємо виклик
    expect(mockActions.updateForm).toHaveBeenCalledWith({ floors: 3 });
  });
});
```

---

## 📚 Додаткові ресурси

| Тема                   | Де шукати                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| **Immutable patterns** | `js/app/state/createState.js` → `cloneValue`, `applyPatch`                                  |
| **Middleware API**     | `js/app/state/createState.js` → `use()`, `Middleware<T>` typedef                            |
| **Testing utils**      | `tests/state/`, `tests/pages/`                                                              |
| **TypeScript in JS**   | [JSDoc Cheatsheet](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) |
| **Performance**        | Використовуйте `batch()` та уникайте глибоких порівнянь                                     |

---

## 🚀 Шпаргалка: Швидкий старт нового стейту

```bash
# 1. Створіть js/app/pages/newpage/state/newpageState.js
export const initialNewpageState = {
  data: null,
  loading: false,
  error: null,
};

# 2. Створіть actions: js/app/pages/newpage/state/newpageActions.js
export const createNewpageActions = (state, initial) => ({
  setData: (data) => state.updateField('data', data),
  setLoading: (loading) => state.updateField('loading', loading),
  reset: () => state.reset(),
});

# 3. Створіть selectors: js/app/pages/newpage/state/newpageSelectors.js
export const createNewpageSelectors = (state) => ({
  getData: () => state.get().data,
  isLoading: () => state.get().loading,
  getError: () => state.get().error,
});

# 4. Зберіть експорт: js/app/pages/newpage/state/index.js
import { createState } from '../../../../state/createState.js';
import { initialNewpageState } from './newpageState.js';
import { createNewpageActions } from './newpageActions.js';
import { createNewpageSelectors } from './newpageSelectors.js';

export const newpageState = createState(initialNewpageState);
export const newpageActions = createNewpageActions(newpageState, initialNewpageState);
export const newpageSelectors = createNewpageSelectors(newpageState);

# 5. Використовуйте в компоненті
import { newpageActions, newpageSelectors } from './state/index.js';

// Читання: const data = newpageSelectors.getData();
// Запис: newpageActions.setData(newData);

# 6. Готово! 🎉
```

---

> 💡 **Порада**: Якщо стейт стає занадто складним — розділіть його на кілька незалежних інстансів `createState`. Наприклад, окремо `formState` та `resultsState`. Це спростить тестування та уникне зайвих ре-рендерів.

Успіхів у керуванні станом! 🧠✨
