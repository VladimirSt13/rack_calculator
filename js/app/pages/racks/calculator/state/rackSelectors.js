// js/pages/racks/state/rackSelectors.js

/**
 * Selectors для сторінки racks
 * Всі функції чисті, повертають копії або трансформовані дані
 * @param {Object} stateInstance - інстанс state сторінки
 */
export const createRackSelectors = (stateInstance) => ({
  /**
   * Поточна кількість ярусів
   * @returns {number}
   */
  getFloors: () => stateInstance.get().floors,

  /**
   * Поточна кількість рядів
   * @returns {number}
   */
  getRows: () => stateInstance.get().rows,

  /**
   * Кількість балок на ряд
   * @returns {number}
   */
  getBeamsPerRow: () => stateInstance.get().beamsPerRow,

  /**
   * Вертикальні стояки
   * @returns {string}
   */
  getVerticalSupports: () => stateInstance.get().verticalSupports,

  /**
   * Типи опор
   * @returns {string}
   */
  getSupports: () => stateInstance.get().supports,

  /**
   * Всі балки у вигляді масиву [id, {item, quantity}]
   * @returns {Array<[number, {item: string, quantity: number|null}]>}
   */
  getBeams: () => [...stateInstance.get().beams.entries()],

  /**
   * Кількість балок
   * @returns {number}
   */
  getTotalBeams: () => stateInstance.get().beams.size,

  /**
   * Отримати балку за id
   * @param {number} id
   * @returns {{item: string, quantity: number|null} | undefined}
   */
  getBeamById: (id) => stateInstance.get().beams.get(id),

  /**
   * Поточний state сторінки (копія)
   * @returns {Object}
   */
  getState: () => {
    const s = stateInstance.get();
    return { ...s, beams: new Map(s.beams) };
  },
});
