// js/pages/racks/ui/templates/dropdown.js
export const generateDropdownOptionsHTML = (items, placeholder = 'Виберіть...') => `
        <option value="" selected disabled>${placeholder}</option>
        ${items.map((v) => `<option value="${v}">${v}</option>`).join('')}
    `;
