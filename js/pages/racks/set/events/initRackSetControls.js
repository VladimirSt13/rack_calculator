import { rackSetActions } from "../../../rackPage.js";
import { getRackSetRefs } from "../ui/dom.js";

export const initRackSetControls = () => {
  const refs = getRackSetRefs();
  const btn = refs.addRackBtn;
  if (!btn) return;

  btn.addEventListener("click", () => {
    // додаємо стелаж у state
    // для початку можемо додати тестовий об’єкт або скопіювати останній
    const newRack = {
      description: "Новий стелаж",
      abbreviation: `R${Date.now()}`, // унікальний ключ
      totalCost: 0,
      components: [],
    };

    rackSetActions.addRack(newRack); // додаємо через actions
  });
};
