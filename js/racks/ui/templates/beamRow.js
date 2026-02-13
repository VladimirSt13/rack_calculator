export const generateBeamRowHTML = (id, beams) => `
  <div class="beam-row" data-id="${id}">
    <select>
      <option value="" disabled selected>Виберіть...</option>
      ${beams.map((b) => `<option value="${b}">${b}</option>`).join("")}
    </select>
    <input type="number" min="1" max="10" />
    <button type="button">X</button>
  </div>
`;
