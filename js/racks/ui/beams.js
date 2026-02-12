import { refs } from "./dom.js";
import { generateBeamRowHTML } from "./templates/beamRow.js";

export const insertBeamUI = (id, beamsData) => {
  const html = generateBeamRowHTML(id, beamsData);
  refs.beamsContainer.insertAdjacentHTML("beforeend", html);
};

export const removeBeamUI = (id) => {
  const row = refs.beamsContainer.querySelector(`[data-id="${id}"]`);
  if (row) row.remove();
};

export const toggleVerticalSupportsUI = (floors) => {
  const disabled = floors < 2;
  refs.verticalSupports.disabled = disabled;
  if (disabled) refs.verticalSupports.selectedIndex = -1;
};
