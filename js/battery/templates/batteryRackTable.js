// js/battery/templates/batteryRackTable.js
export const renderBatteryTable = (options) => {
  const tbody = document.querySelector("#batteryRackTable tbody");
  tbody.innerHTML = options
    .map(
      (o) => `
    <tr>
      <td>${o.type}</td>
      <td>${o.spans}</td>
      <td>${o.totalPrice}</td>
    </tr>
  `,
    )
    .join("");
};
