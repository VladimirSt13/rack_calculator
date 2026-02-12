import { rackState } from "../state/rackState.js";
import { refs } from "./dom.js";

export const beamController = () => {
    let id = 0;

    const addBeam = (beams) => {
        refs.addBeamBtn.addEventListener("click", () => {
            if (!beams) return;
            id++;

            const options = beams
                .map((b) => `<option value="${b}">${b}</option>`)
                .join("");
            const rowHTML = `
        <div class="beam-row" data-id="${id}">
            <select><option value="" disabled selected>Виберіть...</option>
            ${options}
            </select>
            <input type="number" min="1" max="10" />
            <button type="button">X</button>
        </div>
      `;
            refs.beamsContainer.insertAdjacentHTML("beforeend", rowHTML);

            // Додаємо новий проліт у Proxy, render() викличеться автоматично
            rackState.beams.set(id, { item: "", quantity: null });
        });
    };

    const removeBeam = (button) => {
        const row = button.closest(".beam-row");
        const rowId = Number(row.dataset.id);
        row.remove();
        // Видалення з Map також тригерить render() через Proxy
        rackState.beams.delete(rowId);
    };

    return { addBeam, removeBeam };
};
