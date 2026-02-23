// js/app/pages/racks/state/pageState.js
import { createState } from '../../../state/createState.js';

/** @typedef {{ price: any, isLoading: boolean, error: string | null }} PageStateData */

/** @type {import('../../../state/createState.js').StateInstance<PageStateData>} */
export const pageState = createState({
  price: null,
  isLoading: false,
  error: null,
});

export default pageState;
