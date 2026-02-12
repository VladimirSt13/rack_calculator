import { getPrice } from "../state/priceState.js";
import { rackState } from "../state/rackState.js";
import { beamController } from "../ui/beams.js";
import { refs } from "../ui/dom.js";
import { render } from "../ui/render.js";
import { debounce } from "../utils/debounce.js";

export const initFormEvents = async () => {
    const { addBeam, removeBeam } = beamController();
    const componentsPrice = await getPrice();
    const beamsData = Object.keys(componentsPrice.beams);

    addBeam(beamsData);

    const handler = (e) => handleFormEvent(e, removeBeam);
    refs.rackForm.addEventListener("input", debounce(handler, 150));
    refs.rackForm.addEventListener("click", handler, 150);
};

const handleFormEvent = (e, removeBeam) => {
    const target = e.target;

    if (target.matches("input, select")) handleInputChange(target);
    if (target.matches(".beam-row > button")) removeBeam(target);
};

// --- Обробка зміни інпутів ---
const handleInputChange = (target) => {
    const { id, value, tagName } = target;

    switch (id) {
        case "floors":
            rackState.floors = Number(value) || null;
            if (rackState.floors < 2) {
                refs.verticalSupports.disabled = true;
                refs.verticalSupports.selectedIndex = -1;
                rackState.verticalSupports = "";
            } else refs.verticalSupports.disabled = false;
            break;
        case "rows":
            rackState.rows = Number(value) || null;
            break;
        case "beamsPerRow":
            rackState.beamsPerRow = Number(value) || null;
            break;
        case "verticalSupports":
            rackState.verticalSupports = value || "";
            break;
        case "supports":
            rackState.supports = value || "";
            break;
    }

    // Оновлення прольотів
    const row = target.closest(".beam-row");
    if (row) {
        const rowData = rackState.beams.get(Number(row.dataset.id));
        if (rowData) {
            if (tagName === "SELECT") rowData.item = value || "";
            else if (tagName === "INPUT")
                rowData.quantity = Number(value) || null;
        }
    }

    render();
};
