// js/pages/racks/page.js

import { createPageModule } from "../../ui/createPageModule.js";
import { createRackPageContext } from "./pageContext.js";
import { loadPrice } from "./calculator/state/priceState.js";
import { initFormEvents } from "./calculator/events/formEvents.js";
import { initRackSetControls } from "./set/events/initRackSetControls.js";
import { PAGES } from "../../config/app.config.js";
import { createRackCalculatorContext } from "./calculator/context/calculatorContext.js";
import { createRackSetContext } from "./set/context/setContext.js";

const ctx = createRackPageContext();

export const rackPage = createPageModule({
  id: PAGES.RACK,

  init: async () => {
    ctx.price = await loadPrice();
    ctx.calculator = createRackCalculatorContext();
    ctx.rackSet = createRackSetContext();
  },

  activate: (addListener) => {
    ctx.calculator.init();
    ctx.rackSet.init();

    initFormEvents({
      addListener,
      price: ctx.price,
      calculator: ctx.calculator,
    });

    initRackSetControls({
      addListener,
      rackSet: ctx.rackSet,
    });
  },

  deactivate: () => {
    ctx.calculator.destroy();
    ctx.rackSet.destroy();
  },
});
