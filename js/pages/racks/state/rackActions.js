// js/racks/state/rackActions.js
import { rackState, initialRackState } from "./rackState.js";

/**
 * Actions для роботи зі state сторінки racks
 */
export const rackActions = {
  /**
   * Оновлення кількості поверхів
   * @param {number|string} value
   */
  updateFloors(value) {
    const floors = Number(value) || 1;
    rackState.updateField("floors", floors);

    // Блокування вертикальних стійок, якщо поверхів менше 2
    if (floors < 2) rackState.updateField("verticalSupports", "");
  },

  /**
   * Оновлення кількості рядів
   * @param {number|string} value
   */
  updateRows(value) {
    rackState.updateField("rows", Number(value) || 1);
  },

  /**
   * Кількість балок у ряду
   * @param {number|string} value
   */
  updateBeamsPerRow(value) {
    rackState.updateField("beamsPerRow", Number(value) || 2);
  },

  /**
   * Оновлення вертикальних стійок
   * @param {string} value
   */
  updateVerticalSupports(value) {
    rackState.updateField("verticalSupports", value || "");
  },

  /**
   * Оновлення типу опор
   * @param {string} value
   */
  updateSupports(value) {
    rackState.updateField("supports", value || "");
  },

  /**
   * Додати балку
   * @returns {number} id доданої балки
   */
  addBeam() {
    const state = rackState.get();
    const nextBeams = new Map(state.beams);
    const id = state.nextBeamId;

    nextBeams.set(id, { item: "", quantity: null });
    rackState.set({ beams: nextBeams, nextBeamId: id + 1 });

    return id;
  },

  /**
   * Видалити балку
   * @param {number} id
   */
  removeBeam(id) {
    const state = rackState.get();
    if (!state.beams.has(id)) return;

    const nextBeams = new Map(state.beams);
    nextBeams.delete(id);
    rackState.set({ beams: nextBeams });
  },

  /**
   * Оновити балку
   * @param {number} id
   * @param {Partial<{item: string, quantity: number|null}>} patch
   */
  updateBeam(id, patch) {
    const state = rackState.get();
    const old = state.beams.get(id);
    if (!old) return;

    const nextBeams = new Map(state.beams);
    nextBeams.set(id, { ...old, ...patch });
    rackState.set({ beams: nextBeams });
  },

  /**
   * Скидання state до початкового
   */
  reset() {
    rackState.set({ ...initialRackState, beams: new Map() });
  },

  /**
   * Batch-оновлення декількох полів одним викликом
   * @param {Object} patch
   */
  batch(patch) {
    rackState.set({ ...rackState.get(), ...patch });
  },
};
