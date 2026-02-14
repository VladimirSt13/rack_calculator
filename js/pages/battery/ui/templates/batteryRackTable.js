const SPAN_ICONS = {
  BEST_FIT: "✅",
  SYMMETRIC: "🔹",
  BALANCED: "⚖",
};

export const renderBatteryTable = (batterySelectors) => {
  const table = document.querySelector("#batteryRackTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  const headers = [
    "№",
    "Поверхи",
    "Ряди",
    "Довжина стелажа, мм",
    "Ширина стелажа, мм",
    "Висота стелажа, мм",
    "Варіанти прольотів",
  ];

  thead.innerHTML = "<tr>" + headers.map((h) => `<th>${h}</th>`).join("") + "</tr>";
  tbody.innerHTML = "";

  const rackConfigs = batterySelectors.getResults();

  if (!Array.isArray(rackConfigs) || rackConfigs.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="${headers.length}" style="text-align:center">Немає варіантів</td>`;
    tbody.appendChild(tr);
    return;
  }

  rackConfigs.forEach((rack, index) => {
    const tr = document.createElement("tr");

    // Формуємо HTML для варіантів прольотів (максимум 3)
    const spansHTML = (rack.spans ?? [])
      .slice(0, 3)
      .map((v) => {
        console.log(v.type, SPAN_ICONS[v.type]);
        const mark = SPAN_ICONS[v.type] || "";
        return `<div>${mark} ${v.combo.join(" + ")}</div>`;
      })
      .join("");

    // Додаємо клас для рекомендованого варіанту
    if (rack.spans?.some((v) => v.isRecommended)) {
      tr.classList.add("recommended");
    }

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${rack.floors}</td>
      <td>${rack.rows}</td>
      <td>${rack.rackLength}</td>
      <td>${rack.width}</td>
      <td>${rack.height}</td>
      <td>${spansHTML}</td>
    `;

    tbody.appendChild(tr);
  });
};
