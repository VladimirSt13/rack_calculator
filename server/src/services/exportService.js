import { getDb } from "../db/index.js";
import {
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateRackName,
} from "../../../shared/rackCalculator.js";
import { getCurrentPriceData } from "./priceService.js";

export const getRackDataFromConfig = async (rackConfigId, priceData, user) => {
  const db = await getDb();
  const config = db
    .prepare("SELECT * FROM rack_configurations WHERE id = ?")
    .get(rackConfigId);

  if (!config || !priceData) return null;

  const rackConfig = {
    floors: config.floors,
    rows: config.rows,
    beamsPerRow: config.beams_per_row,
    supports: config.supports || null,
    verticalSupports: config.vertical_supports
      ? JSON.parse(config.vertical_supports)
      : null,
    spans: config.spans ? JSON.parse(config.spans) : null,
  };

  if (
    Array.isArray(rackConfig.spans) &&
    typeof rackConfig.spans[0] === "number"
  ) {
    const spansMap = new Map();
    rackConfig.spans.forEach((span) => {
      const key = String(span);
      spansMap.set(key, (spansMap.get(key) || 0) + 1);
    });
    rackConfig.spans = Array.from(spansMap.entries()).map(
      ([item, quantity]) => ({ item, quantity }),
    );
  }

  const components = calculateRackComponents(rackConfig, priceData);
  const totalCost = calculateTotalCost(components);
  const totalWithoutIsolators = calculateTotalWithoutIsolators(components);
  const zeroPrice = totalCost * 1.44;

  const permissions = user?.permissions || { price_types: [] };
  const prices = [];

  if (permissions.price_types?.includes("базова")) {
    prices.push({
      type: "базова",
      label: "Базова ціна",
      value: Math.round(totalCost * 100) / 100,
    });
  }
  if (permissions.price_types?.includes("без_ізоляторів")) {
    prices.push({
      type: "без_ізоляторів",
      label: "Без ізоляторів",
      value: Math.round(totalWithoutIsolators * 100) / 100,
    });
  }
  if (permissions.price_types?.includes("нульова")) {
    prices.push({
      type: "нульова",
      label: "Нульова ціна",
      value: Math.round(zeroPrice * 100) / 100,
    });
  }

  let mainTotalCost = 0;
  if (permissions.price_types?.includes("нульова")) {
    mainTotalCost = zeroPrice;
  } else if (permissions.price_types?.includes("без_ізоляторів")) {
    mainTotalCost = totalWithoutIsolators;
  } else if (permissions.price_types?.includes("базова")) {
    mainTotalCost = totalCost;
  }

  return {
    rackConfigId: config.id,
    name: generateRackName(rackConfig),
    config: rackConfig,
    components,
    prices,
    totalCost: mainTotalCost,
  };
};

export const getRackSetWithDetails = async (id, { userId, isAdmin }, user) => {
  const db = await getDb();

  let rackSet;
  if (isAdmin) {
    rackSet = db
      .prepare(
        "SELECT id, name, object_name, description, rack_items, total_cost_snapshot, created_at FROM rack_sets WHERE id = ?",
      )
      .get(id);
  } else {
    rackSet = db
      .prepare(
        "SELECT id, name, object_name, description, rack_items, total_cost_snapshot, created_at FROM rack_sets WHERE id = ? AND user_id = ?",
      )
      .get(id, userId);
  }

  if (!rackSet) return null;

  const priceData = await getCurrentPriceData();
  const rackItems = rackSet.rack_items ? JSON.parse(rackSet.rack_items) : [];
  const racks = (
    await Promise.all(
      rackItems.map(async (item) => {
        const rackData = await getRackDataFromConfig(
          item.rackConfigId,
          priceData,
          user,
        );
        return rackData ? { ...rackData, quantity: item.quantity } : null;
      }),
    )
  ).filter(Boolean);

  return { ...rackSet, racks, priceData };
};

export const getNewRackSetData = async (rackItems, user) => {
  if (!rackItems || !Array.isArray(rackItems) || rackItems.length === 0) {
    throw new Error("Rack items array is required and cannot be empty");
  }

  const priceData = await getCurrentPriceData();
  const racks = (
    await Promise.all(
      rackItems.map(async (item) => {
        const rackData = await getRackDataFromConfig(
          item.rackConfigId,
          priceData,
          user,
        );
        return rackData ? { ...rackData, quantity: item.quantity } : null;
      }),
    )
  ).filter(Boolean);

  return racks;
};

export default {
  getRackDataFromConfig,
  getCurrentPriceData,
  getRackSetWithDetails,
  getNewRackSetData,
};
