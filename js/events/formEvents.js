import { getPrice } from "../state/priceState.js";
import { rackState } from "../state/rackState.js";
import { beamController } from "../ui/beams.js";
import { refs } from "../ui/dom.js";
import { generateBeamRowHTML } from "../ui/templates/beamRow.js";

const { addBeam, removeBeam } = beamController();

export const initFormEvents = async () => {
  const componentsPrice = await getPrice();
  const beamsData = Object.keys(componentsPrice.beams);

  // Початковий проліт

  insertBeam(beamsData);

  refs.addBeamBtn.addEventListener("click", insertBeam);
  refs.rackForm.addEventListener("input", handleFormEvent);
  refs.rackForm.addEventListener("click", (e) => {
    if (!e.target.matches(".beam-row > button")) return;

    const row = e.target.closest(".beam-row");
    const id = Number(row.dataset.id);

    row.remove();
    removeBeam(id);
  });
};

const insertBeam = (beamsData) => {
  const id = addBeam();
  const html = generateBeamRowHTML(id, beamsData);
  refs.beamsContainer.insertAdjacentHTML("beforeend", html);
};

const handleFormEvent = (e) => {
  const target = e.target;

  if (!target.matches("input, select")) return;

  handleInputChange(target);
};

const handleInputChange = (target) => {
  const { id, value, tagName } = target;

  // --- Основні поля ---
  switch (id) {
    case "floors":
      rackState.floors = Number(value) || null;

      if (rackState.floors < 2) {
        refs.verticalSupports.disabled = true;
        refs.verticalSupports.selectedIndex = -1;
        rackState.verticalSupports = "";
      } else {
        refs.verticalSupports.disabled = false;
      }
      return;

    case "rows":
      rackState.rows = Number(value) || null;
      return;

    case "beamsPerRow":
      rackState.beamsPerRow = Number(value) || null;
      return;

    case "verticalSupports":
      rackState.verticalSupports = value || "";
      return;

    case "supports":
      rackState.supports = value || "";
      return;
  }

  // --- Оновлення прольотів (БЕЗ мутації) ---
  const row = target.closest(".beam-row");
  if (!row) return;

  const beamId = Number(row.dataset.id);
  const prevBeam = rackState.beams.get(beamId);
  if (!prevBeam) return;

  if (tagName === "SELECT") {
    rackState.beams.set(beamId, {
      ...prevBeam,
      item: value || "",
    });
  }

  if (tagName === "INPUT") {
    rackState.beams.set(beamId, {
      ...prevBeam,
      quantity: Number(value) || null,
    });
  }
};
