я планую доповнити сторінку ракс

<section id="view-rack" class="rack section" hidden>
<h2 class="rack__title">Розрахунок стелажа</h2>

          <div class="rack__content section__content">
            <div class="rack__params">
              <form id="rackForm" class="form rack__form">
                <fieldset class="rack__fieldset">
                  <legend class="rack__legend">Параметри стелажа</legend>

                  <div class="rack__row">
                    <label class="rack__label" for="floors">
                      <span>Кількість поверхів</span><span class="dots"></span>
                      <input type="number" id="floors" min="1" max="10" value="1" required />
                    </label>
                  </div>

                  <div class="rack__row">
                    <label class="rack__label" for="verticalSupports">
                      <span>Вертикальна опора</span><span class="dots"></span>
                      <select id="verticalSupports" required>
                        <option value="" disabled selected>Оберіть вертикальну опору</option>
                      </select>
                    </label>
                  </div>

                  <div class="rack__row">
                    <label class="rack__label" for="supports">
                      <span>Опора</span><span class="dots"></span>
                      <select id="supports" required>
                        <option value="" disabled selected>Оберіть опору</option>
                      </select>
                    </label>
                  </div>

                  <div class="rack__row">
                    <label class="rack__label" for="rows">
                      <span>Кількість рядів</span><span class="dots"></span>
                      <input type="number" id="rows" min="1" max="4" value="1" required />
                    </label>
                  </div>

                  <div class="rack__row">
                    <label class="rack__label" for="beamsPerRow">
                      <span>Кількість балок в ряду</span><span class="dots"></span>
                      <input type="number" id="beamsPerRow" min="2" max="4" value="2" required />
                    </label>
                  </div>

                  <div class="form-row rackForm__form-row rackForm__form-row--beams">
                    <div class="rackForm__label-group">
                      <label>Прольоти</label>
                      <button
                        type="button"
                        id="addBeam"
                        class="icon-btn icon-btn--add"
                        aria-label="Додати проліт"
                        title="Додати проліт"
                      ></button>
                    </div>

                    <div id="beamsContainer" class="rackForm__beamsContainer" data-dynamic="beams"></div>
                  </div>
                </fieldset>
              </form>
            </div>
            <div class="rack__results">
              <div class="rack__card rack__name-card">
                <div class="rack__card-title">Назва стелажа</div>
                <div id="rackName" class="rack__name-value">---</div>
              </div>

              <div class="rack__card rack__components-card">
                <h3 class="rack__card-title">Компоненти стелажа</h3>
                <div id="componentsTable" class="rack__components-table" data-dynamic="components"></div>
                <div id="rackPrice" class="rack__price"></div>
              </div>
            </div>
          </div>
        </section>

// js/pages/rackPage.js
import { createPageModule } from "../ui/createPageModule.js";
import { initialRackState } from "./racks/state/rackState.js";
import { createRackActions } from "./racks/state/rackActions.js";
import { createRackSelectors } from "./racks/state/rackSelectors.js";
import { resetRackForm } from "./racks/ui/forminit.js";
import { initFormEvents } from "./racks/events/formEvents.js";
import { loadPrice } from "./racks/state/priceState.js";
import { populateDropdowns } from "./racks/ui/dropdowns.js";
import { render } from "./racks/render.js";
import { createState } from "../state/createState.js";
import { PAGES } from "../config/app.config.js";

let componentsPrice = null;

// Створюємо state, селектори та actions прямо на сторінці
const rackState = createState({ ...initialRackState });
let unsubscribe = null;
export const rackSelectors = createRackSelectors(rackState);
export const rackActions = createRackActions(rackState, initialRackState);

export const rackPage = createPageModule({
id: PAGES.RACK,

init: async () => {
if (!componentsPrice) {
componentsPrice = await loadPrice();
}
unsubscribe = rackState.subscribe(() => render(rackSelectors));
},

activate: (addListener) => {
// Скидаємо state і форму
rackState.reset();
resetRackForm(rackSelectors);

    // Ініціалізація подій форми
    initFormEvents({ price: componentsPrice, addListener, rackActions });

    // Наповнення dropdown-ів, якщо ціни завантажені
    if (componentsPrice) {
      populateDropdowns(Object.keys(componentsPrice.vertical_supports), Object.keys(componentsPrice.supports));
    }

    // Підписка на зміни state для рендера
    rackState.subscribe(() => render(rackSelectors));

},

deactivate: () => {
// resetForm і видалення лісенерів обробляються в createPageModule
unsubscribe?.();
},
});

// js/pages/racks/render.js
import { calculateComponents } from "./core/calculator.js";
import { generateComponentsTableHTML } from "./ui/templates/componentsTable.js";
import { generateRackNameHTML } from "./ui/templates/rackName.js";
import { updateRackName, updateComponentsTable } from "./ui/rack.js";

/\*\*

- Render сторінки racks на основі поточного state через передані selectors
- @param {Object} rackSelectors - об'єкт селекторів сторінки
  \*/
  export const render = (rackSelectors) => {
  const floors = rackSelectors.getFloors();
  const rows = rackSelectors.getRows();
  const supports = rackSelectors.getSupports();
  const verticalSupports = rackSelectors.getVerticalSupports();
  const beamsArray = rackSelectors.getBeams().map(([, b]) => b); // Map → масив

// Перевірка на повноту даних
const isComplete =
floors &&
(floors === 1 || verticalSupports) &&
rows &&
supports &&
beamsArray.length > 0 &&
beamsArray.every((b) => b.item && b.quantity);

if (!isComplete) {
updateRackName("---");
updateComponentsTable("<p>Недостатньо даних.</p>");
return;
}

// Розрахунок компонентів
const { currentRack } = calculateComponents({
floors,
rows,
supports,
verticalSupports,
beams: beamsArray,
});

const { components, totalCost, description, abbreviation } = currentRack;

updateRackName(generateRackNameHTML({ description, abbreviation }));
updateComponentsTable(
generateComponentsTableHTML({
components,
totalCost,
isolatorsCost: (components.isolators?.amount || 0) \* (components.isolators?.price || 0),
}),
);
};
"js/pages/racks/ui/rack.js";

import { getRacksRefs } from "./dom.js";

const refs = getRacksRefs();

export const updateRackName = (html) => (refs.rackName.innerHTML = html);

export const updateComponentsTable = (html) => (refs.componentsTable.innerHTML = html);

"js/pages/racks/ui/forminit.js";

import { clearBeamsUI } from "./beams.js";
import { getRacksRefs } from "./dom.js";

/\*\*

- Скидання форми racks до початкового стану
- @returns {void}
  \*/
  export const resetRackForm = (rackSelectors) => {
  const refs = getRacksRefs();

// Очищаємо UI для балок
clearBeamsUI();

// Оновлюємо значення input/select відповідно до state через селектори
refs.rackForm.querySelectorAll("input, select").forEach((el) => {
const key = el.id;

    switch (key) {
      case "floors":
        el.value = rackSelectors.getFloors() ?? "";
        break;

      case "rows":
        el.value = rackSelectors.getRows() ?? "";
        break;

      case "beamsPerRow":
        el.value = rackSelectors.getBeamsPerRow() ?? "";
        break;

      case "verticalSupports":
        el.value = rackSelectors.getVerticalSupports() ?? "";
        break;

      case "supports":
        el.value = rackSelectors.getSupports() ?? "";
        break;
    }

});

// Блокування вертикальних стійок, якщо поверхів менше 2
refs.verticalSupports.disabled = rackSelectors.getFloors() < 2;
};

"js/pages/racks/ui/dropdowns.js";

import { getRacksRefs } from "./dom.js";
import { generateDropdownOptionsHTML } from "./templates/dropdown.js";

// --- Заповнення селектів ---
export const populateDropdowns = (verticalSupports, supports) => {
const refs = getRacksRefs();

refs.verticalSupports.innerHTML = generateDropdownOptionsHTML(verticalSupports);
refs.supports.innerHTML = generateDropdownOptionsHTML(supports);
};

"js/pages/racks/ui/dom.js";

// --- DOM references ---
export const getRacksRefs = () => ({
rackForm: document.getElementById("rackForm"),
rackName: document.getElementById("rackName"),
componentsTable: document.getElementById("componentsTable"),
beamsContainer: document.getElementById("beamsContainer"),
addBeamBtn: document.getElementById("addBeam"),
verticalSupports: document.getElementById("verticalSupports"),
supports: document.getElementById("supports"),
});

"js/pages/racks/ui/beams.js";

import { getRacksRefs } from "./dom.js";
import { generateBeamRowHTML } from "./templates/beamRow.js";

const refs = getRacksRefs();

export const insertBeamUI = (id, beamsData) => {
const html = generateBeamRowHTML(id, beamsData);
refs.beamsContainer.insertAdjacentHTML("beforeend", html);
};

export const removeBeamUI = (id) => {
const row = refs.beamsContainer.querySelector(`[data-id="${id}"]`);
if (row) row.remove();
};

export const clearBeamsUI = () => {
if (refs.beamsContainer) refs.beamsContainer.innerHTML = "";
};

export const toggleVerticalSupportsUI = (floors) => {
const disabled = floors < 2;
refs.verticalSupports.disabled = disabled;
if (disabled) refs.verticalSupports.selectedIndex = -1;
};

"js/pages/racks/ui/templates/beamRow.js";

export const generateBeamRowHTML = (id, beams) => `

  <div class="beam-row" data-id="${id}">
    <select>
      <option value="" disabled selected>Виберіть...</option>
      ${beams.map((b) => `<option value="${b}">${b}</option>`).join("")}
    </select>
    <input type="number" min="1" max="10" />
    <button class="icon-btn icon-btn--remove" type="button" aria-label="Видалити проліт" title="Видалити проліт"></button>
  </div>
`;

"js/pages/racks/ui/templates/componentsTable.js";

// --- Генератор таблиці компонентів ---
export const generateComponentsTableHTML = ({ components, totalCost, isolatorsCost }) => {
if (!components) return "";

// Функція для одного рядка
const rowHTML = (c) => `
    <tr class="rack__components-table__row">
      <td>${c.name}</td>
      <td>${c.amount}</td>
      <td>${c.price}</td>
      <td>${c.amount * c.price}</td>
    </tr>`;

// Генеруємо всі рядки: якщо компонент масив — генеруємо для кожного елемента, інакше один
const tableRows = Object.values(components)
.map((c) => (Array.isArray(c) ? c.map(rowHTML).join("") : rowHTML(c)))
.join("");

const totalWithoutIsolators = totalCost - (isolatorsCost || 0);
const zeroCost = Math.round(totalCost _ 1.2 _ 1.2);

return `     <table class="rack__components-table__table">
      <thead>
        <tr class="rack__components-table__header">
          <th>Компонент</th>
          <th>Кількість</th>
          <th>Ціна за одиницю</th>
          <th>Загальна вартість</th>
        </tr>
      </thead>
       <tbody class="rack__components-table__body">
         ${tableRows}
      </tbody>
    </table>
    <div class="rack__price">
      <p class="price">Загальна вартість без ізоляторів: ${totalWithoutIsolators}</p>
      <p class="total">Загальна вартість: ${totalCost}</p>
      <p class="zero-cost">Нульова ціна АЕ (+ПДВ +націнка): ${zeroCost}</p>
    </div>
  `;
};

"js/pages/racks/ui/templates/dropdown.js";
export const generateDropdownOptionsHTML = (items, placeholder = "Виберіть...") => {
return `        <option value="" selected disabled>${placeholder}</option>
        ${items.map((v) =>`<option value="${v}">${v}</option>`).join("")}
    `;
};

// js/pages/racks/ui/templates/rackName.js

export const generateRackNameHTML = ({ description, abbreviation }) => {
return !description || !abbreviation ? "---" : `<span>${description} ${abbreviation}</і>`;
};

// js/pages/racks/state/priceState.js

let priceData = null;

// Завантаження прайсу
export const loadPrice = async () => {
if (priceData) return priceData;
const res = await fetch("price.json");
priceData = await res.json();
return priceData;
};

// Повернути прайс синхронно після завантаження
export const getPrice = () => {
if (!priceData) throw new Error("Price not loaded yet");
return priceData;
};

// js/pages/racks/state/rackActions.js

/\*\*

- Фабрика actions для сторінки racks
- @param {Object} stateInstance - інстанс state сторінки
- @param {Object} initialState - початковий state
- @returns {Object} rackActions
  \*/
  export const createRackActions = (stateInstance, initialState) => ({
  /\*\*
  - Оновлення кількості поверхів
  - @param {number|string} value
    \*/
    updateFloors(value) {
    const floors = Number(value) || 1;
    stateInstance.updateField("floors", floors);

    // Блокування вертикальних стійок, якщо поверхів менше 2
    if (floors < 2) stateInstance.updateField("verticalSupports", "");

  },

/\*\*

- Оновлення кількості рядів
- @param {number|string} value
  \*/
  updateRows(value) {
  stateInstance.updateField("rows", Number(value) || 1);
  },

/\*\*

- Кількість балок у ряду
- @param {number|string} value
  \*/
  updateBeamsPerRow(value) {
  stateInstance.updateField("beamsPerRow", Number(value) || 2);
  },

/\*\*

- Оновлення вертикальних стійок
- @param {string} value
  \*/
  updateVerticalSupports(value) {
  stateInstance.updateField("verticalSupports", value || "");
  },

/\*\*

- Оновлення типу опор
- @param {string} value
  \*/
  updateSupports(value) {
  stateInstance.updateField("supports", value || "");
  },

/\*\*

- Додати балку
- @returns {number} id доданої балки
  \*/
  addBeam() {
  const state = stateInstance.get();
  const nextBeams = new Map(state.beams);
  const id = state.nextBeamId;

  nextBeams.set(id, { item: "", quantity: null });
  stateInstance.set({ beams: nextBeams, nextBeamId: id + 1 });

  return id;

},

getBeams() {
return [...stateInstance.get().beams.entries()];
},

/\*\*

- Видалити балку
- @param {number} id
  \*/
  removeBeam(id) {
  const state = stateInstance.get();
  if (!state.beams.has(id)) return;

  const nextBeams = new Map(state.beams);
  nextBeams.delete(id);
  stateInstance.set({ beams: nextBeams });

},

/\*\*

- Оновити балку
- @param {number} id
- @param {Partial<{item: string, quantity: number|null}>} patch
  \*/
  updateBeam(id, patch) {
  const state = stateInstance.get();
  const old = state.beams.get(id);
  if (!old) return;

  const nextBeams = new Map(state.beams);
  nextBeams.set(id, { ...old, ...patch });
  stateInstance.set({ beams: nextBeams });

},

/\*\*

- Скидання state до початкового
  \*/
  reset() {
  stateInstance.set({ ...initialState, beams: new Map() });
  },

/\*\*

- Batch-оновлення декількох полів одним викликом
- @param {Object} patch
  \*/
  batch(patch) {
  stateInstance.set({ ...stateInstance.get(), ...patch });
  },
  });

// js/pages/racks/state/rackSelectors.js

/\*\*

- Selectors для сторінки racks
- Всі функції чисті, повертають копії або трансформовані дані
- @param {Object} stateInstance - інстанс state сторінки
  \*/
  export const createRackSelectors = (stateInstance) => ({
  /\*\*
  - Поточна кількість ярусів
  - @returns {number}
    \*/
    getFloors: () => stateInstance.get().floors,

/\*\*

- Поточна кількість рядів
- @returns {number}
  \*/
  getRows: () => stateInstance.get().rows,

/\*\*

- Кількість балок на ряд
- @returns {number}
  \*/
  getBeamsPerRow: () => stateInstance.get().beamsPerRow,

/\*\*

- Вертикальні стояки
- @returns {string}
  \*/
  getVerticalSupports: () => stateInstance.get().verticalSupports,

/\*\*

- Типи опор
- @returns {string}
  \*/
  getSupports: () => stateInstance.get().supports,

/\*\*

- Всі балки у вигляді масиву [id, {item, quantity}]
- @returns {Array<[number, {item: string, quantity: number|null}]>}
  \*/
  getBeams: () => [...stateInstance.get().beams.entries()],

/\*\*

- Кількість балок
- @returns {number}
  \*/
  getTotalBeams: () => stateInstance.get().beams.size,

/\*\*

- Отримати балку за id
- @param {number} id
- @returns {{item: string, quantity: number|null} | undefined}
  \*/
  getBeamById: (id) => stateInstance.get().beams.get(id),

/\*\*

- Поточний state сторінки (копія)
- @returns {Object}
  \*/
  getState: () => {
  const s = stateInstance.get();
  return { ...s, beams: new Map(s.beams) };
  },
  });

// js/pages/racks/state/rackState.js

/\*\*

- Початковий state сторінки racks
  \*/
  export const initialRackState = {
  floors: 1,
  verticalSupports: "",
  supports: "",
  rows: 1,
  beamsPerRow: 2,
  beams: new Map(),
  nextBeamId: 1, // тепер id для балок в state
  };

// js/pages/racks/events/formEvents.js
import { getRacksRefs } from "../ui/dom.js";
import { insertBeamUI, removeBeamUI, toggleVerticalSupportsUI } from "../ui/beams.js";

const MAX_BEAMS = 5;

/\*\*

- Ініціалізація подій форми сторінки racks
- @param {Object} params
- @param {Object} params.price - ціни компонентів
- @param {function} params.addListener - функція для реєстрації event listener
- @param {Object} params.rackActions - actions для роботи з локальним state
- @param {Object} [params.rackSelectors] - селектори (необов'язково, якщо потрібні)
  \*/
  export const initFormEvents = ({ price, addListener, rackActions }) => {
  const refs = getRacksRefs();
  const beamsData = Object.keys(price.beams || {});

/\*_ Додати нову балку _/
const insertBeam = () => {
const id = rackActions.addBeam();
insertBeamUI(id, beamsData);
updateAddBeamButtonState();
};

/\*_ Обробка кліків по кнопках видалення балок _/
const handleClick = (e) => {
if (!e.target.matches(".beam-row > button")) return;

    const row = e.target.closest(".beam-row");
    const id = Number(row.dataset.id);

    removeBeamUI(id);
    rackActions.removeBeam(id);
    updateAddBeamButtonState();

};

const updateAddBeamButtonState = () => {
const currentCount = rackActions.getBeams().length;
refs.addBeamBtn.disabled = currentCount >= MAX_BEAMS;
refs.addBeamBtn.classList.toggle("disabled", currentCount >= MAX_BEAMS);
};

/\*_ Обробка змін полів input/select _/
const handleInput = (e) => {
const target = e.target;
if (!target.matches("input, select")) return;

    const { id, value, tagName } = target;

    switch (id) {
      case "floors":
        rackActions.updateFloors(value);
        toggleVerticalSupportsUI(Number(value) || 0);
        return;

      case "rows":
        rackActions.updateRows(value);
        return;

      case "beamsPerRow":
        rackActions.updateBeamsPerRow(value);
        return;

      case "verticalSupports":
        rackActions.updateVerticalSupports(value);
        return;

      case "supports":
        rackActions.updateSupports(value);
        return;
    }

    const row = target.closest(".beam-row");
    if (!row) return;

    const beamId = Number(row.dataset.id);

    if (tagName === "SELECT") {
      rackActions.updateBeam(beamId, { item: value || "" });
    }

    if (tagName === "INPUT") {
      rackActions.updateBeam(beamId, { quantity: Number(value) || null });
    }

};

/\*_ Реєстрація слухачів _/
addListener(refs.addBeamBtn, "click", insertBeam);
addListener(refs.rackForm, "input", handleInput);
addListener(refs.rackForm, "click", handleClick);
};

// js/pages/racks/core/calculator.js

import { getPrice } from "../state/priceState.js";
import { calculateBeams, calculateRackLength, calculateTotalSpans } from "./utils/beams.js";
import { calculateBraces, supportsFn, verticalSupportsFn } from "./utils/supports.js";
import { rackNameFn } from "./utils/rackName.js";

/\*\*

- Calculate the total cost of the components
- @param {Array} components - array of components where each component is an object with "amount" and "price" properties or an array of such objects
- @returns {number} total cost of the components
  _/
  const totalCostCalculation = (components) =>
  components.reduce(
  (sum, c) =>
  Array.isArray(c) ? sum + c.reduce((s, item) => s + item.amount _ item.price, 0) : sum + c.amount \* c.price,
  0,
  );

/\*\*

- Головна функція розрахунку компонентів
- @param {Object} rackConfig - { floors, rows, beamsPerRow, verticalSupports, support, beams }
- @param {Object} rackComponents - дані прайсу
- @returns {Object} { components: Array<{name, amount, price, totalPrice}>, totalLength: number, totalCost: number }
  \*/
  const calculateComponents = (rackConfig) => {
  const { floors, rows, beams, supports, verticalSupports, beamsPerRow } = rackConfig;
  const componentsPrice = getPrice();

const isEnoughDataForCalculation =
componentsPrice !== null ||
floors ||
rows ||
beams.length ||
supports ||
beamsPerRow ||
!(floors > 1 && verticalSupports);

if (!isEnoughDataForCalculation) return { components: {}, totalLength: 0, totalCost: 0 };

const totalSpans = calculateTotalSpans(beams);
const totalLength = calculateRackLength(beams);
const { description, abbreviation } = rackNameFn({
totalLength,
floors,
rows,
supports,
});

const { edgeSupports, intermediateSupports, supportsData } = supportsFn(
floors,
totalSpans,
componentsPrice,
supports,
);

const beamsData = calculateBeams({
beams,
rows,
beamsPerRow,
beamsData: Object.entries(componentsPrice.beams),
floors,
});

// --- Вертикальні стійки та розкоси ---
const verticalSupportsData = verticalSupportsFn(Object.entries(componentsPrice.vertical_supports), verticalSupports);

const bracesObj = Object.entries(componentsPrice.diagonal_brace).find((b) => b[0] === "diagonal_brace");
const bracesData = {
name: "Розкос",
amount: 0,
price: bracesObj?.[1]?.price || 0,
};

if (floors > 1) {
const spans = totalSpans + 1;
verticalSupportsData.amount = spans \* 2;
bracesData.amount = calculateBraces(spans);
}

// --- Ізолятори ---
const isolatorObj = componentsPrice.isolator;
const isolatorsData = {
name: "Ізолятор",
amount: 0,
price: isolatorObj.isolator?.price || 0,
};
if (floors === 1) {
isolatorsData.amount = (edgeSupports + intermediateSupports) \* 2;
}

// --- Фінальний масив компонентів ---
const components = {
supports: supportsData,
beams: beamsData,
...(floors > 1 ? { verticalSupports: verticalSupportsData } : {}),
...(floors > 1 ? { braces: bracesData } : {}),
...(floors === 1 ? { isolators: isolatorsData } : {}),
};

// --- Розрахунок totalCost для кожного компонента та загальної вартості ---
const totalCost = totalCostCalculation(Object.values(components));

const currentRack = {
description,
abbreviation,
components,
totalLength,
totalCost,
};

return { currentRack };
};

export { calculateComponents };

// js/pages/racks/core/utils/beams.js

/\*\*

- Об’єднання повторюваних балок у масив { name, amount, price }
- @param {Array} beams - масив об’єктів { item, quantity }
- @param {number} rows
- @param {number} beamsPerRow
- @param {Array} beamsData - дані прайсу для балок
- @returns {Array} масив { name, amount, price }
  _/
  export const calculateBeams = ({ beams, rows, beamsPerRow, beamsData, floors }) => {
  const beamsCount = {};
  beams.forEach((beam) => {
  const code = beam.item;
  const qty = Number(beam.quantity || 0) _ (rows || 1) _ (beamsPerRow || 1) _ (floors || 1);
  beamsCount[code] = (beamsCount[code] || 0) + qty;
  });

const res = Object.entries(beamsCount).map(([code, amount]) => {
const price = beamsData.find((b) => b[0] === code)?.[1]?.price || 0;
return { name: `Балка ${code}`, amount, price };
});

return res;
};

/\*\*

- Розрахунок загальної довжини стелажа
- @param {Array} beams - масив об’єктів { item, quantity }
- @returns {number} довжина
  _/
  export const calculateRackLength = (beams) => {
  return beams.reduce((length, beam) => {
  const itemLength = Number(beam.item);
  const qty = Number(beam.quantity);
  if (!isNaN(itemLength) && !isNaN(qty)) {
  return length + itemLength _ qty;
  }
  return length;
  }, 0);
  };

/\*\*

- Підрахунок загальної кількості прольотів
- @param {Array} beams - масив об’єктів { quantity }
- @returns {number} загальна кількість прольотів
  \*/
  export const calculateTotalSpans = (beams) => {
  return beams.reduce((total, beam) => {
  const qty = Number(beam.quantity);
  return total + (isNaN(qty) ? 0 : qty);
  }, 0);
  };

// js/pages/racks/core/utils/numToWord.js

/\*\*

- Функція для заміни номера на відповідне слово
- @param {number} num - номер, який потрібно замінити
- @param {string} type - тип слова, який потрібно замінити (floors, rows)
- @returns {string} слово, яке відповяє переданому номеру
- @example
- const res = numberToWord(3, "floors");
- // res = "трьохповерховий"
  \*/
  export const numberToWord = (num, type) => {
  const words = {
  floors: ["одноповерховий", "двоповерховий", "трьохповерховий", "чотириповерховий", "п’ятиповерховий"],
  rows: ["однорядний", "двохрядний", "трьохрядний", "чотирьохрядний"],
  };
  return words[type]?.[num - 1] || "";
  };

// js/pages/racks/core/utils/rackName.js

import { numberToWord } from "./numToWord.js";

/\*\*

- Функція для формування назви стелажа
- @param {{totalLength: number, floors: number, rows: number, support: string}} rackConfig
- @returns {{description: string, abbreviation: string}} об’єкт з описом стелажа та його абревіатурою
- @example
- const res = rackNameFn({
- totalLength: 3000,
- floors: 2,
- rows: 3,
- support: "430",
- });
  \*/
  export const rackNameFn = ({ totalLength, floors, rows, supports }) => {
  const hasC = supports.includes("C");
  const description = [
  `Стелаж ${numberToWord(floors, "floors")}`,
  numberToWord(rows, "rows"),
  hasC ? "ступінчатий" : "",
  ]
  .filter(Boolean)
  .join(" ");

      const name = `L${floors}A${rows}${hasC ? "C" : ""}-${totalLength}/${supports.replace("C", "")}`;
      return { description, abbreviation: name };

  };

// js/pages/racks/core/utils/supports.js

/\*\*

- Функція для розрахунку кiлькості опор
- @param {number} floors - кiлькість поверхів
- @param {number} totalSpans - загальна довжина стелажа
- @param {Object} rackComponents - об'єкт з даними прайсу
- @param {string} supports - ключ опори
- @returns {{edgeSupports: number, intermediateSupports: number, supportsData: Array<{name: string, amount: number, price: number}>}}
- @example
- const res = supportFn(2, 3000, rackComponents, "215");
  _/
  export const supportsFn = (floors, totalSpans, rackComponents, supports) => {
  const edgeSupports = 2 _ floors;
  const intermediateSupports = Math.max(0, totalSpans + 1 - 2) \* floors;

      const supportsObj = Object.entries(rackComponents.supports).find(
          (s) => s[0] === supports,
      );

      const supportsData = [
          {
              name: `Опора ${supports}`,
              amount: edgeSupports,
              price: supportsObj?.[1]?.edge?.price || 0,
          },
          {
              name: `Опора ${supports} пром`,
              amount: intermediateSupports,
              price: supportsObj?.[1]?.intermediate?.price || 0,
          },
      ];
      return { edgeSupports, intermediateSupports, supportsData };

  };

/\*\*

- Функція для розрахунку кiлькості вертикальних стійок
- @param {Object} rackComponents - об'єкт з даними прайсу
- @param {string} verticalSupports- ключ вертикальної стійки
- @returns {{name: string, amount: number, price: number}}
- @example
- const res = verticalSupportsFn(rackComponents, "632");
  \*/
  export const verticalSupportsFn = (verticalSupportsData, verticalSupports) => {
  const verticalObj = verticalSupportsData.find(
  (v) => v[0] === verticalSupports,
  );

      const res = {
          name: `Верт. стійка ${verticalSupports}`,
          amount: 0,
          price: verticalObj?.[1]?.price || 0,
      };
      return res;

  };

/\*\*

- Розрахунок кількості розкосів
- @param {number} spans - кількість прольотів
- @returns {number} кількість розкосів
  _/
  export const calculateBraces = (spans) => {
  if (!spans || spans < 2) return 0;
  if (spans <= 2) return 2;
  return (spans - 3) _ 2 + 2;
  };

зараз я на цій сторінці хочу
після формування першого стелажу додати зону комплекта стелажу
яка фактично є таблицею: № / назва / кількість / ціна за од / сумма
загальна вартість комплекту і кнопка перейти до комплекту, при натисканні на яку буде відкриватись модальне вікно з деталізацією
№ / назва (підтаблиця - комплектація / кількість / ціна за од / сума /ціна за од без ізоляторів / сума / ціна за од нульова /сума
пісдсумов - загальна ціна / загальна ціна без ізоляторів / загальна нульова ціна

# склади план реалізації цієї задачі)

============================================

Добре. Архітектура вже дозволяє зробити це правильно — без «костилів». Нижче даю **чіткий технічний план реалізації**, з урахуванням твоєї поточної структури.

---

# 🎯 Ціль

Додати:

1. **Зону “Комплект стелажів”** під результатами
2. Агрегуючу таблицю:

   ```
   № | Назва | Кількість | Ціна за од | Сума
   ```

3. Підсумок комплекту
4. Кнопку “Перейти до комплекту”
5. Модальне вікно з деталізацією кожного стелажа

---

# 🧠 Архітектурне рішення (ВАЖЛИВО)

Комплект — це **окрема логічна сутність**, не частина rack state.

Тому:

- ❌ не зберігати в rackState
- ✅ створити окремий module: `rackSet`

---

# 🏗 1. Структура файлів

Додати:

```
js/pages/racks/set/
├─ state/
│  ├─ rackSetState.js
│  ├─ rackSetActions.js
│  └─ rackSetSelectors.js
├─ ui/
│  ├─ renderRackSet.js
│  ├─ renderModal.js
│  └─ templates/
│      ├─ rackSetTable.js
│      └─ modalTable.js
├─ core/
│  └─ aggregate.js
```

---

# 🗂 2. Логіка даних

## 2.1 Що зберігати у rackSetState

```js
export const initialRackSetState = {
  racks: [], // масив об'єктів currentRack
};
```

---

## 2.2 Структура одного rack в комплекті

Зберігати ПОВНИЙ currentRack:

```js
{
  (id, description, abbreviation, components, totalLength, totalCost);
}
```

---

# 🔄 3. Потік даних

### Користувач:

1. Формує стелаж
2. Натискає кнопку “Додати до комплекту”

### Ти:

1. Береш `currentRack`
2. Передаєш в `rackSetActions.addRack(currentRack)`
3. Виконується render комплекту

---

# 🧮 4. Агрегація комплекту (core/aggregate.js)

Потрібно:

- об’єднати однакові стелажі
- або просто групувати по abbreviation

```js
export const aggregateRackSet = (racks) => {
  const map = {};

  racks.forEach((rack) => {
    const key = rack.abbreviation;

    if (!map[key]) {
      map[key] = {
        name: rack.description,
        abbreviation: rack.abbreviation,
        quantity: 0,
        unitPrice: rack.totalCost,
      };
    }

    map[key].quantity += 1;
  });

  return Object.values(map).map((r) => ({
    ...r,
    total: r.quantity * r.unitPrice,
  }));
};
```

---

# 🖥 5. Рендер комплекту

## 5.1 renderRackSet.js

- викликається при зміні rackSetState
- будує таблицю
- рахує:

```
total
totalWithoutIsolators
zeroCost
```

---

# 🧾 6. HTML зона комплекту

Додати в `view-rack`:

```html
<div class="rack-set">
  <h3>Комплект стелажів</h3>
  <div id="rackSetTable"></div>
  <div id="rackSetSummary"></div>
  <button id="openRackSetModal">Перейти до комплекту</button>
</div>
```

---

# 🪟 7. Модальне вікно

Окремий DOM-блок в index.html:

```html
<div id="rackSetModal" class="modal" hidden>
  <div class="modal__content">
    <button id="closeModal">×</button>
    <div id="rackSetModalContent"></div>
  </div>
</div>
```

---

# 📊 8. Модальна деталізація

Для кожного стелажа:

```
№
Назва
Підтаблиця компонентів
Ціна за од
Сума
Ціна без ізоляторів
Нульова
```

Тут використати:

- вже існуючий components
- просто масштабувати на quantity

---

# 🔘 9. Події

Додати:

```
js/pages/racks/set/events.js
```

Слухачі:

- add to set
- open modal
- close modal

Використати твій `addListener` через createPageModule.

---

# 🔥 10. Ключовий момент — не дублювати розрахунки

Не викликати calculateComponents вдруге.

Використовувати вже сформований `currentRack`.

---

# ⚙️ 11. Де інтегрувати

У `rackPage.activate`:

```js
initRackSetModule(addListener);
```

---

# 📐 12. Логіка відображення

Комплект показується тільки якщо:

```js
rackSetSelectors.getTotalRacks() > 0;
```

---

# 💎 13. Архітектурна перевага такого підходу

✔ rackPage не знає, як працює комплект
✔ комплект не знає, як працює калькулятор
✔ розрахунок не залежить від UI
✔ модальне вікно ізольоване

---

# ⚠️ 14. Що НЕ робити

- ❌ не зберігати комплект у rackState
- ❌ не рендерити модалку всередині render()
- ❌ не робити вкладені state.subscribe

---

# 📌 15. Додаткове покращення (опціонально)

Додати:

```
rackSetState → localStorage sync
```

Щоб комплект зберігався при перезавантаженні.

---

# 🧩 Підсумкова схема

```
Rack Page
   │
   ├── Rack Calculator (існуючий)
   │
   └── Rack Set Module
           │
           ├── State
           ├── Aggregate Core
           ├── UI Render
           └── Modal
```

---

# 🚀 Якщо коротко

1. Створити окремий rackSet module
2. Додати state
3. Додати aggregate функцію
4. Додати render таблиці
5. Додати modal
6. Інтегрувати через activate()

---

Якщо хочеш — можу:

- 🔹 розписати конкретні інтерфейси методів
- 🔹 намалювати схему залежностей
- 🔹 або одразу написати skeleton-код rackSet модуля

Куди рухаємось?
