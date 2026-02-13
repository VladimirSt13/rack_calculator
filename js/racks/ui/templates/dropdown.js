// js/ui/templates/dropdown.js
export const generateDropdownOptionsHTML = (items, placeholder = "Виберіть...") => {
  return `
        <option value="" selected disabled>${placeholder}</option>
        ${items.map((v) => `<option value="${v}">${v}</option>`).join("")}
    `;
};
