// js/apppages/racks/page.js

import { PAGES } from "../../config/app.config.js";
import { createPageModule } from "../../ui/createPageModule.js";
import { createRackPageContext } from "./pageContext.js";
import { loadPrice } from "./calculator/state/priceState.js";
import { initFormEvents } from "./calculator/events/formEvents.js";
import { resetRackForm } from "./calculator/ui/resetRackForm.js";
import { createRackCalculatorContext } from "./calculator/context/calculatorContext.js";
import { initRackSetControls } from "./set/events/initRackSetControls.js";
import { createRackSetContext } from "./set/context/setContext.js";

import { createDevPanel } from "../../ui/debagPanel.js";
const ctx = createRackPageContext();

export const rackPage = createPageModule({
  id: PAGES.RACK,

  init: async () => {
    ctx.price = await loadPrice();
    ctx.calculator = createRackCalculatorContext();
    ctx.rackSet = createRackSetContext();
  },

  activate: (addListener) => {
    ctx.calculator.init(() => ctx.render());
    ctx.rackSet.init();
    ctx.init();
    ctx.render();

    initFormEvents({
      addListener,
      price: ctx.price,
      calculator: ctx.calculator,
    });
    resetRackForm({ selectors: ctx.calculator.selectors, getRefs: ctx.calculator.getRefs });

    initRackSetControls({
      addListener,
      rackSet: ctx.rackSet,
    });

    // createDevPanel({ rackPage: ctx, rackCalculator: ctx.calculator, rackSet: ctx.rackSet });
  },

  deactivate: () => {
    ctx.calculator.destroy();
    ctx.rackSet.destroy();
  },
});
