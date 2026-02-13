/**
 * Універсальна "жива" панель стейту.
 * - Автоматичне оновлення при виклику render
 * - Підсвічування змінених полів
 * - Підтримка прокрутки
 * - Кнопка згортання
 */

export const createLiveStatePanel = (options = {}) => {
  const {
    position = "top-right",
    title = "State Panel",
    highlightDuration = 500,
    maxHeight = "40vh",
    width = "260px",
  } = options;

  let isCollapsed = false;

  const panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.zIndex = 1000;
  panel.style.padding = "8px";
  panel.style.background = "rgba(0,0,0,0.8)";
  panel.style.color = "#fff";
  panel.style.fontFamily = "monospace";
  panel.style.fontSize = "12px";
  panel.style.borderRadius = "6px";
  panel.style.width = width;
  panel.style.maxHeight = maxHeight;
  panel.style.overflowY = "auto";
  panel.style.overflowX = "hidden";

  switch (position) {
    case "top-right":
      panel.style.top = "10px";
      panel.style.right = "10px";
      break;
    case "top-left":
      panel.style.top = "10px";
      panel.style.left = "10px";
      break;
    case "bottom-right":
      panel.style.bottom = "10px";
      panel.style.right = "10px";
      break;
    case "bottom-left":
      panel.style.bottom = "10px";
      panel.style.left = "10px";
      break;
  }

  document.body.appendChild(panel);

  const render = (stateObj, changedKey = null) => {
    const bodyHtml = Object.entries(stateObj)
      .map(([key, value]) => {
        let display;
        if (Array.isArray(value)) {
          display = `[${value.length}] ${value.join(", ")}`;
        } else if (typeof value === "object" && value !== null) {
          display = JSON.stringify(value);
        } else {
          display = value;
        }

        const highlight = key === changedKey ? "background:#ffd700;color:#000;border-radius:3px;padding:2px;" : "";

        return `<div style="margin-bottom:4px; word-break:break-word; ${highlight}">
                  <strong>${key}:</strong> ${display}
                </div>`;
      })
      .join("");

    panel.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
        <strong>${title}</strong>
        <button
          data-toggle
          style="
            background:none;
            border:none;
            color:#fff;
            cursor:pointer;
            font-size:14px;
            padding:0 4px;
          "
          title="Згорнути / розгорнути"
        >
          ${isCollapsed ? "▢" : "—"}
        </button>
      </div>

      ${isCollapsed ? "" : `<div data-body>${bodyHtml}</div>`}
    `;

    const toggleBtn = panel.querySelector("[data-toggle]");
    toggleBtn.onclick = () => {
      isCollapsed = !isCollapsed;
      render(stateObj);
    };

    if (changedKey && !isCollapsed) {
      setTimeout(() => render(stateObj), highlightDuration);
    }
  };

  const destroy = () => {
    panel.remove();
  };

  return { render, destroy };
};
