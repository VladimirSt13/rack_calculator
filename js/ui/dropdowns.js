import { refs } from "./dom.js";

// --- Заповнення селектів ---
export const populateDropdowns = (verticalSupports, supports) => {
  refs.verticalSupport.innerHTML = `
        <option value="" selected disabled>Виберіть...</option>
        ${verticalSupports.map((v) => `<option value="${v}">${v}</option>`).join("")}
    `;
  refs.support.innerHTML = `
        <option value="" selected disabled>Виберіть...</option>
        ${supports.map((s) => `<option value="${s}">${s}</option>`).join("")}
    `;
};
