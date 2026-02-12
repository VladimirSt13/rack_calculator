// js/battery/batteryForm.js
// import { batteryState } from "./batteryState.js";
// import { calculateBatteryOptions } from "./batteryCalculator.js";
// import { renderBatteryTable } from "./templates/batteryRackTable.js";

export const initBatteryPage = () => {
  const form = document.getElementById("batteryForm");

  // --- Скидаємо форму і стан ---
  // batteryState.reset();

  // --- Прив'язуємо обробник форми ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // оновлюємо стан з даних форми
    // batteryState.updateFromForm(form);

    // робимо розрахунок можливих стелажів
    // const options = calculateBatteryOptions(batteryState.data);

    // рендеримо таблицю результатів
    // renderBatteryTable(options);
  });
};
