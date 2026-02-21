// js/pages/racks/ui/templates/beamRow.js

export const generateBeamRowHTML = (id, beams) => `
  <div class="beam-row" data-id="${id}">
    <select>
      <option value="" disabled selected>Виберіть...</option>
      ${beams.map((b) => `<option value="${b}">${b}</option>`).join("")}
    </select>
    <input type="number" min="1" max="10" />
    <button class="icon-btn icon-btn--remove" type="button" aria-label="Видалити проліт" title="Видалити проліт"></button>
  </div>
`;
