// js/app/pages/racks/calculator/state/rackActions.js

export const createRackActions = (stateInstance, initialState) => ({
  /* -------------------- FORM -------------------- */

  updateFloors(value) {
    const floors = Number(value) || 1;
    const oldForm = stateInstance.get().form;
    stateInstance.updateNestedField("form", {
      floors,
      verticalSupports: floors < 2 ? "" : oldForm.verticalSupports,
    });
  },

  updateRows(value) {
    stateInstance.updateNestedField("form", { rows: Number(value) || 1 });
  },

  updateBeamsPerRow(value) {
    stateInstance.updateNestedField("form", { beamsPerRow: Number(value) || 2 });
  },

  updateVerticalSupports(value) {
    stateInstance.updateNestedField("form", { verticalSupports: value || "" });
  },

  updateSupports(value) {
    stateInstance.updateNestedField("form", { supports: value || "" });
  },

  /* -------------------- BEAMS -------------------- */

  addBeam() {
    const state = stateInstance.get();
    const nextBeams = new Map(state.form.beams);
    const id = state.form.nextBeamId;

    nextBeams.set(id, { item: "", quantity: null });

    stateInstance.updateNestedField("form", {
      beams: nextBeams,
      nextBeamId: id + 1,
    });

    return id;
  },

  removeBeam(id) {
    const state = stateInstance.get();
    if (!state.form.beams.has(id)) return;

    const nextBeams = new Map(state.form.beams);
    nextBeams.delete(id);

    stateInstance.updateNestedField("form", { beams: nextBeams });
  },

  updateBeam(id, patch) {
    const state = stateInstance.get();
    const oldBeam = state.form.beams.get(id);
    if (!oldBeam) return;

    const nextBeams = new Map(state.form.beams);
    nextBeams.set(id, { ...oldBeam, ...patch });

    stateInstance.updateNestedField("form", { beams: nextBeams });
  },

  /* -------------------- CURRENT RACK -------------------- */

  clearCurrentRack() {
    stateInstance.updateField("currentRack", null);
  },

  /* -------------------- RESET -------------------- */

  reset() {
    stateInstance.set({
      form: { ...initialState.form, beams: new Map() },
      currentRack: null,
    });
  },

  /* -------------------- BATCH -------------------- */

  batchForm(patch) {
    stateInstance.updateNestedField("form", patch);
  },
});
