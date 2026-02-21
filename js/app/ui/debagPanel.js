// js/app/ui/debagPanel.js

/**
 * Створює debug panel для контекстів з toggle клавішею, підсвіткою змін і кнопкою згортання
 * @param {Object} contexts - об'єкт з контекстами сторінки { rackPage, rackCalculator, rackSet }
 * @returns {Object} panel API
 */
export const createDevPanel = (contexts) => {
  const panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.right = "0";
  panel.style.top = "0";
  panel.style.width = "320px";
  panel.style.maxHeight = "90vh";
  panel.style.overflowY = "auto";
  panel.style.backgroundColor = "rgba(0,0,0,0.85)";
  panel.style.color = "#fff";
  panel.style.fontSize = "12px";
  panel.style.padding = "10px";
  panel.style.zIndex = "9999";
  panel.style.fontFamily = "monospace";
  panel.style.whiteSpace = "pre-wrap";
  panel.style.borderLeft = "2px solid #0f0";
  panel.style.transition = "opacity 0.2s, height 0.2s";
  panel.style.opacity = "1";

  // --- кнопка згортання ---
  const toggleBtn = document.createElement("button");
  toggleBtn.innerText = "▼";
  toggleBtn.style.position = "absolute";
  toggleBtn.style.left = "-24px";
  toggleBtn.style.top = "0";
  toggleBtn.style.width = "24px";
  toggleBtn.style.height = "24px";
  toggleBtn.style.background = "#0f0";
  toggleBtn.style.color = "#000";
  toggleBtn.style.border = "none";
  toggleBtn.style.cursor = "pointer";
  panel.appendChild(toggleBtn);

  let collapsed = false;
  toggleBtn.addEventListener("click", () => {
    collapsed = !collapsed;
    panel.style.height = collapsed ? "24px" : "auto";
    panel.style.overflowY = collapsed ? "hidden" : "auto";
  });

  document.body.appendChild(panel);

  let prevStateSnapshot = {};

  const ensureInit = (value, name) => {
    if (!value) throw new Error(`${name} is not initialized`);
    return value;
  };

  const renderPanel = () => {
    const output = Object.entries(contexts)
      .map(([name, ctx]) => {
        if (!ctx.selectors) return `[${name}] not initialized\n`;

        const stateCopy = ctx.selectors.getState();
        const computed = Object.keys(ctx.selectors)
          .filter((k) => k.startsWith("get") && !["getState"].includes(k))
          .reduce((acc, key) => {
            try {
              acc[key] = ctx.selectors[key]();
            } catch {
              acc[key] = "error";
            }
            return acc;
          }, {});

        const merged = { ...stateCopy, ...computed };

        const lines = Object.entries(merged).map(([k, v]) => {
          const prevVal = prevStateSnapshot[name]?.[k];
          const changed = prevVal !== undefined && prevVal !== v;
          return changed ? `<span style="color:#0f0">${k}: ${JSON.stringify(v)}</span>` : `${k}: ${JSON.stringify(v)}`;
        });

        prevStateSnapshot[name] = merged;
        return `<strong>[${name}]</strong>\n` + lines.join("\n");
      })
      .join("\n\n");

    panel.innerHTML = output;
  };

  // --- Підписка на state ---
  const unsubscribes = Object.values(contexts)
    .map((ctx) => ctx.state?.subscribe(renderPanel))
    .filter(Boolean);

  // --- Toggle через клавішу D ---
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "d") {
      panel.style.opacity = panel.style.opacity === "0" ? "1" : "0";
      panel.style.pointerEvents = panel.style.opacity === "0" ? "none" : "auto";
    }
  });

  // Перший рендер
  renderPanel();

  return {
    destroy: () => {
      unsubscribes.forEach((u) => u());
      panel.remove();
    },
    render: renderPanel,
  };
};
