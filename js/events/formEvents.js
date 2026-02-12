import { getPrice } from "../state/priceState.js";
import { rackState } from "../state/rackState.js";
import { beamController } from "../ui/beams.js";
import { refs } from "../ui/dom.js";

export const initFormEvents = async () => {
    const { addBeam, removeBeam } = beamController();

    const componentsPrice = await getPrice();
    const beamsData = Object.keys(componentsPrice.beams);

    // Початковий проліт
    addBeam(beamsData);

    refs.rackForm.addEventListener("input", handleFormEvent);
    refs.rackForm.addEventListener("click", (e) => {
        if (e.target.matches(".beam-row > button")) {
            removeBeam(e.target);
        }
    });
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
