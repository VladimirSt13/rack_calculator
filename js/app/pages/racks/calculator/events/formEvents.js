// js/pages/racks/events/formEvents.js
import { insertBeamUI, removeBeamUI } from "../ui/beams.js";
import { toggleVerticalSupportsUI } from "../ui/verticalSupports.js";

import { populateDropdowns } from "../ui/dropdowns.js";

const MAX_BEAMS = 5;

/**
 * Ініціалізація подій форми сторінки racks
 * @param {Object} params
 * @param {Object} params.price - ціни компонентів
 * @param {function} params.addListener - функція для реєстрації event listener
 * @param {Object} params.rackActions - actions для роботи з локальним state
 * @param {Object} [params.rackSelectors] - селектори (необов'язково, якщо потрібні)
 */
export const initFormEvents = ({ addListener, calculator, price }) => {
  const { actions, getRefs } = calculator;
  const refs = getRefs();
  const beamsData = Object.keys(price.beams || {});

  // Наповнення dropdown-ів, якщо ціни завантажені
  if (price) {
    populateDropdowns({
      verticalSupports: Object.keys(price.vertical_supports),
      supports: Object.keys(price.supports),
      refs,
    });
  }

  /** Додати нову балку */
  const insertBeam = () => {
    const id = actions.addBeam();
    insertBeamUI({ id, beamsData, refs });
    updateAddBeamButtonState();
  };

  /** Обробка кліків по кнопках видалення балок */
  const handleClick = (e) => {
    if (!e.target.matches(".beam-row > button")) return;

    const row = e.target.closest(".beam-row");
    const id = Number(row.dataset.id);

    removeBeamUI({ id, refs });
    actions.removeBeam(id);
    updateAddBeamButtonState();
  };

  const updateAddBeamButtonState = () => {
    const currentCount = actions.getBeams().length;
    refs.addBeamBtn.disabled = currentCount >= MAX_BEAMS;
    refs.addBeamBtn.classList.toggle("disabled", currentCount >= MAX_BEAMS);
  };

  /** Обробка змін полів input/select */
  const handleInput = (e) => {
    const target = e.target;
    if (!target.matches("input, select")) return;

    const { id, value, tagName } = target;

    switch (id) {
      case "floors":
        actions.updateFloors(value);
        toggleVerticalSupportsUI({ floors: Number(value) || 0, refs });
        return;

      case "rows":
        actions.updateRows(value);
        return;

      case "beamsPerRow":
        actions.updateBeamsPerRow(value);
        return;

      case "verticalSupports":
        actions.updateVerticalSupports(value);
        return;

      case "supports":
        actions.updateSupports(value);
        return;
    }

    const row = target.closest(".beam-row");
    if (!row) return;

    const beamId = Number(row.dataset.id);

    if (tagName === "SELECT") {
      actions.updateBeam(beamId, { item: value || "" });
    }

    if (tagName === "INPUT") {
      actions.updateBeam(beamId, { quantity: Number(value) || null });
    }
  };

  /** Реєстрація слухачів */
  addListener(refs.addBeamBtn, "click", insertBeam);
  addListener(refs.rackForm, "input", handleInput);
  addListener(refs.rackForm, "click", handleClick);
};
