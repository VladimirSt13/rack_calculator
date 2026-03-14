import * as batteryService from "../services/batteryService.js";
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from "../helpers/audit.js";

/**
 * POST /api/battery/calculate
 * Розрахунок стелажа по батареї зі збереженням конфігурації в БД
 */
export const calculateBatteryRack = async (req, res, next) => {
  try {
    const { batteryDimensions, weight, quantity, config } = req.body;

    const result = await batteryService.calculateBatteryRack(
      { batteryDimensions, weight, quantity, config },
      req.user,
    );

    // Audit log
    if (req.user) {
      await logAudit({
        userId: req.user.userId,
        action: AUDIT_ACTIONS.CREATE,
        entityType: ENTITY_TYPES.CALCULATION,
        newValue: {
          batteryDimensions,
          weight,
          quantity,
          totalCost: result.totalCost,
          rackConfigId: result.rackConfigId,
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
    }

    res.json(result);
  } catch (error) {
    if (error.message === "Price data not found") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * POST /api/battery/find-best
 * Підбір найкращого варіанту стелажа по батареї з розрахунком варіантів балок
 */
export const findBestRackForBattery = async (req, res, next) => {
  try {
    const { batteryDimensions, weight, quantity, config } = req.body;

    const result = await batteryService.findBestRackForBattery(
      { batteryDimensions, weight, quantity, config },
      req.user,
    );

    res.json(result);
  } catch (error) {
    if (
      error.message === "Battery dimensions are required" ||
      error.message === "Price data not found"
    ) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "No span options available in price data") {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export default {
  calculateBatteryRack,
  findBestRackForBattery,
};
