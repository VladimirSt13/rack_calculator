//js/app/pages/racks/handlers/formhandler.js

/**
 * @typedef {Object} HandlerDeps
 * @property {ReturnType<import('../calculator/context.js').createCalculatorContext>} calculator
 * @property {any} price
 */

/**
 * Handle form input changes
 * @param {InputEvent} e
 * @param {HandlerDeps} deps
 */
export const handleFormInput = (e, { calculator }) => {
  const target = /** @type {HTMLInputElement | HTMLSelectElement} */ (e.target);
  if (!target.matches('input, select')) {
    return;
  }

  const { id, value, tagName } = target;
  switch (id) {
    case 'rack-floors':
      calculator.actions.updateFloors(value);
      break;
    case 'rack-rows':
      calculator.actions.updateRows(value);
      break;
    case 'rack-beamsPerRow':
      calculator.actions.updateBeamsPerRow(value);
      break;
    case 'rack-verticalSupports':
      calculator.actions.updateVerticalSupports(value);
      break;
    case 'rack-supports':
      calculator.actions.updateSupports(value);
      break;
    default: {
      const row = target.closest('.beam-row');
      if (!row) {
        return;
      }
      const beamId = Number(row.dataset.id);
      if (tagName === 'SELECT') {
        calculator.actions.updateBeam(beamId, { item: value || '' });
      }
      if (tagName === 'INPUT') {
        calculator.actions.updateBeam(beamId, { quantity: Number(value) || null });
      }
    }
  }
};

/**
 * Add new beam row
 * @param {HandlerDeps} deps
 * @param {() => HTMLElement|null} getBeamsContainer
 */
export const handleAddBeam = ({ calculator, price }, getBeamsContainer) => {
  const beamId = calculator.actions.addBeam();
  const container = getBeamsContainer();
  if (!container) {
    return;
  }

  const beamsData = Object.keys(price.beams);
  const rowHTML = `
    <div class="beam-row" data-id="${beamId}">
      <select>
        <option value="" disabled selected>Виберіть...</option>
        ${beamsData.map((b) => `<option value="${b}">${b}</option>`).join('')}
      </select>
      <input type="number" min="1" max="10" />
      <button class="icon-btn icon-btn--remove" type="button" aria-label="Видалити проліт"></button>
    </div>`;
  container.insertAdjacentHTML('beforeend', rowHTML);
};

/**
 * Remove beam (delegation)
 * @param {MouseEvent} e
 * @param {HandlerDeps} deps
 */
export const handleBeamRemove = (e, { calculator }) => {
  if (!e.target.matches('.icon-btn--remove')) {
    return;
  }
  const row = e.target.closest('.beam-row');
  if (!row) {
    return;
  }
  const beamId = Number(row.dataset.id);
  calculator.actions.removeBeam(beamId);
  row.remove();
};
