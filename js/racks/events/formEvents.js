import { getPrice } from "../state/priceState.js";
import { refs } from "../ui/dom.js";

import { addBeamAction, removeBeamAction, updateBeamAction } from "../actions/beamActions.js";

import {
  updateFloors,
  updateRows,
  updateBeamsPerRow,
  updateVerticalSupports,
  updateSupports,
} from "../actions/rackActions.js";

import { insertBeamUI, removeBeamUI, toggleVerticalSupportsUI } from "../ui/beams.js";

export const initFormEvents = async () => {
  const price = await getPrice();
  const beamsData = Object.keys(price.beams);

  const insertBeam = () => {
    const id = addBeamAction();
    insertBeamUI(id, beamsData);
  };

  // insertBeam();

  refs.addBeamBtn.addEventListener("click", insertBeam);

  refs.rackForm.addEventListener("input", handleInput);

  refs.rackForm.addEventListener("click", (e) => {
    if (!e.target.matches(".beam-row > button")) return;

    const row = e.target.closest(".beam-row");
    const id = Number(row.dataset.id);

    removeBeamUI(id);
    removeBeamAction(id);
  });
};

const handleInput = (e) => {
  const target = e.target;
  if (!target.matches("input, select")) return;

  const { id, value, tagName } = target;

  switch (id) {
    case "floors":
      updateFloors(value);
      toggleVerticalSupportsUI(Number(value) || 0);
      return;

    case "rows":
      updateRows(value);
      return;

    case "beamsPerRow":
      updateBeamsPerRow(value);
      return;

    case "verticalSupports":
      updateVerticalSupports(value);
      return;

    case "supports":
      updateSupports(value);
      return;
  }

  const row = target.closest(".beam-row");
  if (!row) return;

  const beamId = Number(row.dataset.id);

  if (tagName === "SELECT") {
    updateBeamAction(beamId, { item: value || "" });
  }

  if (tagName === "INPUT") {
    updateBeamAction(beamId, {
      quantity: Number(value) || null,
    });
  }
};
