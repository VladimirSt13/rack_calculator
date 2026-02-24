┌─────────────────────────────────────────────────────────────┐ │ page.js
(onInit) │ │ 1. Завантажує прайс з серверу (price.json) │ │ 2. Зберігає в
form.state через form.actions.setPrice() │
└────────────────────┬────────────────────────────────────────┘ │ ▼
┌─────────────────────────────────────────────────────────────┐ │
PageContext.collectInputData() │ │ Збирає дані з ВСІХ фич: │ │ { │ │ form: {
floors: 2, price: {...} }, ← прайс ТУТ │ │ spans: { spans: Map(...), nextId: 1
}, ← тільки дані │ │ results: {...}, │ │ set: {... } │ │ } │
└────────────────────┬────────────────────────────────────────┘ │ ▼
┌─────────────────────────────────────────────────────────────┐ │ calculator.js
(pure function) │ │ Отримує: { form, spans, results, set } │ │ Бере прайс з
form.price │ │ Рахує вартість спанів: spans × price.beams │ │ Повертає: { name,
tableHtml, total, components } │
└─────────────────────────────────────────────────────────────┘

Потік даних

1. Користувач змінює форму ↓
2. PageContext викликає calculator(inputData) ↓
3. calculator.js (pure) → { name, tableHtml, total, components } ↓
4. results.actions.setResult(result) ← зберігаємо В СТЕЙТ ↓
5. UI оновлюється з results.state ↓
6. Користувач натискає "Додати до комплекту" ↓
7. set.actions.addRack({ rack: results.state, qty: 1 }) ← бере зі стейту

🔄 Потік даних для додавання в комплект

1. Користувач бачить результат розрахунку → results.state.total = 1234.56 →
   results.state.name = 'L2A1C-3000/430'
2. Натискає "Додати до комплекту" → set.actions.addRack({ rack: results.state,
   qty: 1 })
3. set.state оновлюється: → racks.push({ id: 'L2A1C-3000/430', rack: {...}, qty:
   1 })
4. UI комплекту оновлюється → Показує новий стелаж в таблиці → Оновлює загальну
   суму
5. Користувач відкриває модалку → set.actions.openModal() →
   set.state.isModalOpen = true → Модалка рендериться з set.state.racks

Потік даних в page.js

1. onInit: → Завантажити price.json → pageState.price = {...} →
   pageState.supportsOptions = ['215', '300', '430'] →
   pageState.verticalSupportsOptions = ['632', '750']
2. onActivate: → Створити feature contexts (form, spans, results, rackSet) →
   Заповнити dropdown-и опціями з pageState → Створити PageContext з
   calculator + renderResult → Створити AutoHandler для data-action елементів →
   Запустити page.init()
3. Користувач змінює форму: → InteractiveElement ловить подію →
   form.actions.updateField('floors', 2) → form.state оновлюється → notify
   підписників
4. PageContext отримує сповіщення: → needsRecalculation('form') → true →
   collectInputData() → { form, spans, price } → calculateRack(data) → { name,
   tableHtml, total, components } → renderResult('form', result) →
   effects.batch([...]) → оновлення DOM
5. Користувач натискає "Додати до комплекту": → InteractiveElement ловить click
   → rackSet.actions.addRack({ rack: results.state, qty: 1 }) → rackSet.state
   оновлюється
6. Деактивація сторінки: → page.destroy() → відписка всіх підписок →
   autoHandler.cleanup() → видалення слухачів подій

# Покроковий план створення сторінки "Стелажі"

## 📁 Підготовка структури файлів

1. Створити `js/app/pages/racks/features/form/state.js`
2. Створити `js/app/pages/racks/features/form/context.js`
3. Створити `js/app/pages/racks/features/spans/state.js`
4. Створити `js/app/pages/racks/features/spans/context.js`
5. Створити `js/app/pages/racks/features/results/state.js`
6. Створити `js/app/pages/racks/features/results/context.js`
7. Створити `js/app/pages/racks/features/set/state.js`
8. Створити `js/app/pages/racks/features/set/context.js`
9. Створити `js/app/pages/racks/core/calculator.js`
10. Оновити `js/app/pages/racks/page.js`

---

## 🧱 Реалізація feature: form

11. Визначити початковий стан форми у `form/state.js`
12. Експортувати `initialFormState`
13. Створити `form/context.js` з `createFeatureContext`
14. Реалізувати actions: `updateField`, `updateFields`, `reset`, `setPrice`
15. Реалізувати selectors: `getForm`, `getField`, `getPrice`, `isValid`,
    `getData`
16. Експортувати `createRackFormContext`

---

## 🧱 Реалізація feature: spans

16. Визначити початковий стан прольотів у `spans/state.js`
17. Експортувати `initialSpansState` з полями `spans` (Map) та `nextId`
18. Створити `spans/context.js` з `createFeatureContext`
19. Реалізувати actions: `addSpan`, `removeSpan`, `updateSpan`, `clear`
20. Реалізувати selectors: `getSpans`, `getSpansArray`, `getSpanById`,
    `getNextId`, `getCount`, `getData`
21. Експортувати `createSpansContext`

---

## 🧱 Реалізація feature: results

22. Визначити початковий стан результатів у `results/state.js`
23. Експортувати `initialResultsState` з полями `name`, `tableHtml`, `total`,
    `components`, `lastCalculated`
24. Створити `results/context.js` з `createFeatureContext`
25. Реалізувати actions: `setResult`, `clear`
26. Реалізувати selectors: `getName`, `getTableHtml`, `getTotal`,
    `getComponents`, `hasResult`, `getData`
27. Експортувати `createRackResultsContext`

---

## 🧱 Реалізація feature: set

28. Визначити початковий стан комплекту у `set/state.js`
29. Експортувати `initialSetState` з полями `racks` (Array) та `isModalOpen`
30. Створити `set/context.js` з `createFeatureContext`
31. Реалізувати actions: `addRack`, `removeRack`, `updateQty`, `clear`,
    `openModal`, `closeModal`
32. Реалізувати selectors: `getRacks`, `getCount`, `getTotalCost`, `isEmpty`,
    `isModalOpen`, `getRackById`, `getData`
33. Експортувати `createRackSetContext`

---

## 🧮 Реалізація calculator

34. Створити `js/app/pages/racks/core/calculator.js`
35. Експортувати pure function `calculateRack`
36. Реалізувати валідацію вхідних даних
37. Реалізувати розрахунок компонентів (опори, прольоти, балки, вертикальні
    стійки, розкоси, ізолятори)
38. Реалізувати генерацію назви стелажа
39. Реалізувати генерацію HTML таблиці компонентів
40. Реалізувати підрахунок загальної вартості
41. Повернути об'єкт результату: `{ name, tableHtml, total, components }`

---

## 🔗 Інтеграція в page.js

42. Імпортувати всі feature contexts: `createRackFormContext`,
    `createSpansContext`, `createRackResultsContext`, `createRackSetContext`
43. Імпортувати `calculateRack`
44. Імпортувати `createEffectRegistry` та `RACK_SELECTORS`
45. Імпортувати `createPageContext`
46. У `onActivate` створити екземпляри всіх feature contexts
47. Створити `effects` через `createEffectRegistry`
48. Створити `page` через `createPageContext` з конфігурацією:
    - `features`: об'єкт з усіма feature contexts
    - `calculator`: функція `calculateRack`
    - `renderResult`: функція рендерингу результатів у DOM через `effects`
    - `needsRecalculation`: функція перевірки, чи потрібен перерахунок
    - `onError`: обробник помилок розрахунку
49. Викликати `page.init()` для запуску оркестрації
50. Повернути cleanup-функцію з викликом `page.destroy()`

---

## 🎨 Налаштування рендерингу

51. У `renderResult` реалізувати оновлення `rackName` через
    `effects.renderToTarget` або `effects.setHTML`
52. Реалізувати оновлення `componentsTable` через `effects.setHTML`
53. Реалізувати оновлення `totalPrice` через `effects.setText`
54. Реалізувати оновлення стану кнопки "Додати до комплекту" через
    `effects.setState` та `effects.setAttr`
55. Додати обробку випадку, коли результат відсутній (показати placeholder)

---

## 🧪 Тестування

56. Запустити dev-сервер
57. Перевірити завантаження сторінки без помилок у консолі
58. Перевірити зміну полів форми → оновлення стану в Debug Panel
59. Перевірити додавання прольоту → поява нового рядка в DOM
60. Перевірити заповнення всіх обов'язкових полів → запуск розрахунку
61. Перевірити відображення результату: назва, таблиця, ціна
62. Перевірити кнопку "Додати до комплекту" → додавання в `rackSet`
63. Перевірити відкриття модалки комплекту → відображення списку
64. Перевірити cleanup при перемиканні сторінок → відсутність витоків пам'яті

---

## 🧹 Фіналізація

65. Видалити тимчасові console.log
66. Перевірити типізацію через `tsc --noEmit --allowJs --checkJs`
67. Перевірити код через ESLint
68. Оновити документацію JSDoc за необхідності
69. Зберегти зміни та закомітити
