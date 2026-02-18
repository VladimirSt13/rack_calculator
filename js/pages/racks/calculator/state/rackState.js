// js/pages/racks/state/rackState.js

/**
 * Початковий state сторінки racks калькулятора
 */
export const initialRackState = {
  floors: 1,
  verticalSupports: "",
  supports: "",
  rows: 1,
  beamsPerRow: 2,
  beams: new Map(),
  nextBeamId: 1, // тепер id для балок в state
};
