import { refs } from "./dom.js";

// --- Заповнення селектів ---
export const populateDropdowns = (verticalSupports, supports) => {
    refs.verticalSupports.innerHTML = `
        <option value="" selected disabled>Виберіть...</option>
        ${verticalSupports.map((v) => `<option value="${v}">${v}</option>`).join("")}
    `;
    refs.supports.innerHTML = `
        <option value="" selected disabled>Виберіть...</option>
        ${supports.map((s) => `<option value="${s}">${s}</option>`).join("")}
    `;
};
