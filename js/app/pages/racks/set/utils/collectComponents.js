/**
 * Збирає всі компоненти стелажа в єдиний масив
 * @param {Object} components - об'єкт components з стелажа
 * @returns {Array<{name: string, amount: number}>}
 */
export const collectComponents = (components) => {
  const result = [];

  if (!components || typeof components !== "object") return result;

  for (const key of Object.keys(components)) {
    const value = components[key];
    if (!value) continue;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item?.name && item?.amount) {
          result.push({ name: item.name, amount: item.amount ?? 0 });
        }
      });
    } else if (typeof value === "object" && value?.name && value?.amount) {
      result.push({ name: value.name, amount: value.amount ?? 0 });
    } else if (typeof value === "object" && !value?.name) {
      const nested = collectComponents(value);
      result.push(...nested);
    }
  }

  return result;
};
