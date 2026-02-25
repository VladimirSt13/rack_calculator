# Rack Calculator — Контекст проєкту

## 📋 Огляд проєкту

**Rack Calculator** — це калькулятор стелажів та підбору акумуляторів для компанії "Акку-енерго". Додаток дозволяє:

1. **Розрахунок стелажа** — конфігурація параметрів стелажа (поверхи, ряди, опори, прольоти) з автоматичним розрахунком компонентів та вартості
2. **Підбір стелажа для батареї** — пошук підходящих варіантів стелажів за розмірами та вагою акумулятора

### Технології

| Категорія | Технологія |
|-----------|------------|
| **Фреймворк** | Vanilla JS (ES Modules) |
| **Збірник** | Vite 5.x |
| **Тестування** | Vitest 1.x + Testing Library |
| **Лінтинг** | ESLint 8.x + Prettier 3.x |
| **Стилі** | CSS (Custom Properties) |
| **Мова** | Українська |

### Архітектура

```
rack_calculator/
├── js/
│   ├── app/
│   │   ├── config/          # Конфігурація та селектори
│   │   ├── core/            # Ядрові модулі (State, FeatureContext, PageContext)
│   │   ├── effects/         # DOM ефекти
│   │   ├── pages/           # Сторінки (rack, battery)
│   │   │   ├── racks/
│   │   │   │   ├── core/    # Бізнес-логіка (calculator.js)
│   │   │   │   ├── features/# Фічі (form, spans, results, set)
│   │   │   │   ├── effects/ # Рендеринг
│   │   │   │   └── page.js  # Модуль сторінки
│   │   │   └── battery/     # Аналогічна структура
│   │   ├── ui/              # UI компоненти (router, createPageModule)
│   │   └── utils/           # Утиліти (compose, pipe)
│   └── main.js              # Точка входу
├── styles/                  # CSS стилі
├── tests/                   # Тести
├── index.html               # Головний HTML
├── price.json               # Прайс-лист компонентів
└── package.json
```

---

## 🏗️ Архітектурні принципи

### 1. Feature-based архітектура

Кожна сторінка розбита на незалежні фічі (features):

```
racks/
├── form/      # Форма введення параметрів
├── spans/     # Динамічне управління прольотами
├── results/   # Відображення результатів
└── set/       # Комплект стелажів (додавання/видалення)
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
```

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

## 📐 Конвенції розробки

### Іменування

| Тип | Конвенція | Приклад |
|-----|-----------|---------|
| Файли | `kebab-case.js` | `create-state.js`, `page.js` |
| Класи | `PascalCase` | `FeatureContext`, `PageContext` |
| Функції | `camelCase` | `createRouter`, `calculateRack` |
| Константи | `UPPER_SNAKE_CASE` | `APP_CONFIG`, `SELECTORS` |
| Селектори | `data-js="name"` | `data-js="rackForm"` |

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

### Коментарі

- **JSDoc** для типів та публічного API
- **Логічні блоки** розділені коментарями `// ===== SECTION =====`
- **Без зайвих коментарів** — код має бути зрозумілим сам по собі

### Обробка помилок

```javascript
try {
  const data = await loadPrice();
} catch (error) {
  console.error('[RackPage] Failed to load price:', error);
  pageState.updateField('error', 'Не вдалося завантажити прайс');
}
```

---

## 🧪 Тестування

### Структура тестів

```
tests/
├── setup.js           # Глобальні налаштування
├── app/
│   ├── core/          # Тести ядрових модулів
│   ├── features/      # Тести фіч
│   └── ui/            # Тести UI компонентів
```

### Приклад тесту

```javascript
// tests/app/core/state.test.js
import { describe, it, expect } from 'vitest';
import { createState } from '../../../js/app/core/createState.js';

describe('createState', () => {
  it('should create immutable state', () => {
    const state = createState({ count: 0 });
    const snapshot = state.get();
    
    snapshot.count = 999; // Мутація не впливає
    expect(state.get().count).toBe(0);
  });
});
```

### Вимоги до покриття

```javascript
// vitest.config.js
coverage: {
  threshold: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70,
  },
}
```

---

## 🔄 Потік даних

### Розрахунок стелажа

```
1. Користувач змінює форму
   ↓
2. form.actions.updateField('floors', 2)
   ↓
3. form.state оновлюється → notify підписників
   ↓
4. PageContext отримує сповіщення
   ↓
5. collectInputData() → { form, spans, price }
   ↓
6. calculateRack(data) → { name, tableHtml, total, components }
   ↓
7. results.actions.setResult(result)
   ↓
8. renderRackResults(result, effects) → оновлення DOM
```

### Додавання до комплекту

```
1. Користувач бачить результат → results.state.total = 1234.56
   ↓
2. Натискає "Додати до комплекту"
   ↓
3. set.actions.addRack({ rack: results.state, qty: 1 })
   ↓
4. set.state оновлюється → racks.push(...)
   ↓
5. UI комплекту оновлюється → таблиця + сума
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

1. **HTML**: Створити секцію з `data-js="page-newpage"`
2. **Навігація**: Додати посилання з `data-view="newpage"`
3. **Модуль**: `js/app/pages/newpage/page.js` з lifecycle hooks
4. **Реєстрація**: Додати в `js/app/pages/index.js`

### Додавання нової фічі

1. **Структура**:
   ```
   features/newfeature/
   ├── state.js      # initial state
   ├── context.js    # createFeatureContext
   └── domUtils.js   # DOM утиліти (за потреби)
   ```

2. **Інтеграція**: Додати context у `page.js` до `features` об'єкту

### Додавання нової ціни

1. **price.json**: Додати новий компонент
2. **calculator.js**: Оновити логіку розрахунку
3. **generateComponentsTable**: Додати відображення

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
```

---

## 📚 Додаткові ресурси

| Тема | Файл/Папка |
|------|------------|
| Роутинг | `guides/routing.md` |
| State Management | `guides/state.md` |
| DOM Effects | `guides/dom.md` |
| Events | `guides/events.md` |
| Feature Context | `guides/context.md` |

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
```

---

> **Примітка**: Цей проєкт використовує українську мову для інтерфейсу та коментарів. Зберігайте цю конвенцію при додаванні нового коду.
