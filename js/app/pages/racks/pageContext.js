// js/app/pages/racks/pageContext.js

import { render } from "./calculator/ui/render.js";

export const createRackPageContext = () => {
  return {
    price: {},
    calculator: {},
    rackSet: {},

    init() {},

    render() {
      render({
        selectors: this.calculator.selectors,
        getRefs: this.calculator.getRefs,
        price: this.price,
      });
    },
  };
};
