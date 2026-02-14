// js/pages/racks/events/formEvents.js
import { getRacksRefs } from "../ui/dom.js";
import { insertBeamUI, removeBeamUI, toggleVerticalSupportsUI } from "../ui/beams.js";

/**
 * Ініціалізація подій форми сторінки racks
 * @param {Object} params
 * @param {Object} params.price - ціни компонентів
 * @param {function} params.addListener - функція для реєстрації event listener
 * @param {Object} params.rackActions - actions для роботи з локальним state
 * @param {Object} [params.rackSelectors] - селектори (необов'язково, якщо потрібні)
 */
export const initFormEvents = ({ price, addListener, rackActions }) => {
  const refs = getRacksRefs();
  const beamsData = Object.keys(price.beams || {});

  /** Додати нову балку */
  const insertBeam = () => {
    const id = rackActions.addBeam();
    insertBeamUI(id, beamsData);
  };

  /** Обробка кліків по кнопках видалення балок */
  const handleClick = (e) => {
    if (!e.target.matches(".beam-row > button")) return;

    const row = e.target.closest(".beam-row");
    const id = Number(row.dataset.id);

    removeBeamUI(id);
    rackActions.removeBeam(id);
  };

  /** Обробка змін полів input/select */
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

  /** Реєстрація слухачів */
  addListener(refs.addBeamBtn, "click", insertBeam);
  addListener(refs.rackForm, "input", handleInput);
  addListener(refs.rackForm, "click", handleClick);
};
