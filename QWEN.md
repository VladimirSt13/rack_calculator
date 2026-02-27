# Rack Calculator — Контекст проєкту (Оновлено: лютий 2026)

## 📋 Огляд проєкту

**Rack Calculator** — це калькулятор стелажів та підбору акумуляторів для компанії "Акку-енерго". Додаток дозволяє:

1. **Розрахунок стелажа** — конфігурація параметрів стелажа (поверхи, ряди, опори, прольоти) з автоматичним розрахунком компонентів та вартості
2. **Підбір стелажа для батареї** — пошук підходящих варіантів стелажів за розмірами та вагою акумулятора

### Технології

| Категорія | Технологія | Версія |
|-----------|------------|--------|
| **Фреймворк** | Vanilla JS (ES Modules) | - |
| **Збірник** | Vite | 5.x |
| **Тестування** | Vitest + Testing Library | 1.x |
| **Лінтинг** | ESLint + Prettier | 8.x / 3.x |
| **Стилі** | CSS (Custom Properties, shadcn/ui) | - |
| **Мова** | Українська | - |
| **Node.js** | - | >=18.0.0 |

### Архітектура

```
rack_calculator/
├── js/
│   ├── app/
│   │   ├── config/          # Конфігурація та селектори
│   │   │   ├── app.config.js
│   │   │   ├── selectors.js
│   │   │   └── env.js
│   │   ├── core/            # Ядрові модулі
│   │   │   ├── createState.js
│   │   │   ├── FeatureContext.js
│   │   │   ├── PageContext.js
│   │   │   ├── EffectRegistry.js
│   │   │   └── InteractiveElement.js
│   │   ├── effects/         # DOM ефекти
│   │   │   ├── dom.js
│   │   │   └── events.js
│   │   ├── pages/           # Сторінки (rack, battery)
│   │   │   ├── racks/
│   │   │   │   ├── core/    # Бізнес-логіка
│   │   │   │   │   ├── calculator.js
│   │   │   │   │   ├── initRackPage.js
│   │   │   │   │   └── rackPageState.js
│   │   │   │   ├── features/# Фічі
│   │   │   │   │   ├── form/
│   │   │   │   │   ├── spans/
│   │   │   │   │   ├── results/
│   │   │   │   │   └── set/
│   │   │   │   ├── effects/ # Рендеринг
│   │   │   │   │   ├── renderResults.js
│   │   │   │   │   └── renderSetTable.js
│   │   │   │   └── page.js
│   │   │   └── battery/
│   │   │       └── page.js
│   │   ├── ui/              # UI компоненти
│   │   │   ├── router.js
│   │   │   ├── createPageModule.js
│   │   │   └── createPageModule.js
│   │   └── utils/           # Утиліти
│   │       ├── compose.js
│   │       ├── curry.js
│   │       ├── useRenderGuard.js
│   │       └── virtualizeList.js
│   └── main.js              # Точка входу
├── styles/
│   ├── styles.css           # Головний CSS (layers)
│   ├── normalize.css
│   ├── global.css           # shadcn/ui токени
│   ├── rackPage.css
│   ├── batteryPage.css
│   └── debugPanel.css
├── tests/
├── index.html
├── price.json
├── package.json
└── vite.config.js
```

---

## 🏗️ Архітектурні принципи

### 1. Feature-based архітектура

Кожна сторінка розбита на незалежні фічі (features):

```
racks/
├── form/      # Форма введення параметрів (context, state, initForm)
├── spans/     # Динамічне управління прольотами (context, state, domUtils, renderer)
├── results/   # Відображення результатів (context, state, initResults)
└── set/       # Комплект стелажів (context, state, initSetModal, renderSetTable)
```

### 2. Immutable State Management

Використовується власна система стану з `createState.js`:

```javascript
import { createState } from './core/createState.js';

const state = createState({ form: { floors: 1, rows: 1 } });

// Оновлення через patch
state.updateField('form', { floors: 2 });

// Підписка на зміни
state.subscribe((newState) => { /* ... */ });

// Batch оновлення
state.batch(() => {
  state.updateField('floors', 2);
  state.updateField('rows', 3);
});
```

**Middleware:**
- `createLoggerMiddleware(label, verbose)` — логування змін
- `createPersistMiddleware(storageKey)` — збереження в localStorage
- `createUndoMiddleware(maxHistory)` — undo/redo функціонал

### 3. Feature Context Pattern

Кожна фіча інкапсулює стан + дії + селектори:

```javascript
import { createFeatureContext } from './core/FeatureContext.js';

const formContext = createFeatureContext({
  name: 'form',
  initialState: { form: initialFormState },
  createActions: (state) => ({
    updateField: (field, value) => state.updateNestedField('form', { [field]: value }),
  }),
  createSelectors: (state) => ({
    getForm: () => state.get().form,
    getField: (field) => state.get().form[field],
  }),
});
```

### 4. Page Context Orchestrator

`PageContext` координує взаємодію між фічами:

```javascript
const page = createPageContext({
  features: { form, spans, results, rackSet },
  calculator: (data) => calculateRack(data),
  renderResult: (featureName, result) => { /* рендер */ },
  needsRecalculation: ({ feature }) => ['form', 'spans'].includes(feature),
  recalculationDelay: 0, // debounce для розрахунку
});

page.init(); // Запуск оркестрації
```

### 5. Pure Functions для бізнес-логіки

`calculator.js` — pure функція без побічних ефектів:

```javascript
// Pure function: розрахунок стелажа
export const calculateRack = (data) => {
  const { form, spans, price } = data;
  // ... обчислення
  return { name, tableHtml, total, components };
};
```

### 6. Router з lifecycle hooks

Hash-роутер з підтримкою ініціалізації та активації:

```javascript
// router.js
const router = createRouter({
  routes: { rack, battery },
  defaultRoute: 'rack',
  effects: createRouterEffects(SELECTORS),
});

// Page module
export const rackPage = createPageModule({
  id: 'rack',
  lifecycle: {
    onInit: async () => { /* ініціалізація */ },
    onActivate: (deps) => { /* активація */ },
    onDeactivate: (deps) => { /* деактивація */ },
  },
});
```

---

## 🛠️ Команди розробки

```bash
# Розробка (dev server з HMR)
npm run dev

# Збірка для продакшену
npm run build

# Перегляд збірки
npm run preview

# Запуск тестів
npm test

# Тести з UI
npm run test:ui

# Покрытие тестами
npm run test:coverage

# Лінтинг
npm run lint
npm run lint:fix

# Форматування
npm run format
npm run format:check

# Повна валідація (lint + format + test)
npm run validate

# Візуалізація бандлу
npm run analyze

# Очищення
npm run clean
```

---

## 🎨 CSS Архітектура (shadcn/ui)

### CSS Layers

```css
@layer normalize, global, rack-page, battery-page, debug;
```

### Токени (global.css)

```css
:root {
  /* Typography */
  --font-size-base: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --font-family-sans: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Colors (HSL) */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  /* Spacing */
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  
  /* Transitions */
  --transition-fast: 100ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Компоненти

| Компонент | Класи | Опис |
|-----------|-------|------|
| **Card** | `.card`, `.card--highlight`, `.card--dashed` | Контейнер з border/shadow |
| **Form** | `.form__field`, `.form__input`, `.form__select` | Поля вводу |
| **Button** | `.btn--primary`, `.btn--outline`, `.btn--icon` | Кнопки |
| **Table** | `.table`, `.rack__set-table` | Таблиці даних |

### Анімації

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 📐 Конвенції розробки

### Іменування

| Тип | Конвенція | Приклад |
|-----|-----------|---------|
| Файли | `kebab-case.js` | `create-state.js`, `page.js` |
| Класи | `PascalCase` | `FeatureContext`, `PageContext` |
| Функції | `camelCase` | `createRouter`, `calculateRack` |
| Константи | `UPPER_SNAKE_CASE` | `APP_CONFIG`, `SELECTORS` |
| Селектори | `data-js="name"` | `data-js="rackForm"` |

### Селектори (selectors.js)

```javascript
// Глобальні
export const GLOBAL_SELECTORS = {
  siteNav: '.header__nav',
  navLink: '[data-view]',
  app: '#app',
};

// Rack page
export const RACK_SELECTORS = {
  page: '[data-js="page-rack"]',
  form: {
    root: '[data-js="rackForm"]',
    floors: '[data-js="rack-floors"]',
  },
  spans: {
    container: '[data-js="rack-spansContainer"]',
    addBtn: '[data-js="rack-addSpan"]',
  },
  results: {
    name: '[data-js="rackName"]',
    totalPrice: '[data-js="rack-totalPrice"]',
  },
};

// Battery page
export const BATTERY_SELECTORS = {
  page: '[data-js="page-battery"]',
  form: {
    root: '[data-js="batteryForm"]',
    length: '[data-js="battery-length"]',
  },
};
```

### Структура файлів

```javascript
// @ts-check
// Шлях до файлу

/** JSDoc для типів */
import { dependance } from './module.js';

// Константи
const CONSTANT = value;

// Pure helpers
const helper = () => {};

// Side effects
const effect = () => {};

// Factory
export const createFactory = () => {};

// Default export
export default createFactory;
```

### HTML Структура

```html
<!-- Header -->
<header class="header">
  <div class="header__container">
    <div class="header__brand">...</div>
    <nav class="header__nav" aria-label="Головна навігація">
      <ul class="nav">
        <li>
          <a href="#view-rack" class="nav__link nav__link--active" data-view="rack">
            Стелаж
          </a>
        </li>
      </ul>
    </nav>
  </div>
</header>

<!-- Page -->
<section class="page" data-js="page-rack" data-page="rack" hidden>
  <div class="page__header">
    <h2 class="page__title">Розрахунок стелажа</h2>
  </div>
  <div class="page__content page__content--two-cols">
    <aside class="sidebar">...</aside>
    <div class="content">...</div>
  </div>
</section>

<!-- Modal -->
<dialog class="modal" data-js="modal-rackSet" data-modal="rackSet">
  <div class="modal__dialog">
    <header class="modal__header">
      <h3 class="modal__title">Заголовок</h3>
      <button class="modal__close" data-js="modal-close">&times;</button>
    </header>
    <div class="modal__body">...</div>
    <footer class="modal__footer">
      <button class="btn btn--outline" data-js="modal-close">Закрити</button>
    </footer>
  </div>
</dialog>
```

### Price.json Структура

```json
{
  "supports": {
    "215": {
      "name": "PGL1 (215mm)",
      "edge": { "price": 600.0, "weight": 2.0 },
      "intermediate": { "price": 620.0, "weight": 2.05 }
    }
  },
  "spans": {
    "600": { "name": "600", "price": 500.0, "weight": 1.6 }
  },
  "vertical_supports": {
    "632": { "name": "632", "price": 630.0, "weight": 1.8 }
  },
  "diagonal_brace": {
    "diagonal_brace": { "name": "Diagonal brace", "price": 380.0 }
  },
  "isolator": {
    "isolator": { "name": "Isolator", "price": 69.0 }
  }
}
```

---

## 🧪 Тестування

### Структура тестів

```
tests/
├── setup.js           # Глобальні налаштування (jsdom)
├── app/
│   ├── core/          # Тести ядрових модулів
│   │   ├── createState.test.js
│   │   ├── FeatureContext.test.js
│   │   └── PageContext.test.js
│   ├── features/      # Тести фіч
│   └── ui/            # Тести UI компонентів
│       └── router.test.js
```

### Приклад тесту

```javascript
// tests/app/core/state.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { createState } from '../../../js/app/core/createState.js';

describe('createState', () => {
  let state;

  beforeEach(() => {
    state = createState({ count: 0, items: [] });
  });

  it('should create immutable state', () => {
    const snapshot = state.get();
    snapshot.count = 999; // Мутація не впливає
    expect(state.get().count).toBe(0);
  });

  it('should update field and notify listeners', () => {
    const listener = vi.fn();
    state.subscribe(listener);

    state.updateField('count', 5);

    expect(state.get().count).toBe(5);
    expect(listener).toHaveBeenCalledWith({ count: 5, items: [] });
  });

  it('should batch updates', () => {
    const listener = vi.fn();
    state.subscribe(listener);

    state.batch(() => {
      state.updateField('count', 1);
      state.updateField('count', 2);
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(state.get().count).toBe(2);
  });
});
```

### Вимоги до покриття (vitest.config.js)

```javascript
coverage: {
  threshold: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70,
  },
}
```

### Запуск тестів

```bash
# Один раз
npm test

# У режимі watch
npm test -- --watch

# З покриттям
npm run test:coverage

# З UI
npm run test:ui
```

---

## 🔄 Потік даних

### Розрахунок стелажа

```
1. Користувач змінює форму (floors: 1 → 2)
   ↓
2. form.actions.updateField('floors', 2)
   ↓
3. form.state.updateField() → notify підписників
   ↓
4. PageContext.handleFeatureChange('form', newState)
   ↓
5. collectInputData() → { form, spans, price }
   ↓
6. calculateRack(data) → { name, tableHtml, total, components }
   ↓
7. results.actions.setResult(result)
   ↓
8. renderRackResults(result, effects) → оновлення DOM
   - effects.setText('results', 'name', result.name)
   - effects.setHtml('results', 'componentsTable', result.tableHtml)
   - effects.setText('results', 'totalPrice', result.total)
```

### Додавання до комплекту

```
1. Користувач бачить результат → results.state.total = 1234.56
   ↓
2. Натискає "Додати до комплекту" (data-action="addRack")
   ↓
3. set.actions.addRack({ rack: results.state, qty: 1 })
   ↓
4. set.state.updateField('racks', [...racks, newRack])
   ↓
5. renderSetTable(racks) → оновлення таблиці комплекту
   ↓
6. updateSetSummary(total) → оновлення загальної суми
```

### Роутинг між сторінками

```
1. Клік на навігацію: <a data-view="battery">
   ↓
2. Router.navigate('battery')
   ↓
3. composeDeactivate('rack') → rackPage.deactivate()
   ↓
4. composeInit('battery') → batteryPage.init() (якщо ще не ініціалізовано)
   ↓
5. composeActivate('battery') → batteryPage.activate(deps)
   ↓
6. switchView('battery') → show battery page, hide rack page
   ↓
7. updateNavigation('battery') → active link highlight
   ↓
8. history.pushState({}, '', '#view-battery')
```

### Ініціалізація RackPage

```javascript
// onActivate:
// 1. Створення feature contexts
const form = createRackFormContext();
const spans = createSpansContext();
const results = createRackResultsContext();
const rackSet = createRackSetContext();

// 2. Effect Registry
const effects = createEffectRegistry(RACK_SELECTORS);

// 3. Initialize features
initForm({ formContext: form, supportsOptions, verticalSupportsOptions });
renderAllSpans(spansContainer, spans.selectors.getSpans(), spanOptions);
subscribeSpansDOM({ spansContainer, spansContext: spans, spanOptions });
initResults({ resultsContext: results, addToSetBtn, addListener });
initSetModal({ setContext: rackSet, resultsContext: results });

// 4. Interactive Elements (auto-handler)
const autoHandler = createAutoHandler(pageContainer, { form, spans, results, rackSet });

// 5. Page Context (orchestrator)
const page = createPageContext({
  features: { form, spans, results, rackSet },
  calculator: calculateRack,
  renderResult: (featureName, result) => { ... },
});

page.init(); // Підписка на зміни фіч
```

---

## 🎨 UI Конвенції

### Селектори

Використовуємо `data-js` для JS-селекторів:

```html
<!-- HTML -->
<button data-js="rack-addToSetBtn" data-action="addRack">Додати</button>
```

```javascript
// Config
export const SELECTORS = {
  rack: {
    addToSetBtn: "[data-js='rack-addToSetBtn']",
  },
};

// Usage
const btn = document.querySelector(SELECTORS.rack.addToSetBtn);
```

### ARIA-атрибути

```html
<!-- Навігація -->
<a href="#view-rack" class="nav-link" data-view="rack" aria-current="page">Стелаж</a>

<!-- Приховані секції -->
<section data-js="page-rack" hidden aria-hidden="true">...</section>
```

### Модалки

```html
<dialog class="modal" data-js="modal-rackSet" data-modal="rackSet">
  <div class="modal__dialog">
    <header class="modal__header">
      <h3 class="modal__title">Заголовок</h3>
      <button class="modal__close" data-js="modal-close">&times;</button>
    </header>
    <div class="modal__body">...</div>
    <footer class="modal__footer">
      <button class="btn btn--outline" data-js="modal-close">Закрити</button>
    </footer>
  </div>
</dialog>
```

---

## 📁 Ключові файли

| Файл | Призначення |
|------|-------------|
| `js/main.js` | Точка входу, ініціалізація роутера |
| `js/app/ui/router.js` | Hash-роутер з lifecycle hooks |
| `js/app/core/createState.js` | Immutable state management |
| `js/app/core/FeatureContext.js` | Фабрика фіч-контекстів |
| `js/app/core/PageContext.js` | Оркестратор сторінки |
| `js/app/config/app.config.js` | Глобальна конфігурація |
| `js/app/pages/racks/core/calculator.js` | Бізнес-логіка розрахунку |
| `price.json` | Прайс-лист компонентів |

---

## 🔧 Розширення функціоналу

### Додавання нової сторінки

1. **HTML**: Створити секцію з `data-js="page-newpage"` в `index.html`

2. **Селектори**: Додати в `js/app/config/selectors.js`
   ```javascript
   export const NEWPAGE_SELECTORS = {
     page: '[data-js="page-newpage"]',
     form: { root: '[data-js="newpageForm"]' },
   };
   ```

3. **Сторінка**: `js/app/pages/newpage/page.js`
   ```javascript
   import { createPageModule } from '../../ui/createPageModule.js';
   import { PAGES } from '../../config/app.config.js';

   export const newPage = createPageModule({
     id: PAGES.NEWPAGE,
     lifecycle: {
       onInit: async () => { /* ініціалізація */ },
       onActivate: (deps) => { /* активація */ },
       onDeactivate: (deps) => { /* деактивація */ },
     },
   });
   ```

4. **Реєстрація**: Додати в `js/app/pages/index.js`
   ```javascript
   import { newPage } from './newpage/page.js';

   const PAGE_REGISTRY = {
     battery: batteryPage,
     rack: rackPage,
     newpage: newPage, // ← додати тут
   };
   ```

5. **Навігація**: Додати посилання в `index.html`
   ```html
   <a href="#view-newpage" class="nav__link" data-view="newpage">Нова</a>
   ```

### Додавання нової фічі

1. **Структура**:
   ```
   features/newfeature/
   ├── state.js      # initial state
   ├── context.js    # createFeatureContext
   ├── actions.js    # (опціонально) дії
   └── domUtils.js   # (опціонально) DOM утиліти
   ```

2. **Інтеграція**: Додати context у `page.js` до `features` об'єкту
   ```javascript
   const page = createPageContext({
     features: { form, spans, results, rackSet, newfeature },
     // ...
   });
   ```

### Додавання нової ціни

1. **price.json**: Додати новий компонент
   ```json
   {
     "new_component": {
       "name": "New Component",
       "price": 100.0,
       "weight": 1.5
     }
   }
   ```

2. **calculator.js**: Оновити логіку розрахунку
   ```javascript
   const calculateNewComponent = (config, price) => {
     // ...
   };
   ```

3. **generateComponentsTable**: Додати відображення
   ```javascript
   if (components.newComponent) {
     // render table row
   }
   ```

---

## 🐛 Debugging

### Логування

```javascript
import { log } from '../../config/env.js';

log('[ComponentName] Message', data);
```

### Змінні оточення

```bash
# .env
DEBUG=true
DEBUG_LOGGING=true
```

### DevTools

```javascript
// State debug
state._debug.getCurrentState();
state._debug.getListenerCount();

// Router debug
router.getCurrentRoute();
router.getRoutes();
```

### Chrome DevTools

```javascript
// Break on state change
state.subscribe((newState) => {
  debugger; // ← breakpoint
  console.log('State changed:', newState);
});
```

---

## 📚 Ключові файли

| Файл | Призначення | Опис |
|------|-------------|------|
| `js/main.js` | Точка входу | Ініціалізація роутера та сторінок |
| `js/app/ui/router.js` | Hash-роутер | Роутинг з lifecycle hooks |
| `js/app/core/createState.js` | State management | Immutable state з middleware |
| `js/app/core/FeatureContext.js` | Фабрика фіч | Інкапсуляція стану + дії |
| `js/app/core/PageContext.js` | Оркестратор | Координація фіч |
| `js/app/config/app.config.js` | Конфігурація | Константи додатку |
| `js/app/config/selectors.js` | Селектори | CSS селектори для DOM |
| `js/app/pages/racks/core/calculator.js` | Бізнес-логіка | Pure function розрахунку |
| `js/app/pages/racks/page.js` | Rack сторінка | Ініціалізація фіч |
| `js/app/ui/icons/` | **SVG іконки** | Бібліотека іконок для переиспользования |
| `js/app/ui/initIcons.js` | Ініціалізація іконок | Заміна SVG в HTML на JS іконки |
| `price.json` | Прайс-лист | Ціни компонентів |

---

## 🎨 Іконки (SVG Library)

### Структура

```
js/app/ui/icons/
├── index.js              # Централізований експорт
├── icon-grid.js          # Grid (4 квадрати)
├── icon-battery.js       # Battery (акумулятор)
├── icon-plus.js          # Plus (+)
├── icon-minus.js         # Minus (-)
├── icon-trash.js         # Trash (кошик)
├── icon-x.js             # X (хрестик)
├── icon-chevron-up.js    # Chevron Up (стрілка вгору)
├── icon-chevron-down.js  # Chevron Down (стрілка вниз)
├── icon-file.js          # File (файл)
├── icon-shield.js        # Shield (щит)
└── index.js              # Експорт всіх іконок
```

### Використання

```javascript
// Імпорт окремої іконки
import { iconPlus, iconTrash } from '../../ui/icons/index.js';

// Використання в template
const html = `
  <button>${iconPlus({ size: 16 })} Додати</button>
  <button>${iconTrash({ size: 14, className: 'custom-class' })}</button>
`;

// Всі доступні іконки
import {
  iconGrid,
  iconBattery,
  iconPlus,
  iconMinus,
  iconTrash,
  iconX,
  iconChevronUp,
  iconChevronDown,
  iconChevronRight,
  iconCheck,
  iconAlertCircle,
  iconFile,
  iconShield,
  iconSettings,
  iconDownload,
} from '../../ui/icons/index.js';
```

### Ініціалізація в HTML

HTML іконки ініціалізуються через `data-icon` атрибут:

```html
<!-- Кнопка з іконкою Plus -->
<button data-js="rack-addSpan">
  <svg data-icon="plus" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
  </svg>
</button>
```

```javascript
// main.js - ініціалізація після завантаження
import { initAllIcons } from './app/ui/initIcons.js';

const initApp = async () => {
  initAllIcons(); // Заміна SVG на JS іконки
  // ... інша ініціалізація
};
```

### Додавання нової іконки

1. **Створити файл** `js/app/ui/icons/icon-name.js`:
   ```javascript
   // js/app/ui/icons/icon-name.js

   export const iconName = ({ size = 16, className = '' } = {}) => `
     <svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
       <path d="..." stroke="currentColor" stroke-width="2"/>
     </svg>
   `;

   export default iconName;
   ```

2. **Додати експорт** в `index.js`:
   ```javascript
   import iconName from './icon-name.js';
   export { iconName };

   export default {
     // ...
     iconName,
   };
   ```

3. **Використати** в коді:
   ```javascript
   import { iconName } from '../../ui/icons/index.js';
   const html = `<button>${iconName({ size: 20 })}</button>`;
   ```

---

## ⚡ Шпаргалка

```bash
# Створити нову фічу
mkdir -p js/app/pages/racks/features/newfeature
touch js/app/pages/racks/features/newfeature/{state.js,context.js}

# Запустити dev
npm run dev

# Прогнати тести
npm test

# Перевірити код
npm run validate

# Зібрати продакшен
npm run build

# Перегляд збірки
npm run preview

# Візуалізація бандлу
npm run analyze
```

---

## 📝 Нотатки

- **Мова інтерфейсу**: Українська
- **Кодування**: UTF-8
- **Line endings**: LF (Unix)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes `'`
- **Semicolons**: Required

---

> **Примітка**: Цей проєкт використовує українську мову для інтерфейсу та коментарів. Зберігайте цю конвенцію при додаванні нового коду.
