/**
 * Фабрика actions для сторінки racks
 * @param {Object} stateInstance - інстанс state сторінки
 * @param {Object} initialState - початковий state
 * @returns {Object} rackActions
 */
export const createRackActions = (stateInstance, initialState) => ({
  /**
   * Оновлення кількості поверхів
   * @param {number|string} value
   */
  updateFloors(value) {
    const floors = Number(value) || 1;
    stateInstance.updateField("floors", floors);

    // Блокування вертикальних стійок, якщо поверхів менше 2
    if (floors < 2) stateInstance.updateField("verticalSupports", "");
  },

  /**
   * Оновлення кількості рядів
   * @param {number|string} value
   */
  updateRows(value) {
    stateInstance.updateField("rows", Number(value) || 1);
  },

  /**
   * Кількість балок у ряду
   * @param {number|string} value
   */
  updateBeamsPerRow(value) {
    stateInstance.updateField("beamsPerRow", Number(value) || 2);
  },

  /**
   * Оновлення вертикальних стійок
   * @param {string} value
   */
  updateVerticalSupports(value) {
    stateInstance.updateField("verticalSupports", value || "");
  },

  /**
   * Оновлення типу опор
   * @param {string} value
   */
  updateSupports(value) {
    stateInstance.updateField("supports", value || "");
  },

  /**
   * Додати балку
   * @returns {number} id доданої балки
   */
  addBeam() {
    const state = stateInstance.get();
    const nextBeams = new Map(state.beams);
    const id = state.nextBeamId;

    nextBeams.set(id, { item: "", quantity: null });
    stateInstance.set({ beams: nextBeams, nextBeamId: id + 1 });

    return id;
  },

  /**
   * Видалити балку
   * @param {number} id
   */
  removeBeam(id) {
    const state = stateInstance.get();
    if (!state.beams.has(id)) return;

    const nextBeams = new Map(state.beams);
    nextBeams.delete(id);
    stateInstance.set({ beams: nextBeams });
  },

  /**
   * Оновити балку
   * @param {number} id
   * @param {Partial<{item: string, quantity: number|null}>} patch
   */
  updateBeam(id, patch) {
    const state = stateInstance.get();
    const old = state.beams.get(id);
    if (!old) return;

    const nextBeams = new Map(state.beams);
    nextBeams.set(id, { ...old, ...patch });
    stateInstance.set({ beams: nextBeams });
  },

  /**
   * Скидання state до початкового
   */
  reset() {
    stateInstance.set({ ...initialState, beams: new Map() });
  },

  /**
   * Batch-оновлення декількох полів одним викликом
   * @param {Object} patch
   */
  batch(patch) {
    stateInstance.set({ ...stateInstance.get(), ...patch });
  },
});
