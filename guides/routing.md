# Гайд по абстрагованому роутингу SPA

## 1️⃣ Основні принципи

- Кожна сторінка — **модуль**, що має свої методи: `init`, `activate`, `deactivate`, `onStateChange`.
- **Router** керує навігацією між сторінками через `navigate(pageId)`.
- Видимість сторінок контролюється властивістю `hidden` секцій.
- **Lifecycle сторінки:**

```

init() → activate() → події/взаємодія → deactivate()

```

- Listener’и підписуються через **EventManager** для ізоляції та автоматичного очищення.

---

## 2️⃣ Структура модулів сторінки

### Приклад сторінки `battery.js`

```js
import { registerPage } from "../ui/router.js";
import { initBatteryForm } from "./initBatteryForm.js";
import { resetBatteryState } from "../actions/batteryFormAction.js";
import { createEventManager } from "../ui/eventManager.js";

const eventManager = createEventManager();

registerPage({
  id: "battery",
  init: () => {},
  activate: () => {
    initBatteryForm();
    resetBatteryState();

    // Listener через інстанс EventManager
    const btn = document.querySelector("#charge");
    eventManager.addListener(btn, "click", () => console.log("Charge clicked"));
  },
  deactivate: () => {
    eventManager.removeAllListeners();
  },
  onStateChange: (state) => {
    console.log("Battery state updated:", state);
  },
});
```

---

## 3️⃣ Router API

### Реєстрація сторінки

```js
registerPage({
  id: "pageId",
  init: () => {}, // виконується один раз при першому завантаженні
  activate: () => {}, // виконується при переході на сторінку
  deactivate: () => {}, // виконується при виході зі сторінки
  onStateChange: (state) => {}, // опціонально, підписка на зміну state сторінки
});
```

### Навігація між сторінками

```js
import { navigate } from "./router.js";

navigate("battery"); // переходить на сторінку battery
```

- Викликає `deactivate()` поточної сторінки.
- Викликає `activate()` цільової сторінки.
- Показує тільки цю сторінку (`hidden = false`), інші — ховає.

---

## 4️⃣ Управління видимістю сторінок

- HTML сторінки мають секції з `id="view-pageId"` і `hidden` за замовчуванням:

```html
<section id="view-rack" hidden></section>
<section id="view-battery" hidden></section>
```

- Router **додає/знімає** `hidden` при навігації:

```js
sections.forEach((s) => (s.hidden = s.id !== "view-" + pageId));
```

- Гарантує, що **тільки одна сторінка видима**.

---

## 5️⃣ Життєвий цикл сторінки

```
registerPage()      // сторінка зареєстрована
↓
navigate(pageId)
↓
init()              // тільки один раз
activate()          // при переході на сторінку
↓
події/взаємодія    // всі listeners через EventManager
↓
navigate(anotherPage)
↓
deactivate()        // очищення listener’ів, reset state
```

- При повторному переході `init()` **не виконується**.
- Listener’и видаляються через EventManager, lifecycle чистий.

---

## 6️⃣ Кращі практики

1. **Ізоляція сторінок:** кожна має свій EventManager і state.
2. **Чисті функції:** core логіка та render не мають side-effects.
3. **State через проксі:** підписка на зміну state через `onStateChange`.
4. **Видимість сторінок:** керувати через `hidden`, не мутувати DOM напряму.
5. **Розширюваність:** можна додавати нові сторінки без зміни Router або інших сторінок.

---

## 7️⃣ Типова інтеграція з main.js

```js
import { initViewSwitcher } from "./ui/viewSwitcher.js";
import "./racks/racks.js";
import "./battery/battery.js";

document.addEventListener("DOMContentLoaded", () => {
  initViewSwitcher(); // додає навігацію на кнопки і показ дефолтної сторінки
});
```

- Всі сторінки **автоматично зареєстровані** через import.
- `initViewSwitcher` підписує кнопки на `navigate(pageId)`.

```

```

---

Якщо хочеш, я можу зробити **додаткову схему життєвого циклу роутингу і видимості сторінок** у вигляді ASCII або SVG, щоб вставити в MD.

Хочеш, щоб я таку схему зробила?
