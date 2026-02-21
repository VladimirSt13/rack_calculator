## 1. Основна ідея

Ми хочемо мати **три паралельні контексти**:

1. **PageContext (сторінка)** – координує все: завантажує прайс, створює дочірні контексти, ініціалізує події.
2. **CalculatorContext (калькулятор)** – локальний state, selectors, actions, DOM refs.
3. **RackSetContext (комплект)** – state, selectors, actions для комплекту.

**Принципи:**

- Кожен контекст ізольований.
- DOM refs і прайс інкапсульовані у відповідному контексті.
- PageContext координує лише **ініціалізацію і передає refs/price один раз**.
- Не треба прокидати refs або state в усі функції вручну.

---

## 2. Структура контекстів

```
PageContext
│
├─ price
├─ calculator: CalculatorContext
│   ├─ state
│   ├─ selectors
│   ├─ actions
│   ├─ refs (DOM)
│   └─ init()/destroy()
│
└─ rackSet: RackSetContext
    ├─ state
    ├─ selectors
    ├─ actions
    └─ init()/destroy()
```

---

## 3. PageContext

```js
// js/pages/racks/context/pageContext.js
import { loadPrice } from "../calculator/state/priceState.js";
import { createRackCalculatorContext } from "../calculator/context/calculatorContext.js";
import { createRackSetContext } from "../set/context/setContext.js";

export const createRackPageContext = () => {
  const ctx = {
    price: null,
    calculator: null,
    rackSet: null,
  };

  ctx.init = async () => {
    ctx.price = await loadPrice(); // завантажуємо прайс
    ctx.calculator = createRackCalculatorContext();
    ctx.rackSet = createRackSetContext();

    // ініціалізація дочірніх контекстів
    ctx.calculator.init(); // тут refs присвоюються всередині калькулятора
    ctx.rackSet.init();
  };

  ctx.destroy = () => {
    ctx.calculator.destroy();
    ctx.rackSet.destroy();
  };

  return ctx;
};
```

---

## 4. CalculatorContext

```js
// js/pages/racks/calculator/context/calculatorContext.js
import { createState } from "../../../../state/createState.js";
import { initialRackState } from "../state/rackState.js";
import { createRackActions } from "../state/rackActions.js";
import { createRackSelectors } from "../state/rackSelectors.js";
import { getRacksCalcRefs } from "../ui/dom.js";
import { render } from "../ui/render.js";

export const createRackCalculatorContext = () => {
  const state = createState({ ...initialRackState });
  const selectors = createRackSelectors(state);
  const actions = createRackActions(state, initialRackState);

  let refs = null;
  let unsubscribe = null;

  const ensureInit = (value, name) => {
    if (!value) throw new Error(`${name} is not initialized`);
    return value;
  };

  const init = () => {
    refs = getRacksCalcRefs(); // присвоюємо DOM refs один раз
    unsubscribe = state.subscribe(() => render({ selectors, refs: ensureInit(refs, "Calculator refs") }));
  };

  const getRefs = () => ensureInit(refs, "Calculator refs");
  const destroy = () => unsubscribe?.();

  return { state, selectors, actions, init, destroy, getRefs };
};
```

**Примітки:**

- `refs` доступні тільки через `getRefs()`.
- `render()` отримує refs та selectors, не потрібно прокидати їх глибоко.
- State/actions/selectors ізольовані від інших модулів.

---

## 5. RackSetContext

```js
// js/pages/racks/set/context/setContext.js
import { createState } from "../../../../state/createState.js";
import { initialRackSetState } from "../state/rackSetState.js";
import { createRackSetActions } from "../state/rackSetActions.js";
import { createRackSetSelectors } from "../state/rackSetSelectors.js";
import { renderRackSet } from "../ui/renderRackSet.js";

export const createRackSetContext = () => {
  const state = createState(initialRackSetState);
  const selectors = createRackSetSelectors(state);
  const actions = createRackSetActions(state, initialRackSetState);

  let unsubscribe = null;

  const init = () => {
    unsubscribe = state.subscribe(() => renderRackSet(selectors));
  };

  const destroy = () => unsubscribe?.();

  return { state, selectors, actions, init, destroy };
};
```

**Примітки:**

- `RackSetContext` не використовує refs калькулятора.
- Всі зміни рендеряться через власний `renderRackSet()`.

---

## 6. Використання в PageModule

```js
// js/pages/racks/page.js
import { createPageModule } from "../../ui/createPageModule.js";
import { createRackPageContext } from "./context/pageContext.js";
import { initFormEvents } from "./calculator/events/formEvents.js";
import { initRackSetControls } from "./set/events/initRackSetControls.js";
import { PAGES } from "../../config/app.config.js";

const ctx = createRackPageContext();

export const rackPage = createPageModule({
  id: PAGES.RACK,

  init: async () => {
    await ctx.init(); // завантажуємо прайс і ініціалізуємо контексти
  },

  activate: (addListener) => {
    initFormEvents({
      addListener,
      price: ctx.price,
      calculator: ctx.calculator,
      rackSet: ctx.rackSet,
    });

    initRackSetControls(ctx.rackSet);
  },

  deactivate: () => {
    ctx.destroy();
  },
});
```

**Принципи:**

- `PageContext` координує дочірні контексти.
- DOM refs калькулятора ініціалізуються один раз у `CalculatorContext.init()`.
- Функції рендера і розрахунку отримують refs через контекст (`getRefs()`).
- Немає циклічних залежностей між модулями.

---

## 7. Переваги підходу

1. **Чітке розділення відповідальностей:** сторінка – координатор, калькулятор і комплект – ізольовані модулі.
2. **Refs і прайс** не прокидаються по всьому дереву функцій.
3. **Легко тестувати** кожен контекст окремо.
4. Можна **додавати нові дочірні контексти** без зміни старих.
5. Мінімізуємо циклічні імпорти.

Окей, Володимир 🙂 Ось наочна ASCII-схема твоєї сторінки racks із трьома контекстами та особливістю передачі **прайсу** в калькулятор:

```
┌───────────────────────────┐
│      PageContext          │
│  (координатор сторінки)   │
│                           │
│  price ──────────────┐    │
│  calculatorContext   │    │
│  rackSetContext      │    │
└───────────┬──────────┘    │
            │                 │
            │ init()          │
            │                 │
            ▼                 ▼
┌───────────────────────────┐
│  CalculatorContext        │
│  (калькулятор)            │
│                           │
│  state                    │
│  selectors                │
│  actions                  │
│  refs (DOM)               │  ← ініціалізуються тут
│                           │
│  render({ selectors, refs, price })  ← price передається через PageContext
└───────────────────────────┘
            ▲
            │
            │ getRefs()
            │
┌───────────────────────────┐
│  RackSetContext           │
│  (комплект)               │
│                           │
│  state                    │
│  selectors                │
│  actions                  │
│  refs (DOM)               │  ← окремо, не залежить від калькулятора
│                           │
│  renderRackSet(selectors) │
└───────────────────────────┘
```

### Особливість передачі прайсу:

- **Прайс завантажується один раз** у `PageContext` через `loadPrice()`.
- Потім **передається калькулятору**:
  - через `initFormEvents({ price: ctx.price, calculator: ctx.calculator })`
  - або безпосередньо в `calculateComponents()` під час рендеру

- **Немає потреби прокидати прайс через state чи props глибоко** – він зберігається в PageContext і доступний для дочірніх контекстів.

### Підсумок:

- **PageContext** = координатор, тримає глобальні ресурси (прайс, ініціалізація контекстів).
- **CalculatorContext** = ізольований, refs, state, рендер, отримує прайс від PageContext.
- **RackSetContext** = ізольований, refs і state своє, незалежне від калькулятора.

```
          ┌───────────────────────────────┐
          │          rackPage             │
          │       (PageContext)          │
          ├───────────────────────────────┤
          │ init()                        │
          │ ┌───────────────────────────┐ │
          │ │ loadPrice()               │ │
          │ │ ctx.price = loadedPrice   │ │
          │ └───────────────────────────┘ │
          │ ┌───────────────────────────┐ │
          │ │ createRackCalculatorContext │ │
          │ │ createRackSetContext        │ │
          │ └───────────────────────────┘ │
          └─────────────┬─────────────────┘
                        │
                        ▼
          ┌───────────────────────────────┐
          │ activate(addListener)         │
          │ ┌───────────────────────────┐ │
          │ │ calculator.init()         │ │
          │ │ ┌───────────────────────┐ │ │
          │ │ │ refs = getRacksCalcRefs() │ │
          │ │ └───────────────────────┘ │ │
          │ │ state.subscribe(() =>     │ │
          │ │     render({ selectors,  │ │
          │ │              refs, price }) │ │
          │ └───────────────────────────┘ │
          │ ┌───────────────────────────┐ │
          │ │ rackSet.init()            │ │
          │ │ refs = getRackSetRefs()  │ │
          │ │ state.subscribe(() =>    │ │
          │ │     renderRackSet(selectors)) │ │
          │ └───────────────────────────┘ │
          │ ┌───────────────────────────┐ │
          │ │ initFormEvents({          │ │
          │ │   addListener,            │ │
          │ │   price,                  │ │
          │ │   calculator,             │ │
          │ │   rackSet                 │ │
          │ │ })                        │ │
          │ └───────────────────────────┘ │
          └─────────────┬─────────────────┘
                        │
                        ▼
          ┌───────────────────────────────┐
          │ Render / Calculate Components │
          │ ┌───────────────────────────┐ │
          │ │ calculateComponents({     │ │
          │ │   rackConfig: selectors.getState(), │
          │ │   price: ctx.price        │ │
          │ │ })                        │ │
          │ └───────────────────────────┘ │
          │ updateRackName({ refs, html }) │
          │ updateComponentsTable({ refs, html }) │
          └─────────────┬─────────────────┘
                        │
                        ▼
          ┌───────────────────────────────┐
          │ deactivate()                  │
          │ ┌───────────────────────────┐ │
          │ │ calculator.destroy()      │ │
          │ │ rackSet.destroy()         │ │
          │ └───────────────────────────┘ │
          └───────────────────────────────┘
```

### Ключові моменти:

1. **Прайс зберігається в PageContext** (`ctx.price`) і передається в калькулятор на етапі рендеру або initFormEvents.
2. **Refs ініціалізуються всередині кожного контексту** (`calculator.refs`, `rackSet.refs`).
3. **Дочірні модулі не повинні самі знати про PageContext**, достатньо передати прайс або refs при ініціалізації.
4. **Рендер і розрахунок компонентів** відбуваються в CalculatorContext, використовуючи refs і прайс.
