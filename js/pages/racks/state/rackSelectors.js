import { rackState } from "./rackState.js";

/**
 * Selectors для сторінки racks
 * Всі функції чисті, повертають копії або трансформовані дані
 */
export const rackSelectors = {
  /**
   * Поточна кількість ярусів
   * @returns {number}
   */
  getFloors: () => rackState.get().floors,

  /**
   * Поточна кількість рядів
   * @returns {number}
   */
  getRows: () => rackState.get().rows,

  /**
   * Кількість балок на ряд
   * @returns {number}
   */
  getBeamsPerRow: () => rackState.get().beamsPerRow,

  /**
   * Вертикальні стояки
   * @returns {string}
   */
  getVerticalSupports: () => rackState.get().verticalSupports,

  /**
   * Типи опор
   * @returns {string}
   */
  getSupports: () => rackState.get().supports,

  /**
   * Всі балки у вигляді масиву [id, {item, quantity}]
   * @returns {Array<[number, {item: string, quantity: number|null}]>}
   */
  getBeams: () => [...rackState.get().beams.entries()],

  /**
   * Кількість балок
   * @returns {number}
   */
  getTotalBeams: () => rackState.get().beams.size,

  /**
   * Отримати балку за id
   * @param {number} id
   * @returns {{item: string, quantity: number|null} | undefined}
   */
  getBeamById: (id) => rackState.get().beams.get(id),

  /**
   * Поточний state сторінки (копія)
   * @returns {Object}
   */
  getState: () => {
    const state = rackState.get();
    return {
      ...state,
      beams: new Map(state.beams),
    };
  },
};
