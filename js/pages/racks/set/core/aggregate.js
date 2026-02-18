// js/pages/racks/set/core/aggregate.js

/**
 * Агрегація комплекту стелажів
 * @param {Array<Object>} racks
 * @returns {Array<Object>} агрегований список
 */
export const aggregateRackSet = (racks = []) => {
  const map = new Map();

  racks.forEach((rack) => {
    const key = rack.abbreviation;

    if (!map.has(key)) {
      map.set(key, {
        name: rack.description,
        abbreviation: rack.abbreviation,
        quantity: 0,
        unitPrice: rack.totalCost || 0,
      });
    }

    map.get(key).quantity += 1;
  });

  return Array.from(map.values()).map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
};
