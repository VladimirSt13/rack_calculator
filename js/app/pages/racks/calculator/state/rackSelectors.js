// js/app/pages/racks/state/rackSelectors.js
export const createRackSelectors = (stateInstance) => {
  let memoBeams = null;
  let memoBeamsMap = null;

  return {
    getFloors: () => stateInstance.get().form.floors,
    getRows: () => stateInstance.get().form.rows,
    getBeamsPerRow: () => stateInstance.get().form.beamsPerRow,
    getVerticalSupports: () => stateInstance.get().form.verticalSupports,
    getSupports: () => stateInstance.get().form.supports,

    /** Мемоизация только для beams */
    getBeams: () => {
      const beamsMap = stateInstance.get().form.beams;
      if (memoBeamsMap === beamsMap) return memoBeams;
      memoBeams = [...beamsMap.entries()];
      memoBeamsMap = beamsMap;
      return memoBeams;
    },

    getBeamsArray: () => [...stateInstance.get().form.beams.values()],
    getTotalBeams: () => stateInstance.get().form.beams.size,
    getBeamById: (id) => stateInstance.get().form.beams.get(id),

    /** currentRack хранится в state, селектор просто возвращает его */
    getCurrentRack: () => {
      const s = stateInstance.get();
      return s.currentRack ? { ...s.currentRack } : null;
    },

    /** Полный snapshot state */
    getState: () => {
      const s = stateInstance.get();
      return {
        form: { ...s.form, beams: new Map(s.form.beams) },
        currentRack: s.currentRack ? { ...s.currentRack } : null,
      };
    },
  };
};
