// js/app/pages/racks/pageContext.js

import { render } from "./calculator/ui/render.js";

/**
 * Creates a page context for the rack page.
 * The page context is responsible for rendering the rack page
 * with the components of the calculator.
 *
 * @param {Object} options - an object with parameters
 * @param {Object} options.selectors - selectors for accessing the calculator components
 * @param {Function} options.getRefs - a function for getting the DOM-refs of the calculator
 * @param {Object} options.price - an object with the price
 */

export const createRackPageContext = () => {
  return {
    price: {},
    calculator: {},
    rackSet: {},

    init() {},

    /**
     * Рендерує сторінку з компонентами калькулятора
     * @param {Object} options - об'єкт з параметрами
     * @param {Object} options.selectors - селектори для доступу до компонентів калькулятора
     * @param {Function} options.getRefs - функція для отримання DOM-refs калькулятора
     * @param {Object} options.price - об'єкт з прайсом
     */
    render() {
      render({
        selectors: this.calculator.selectors,
        getRefs: this.calculator.getRefs,
        price: this.price,
      });
    },
  };
};
