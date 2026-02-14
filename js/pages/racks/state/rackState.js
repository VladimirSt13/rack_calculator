import { createState } from "../../../state/createState.js";

/**
 * Початковий state сторінки racks
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

/**
 * Локальний state сторінки racks
 */
export const rackState = createState({ ...initialRackState });
