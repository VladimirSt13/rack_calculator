import * as rackService from '../services/rackService.js';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '../helpers/audit.js';

/**
 * POST /api/rack/calculate
 * Розрахунок стелажа
 */
export const calculateRack = async (req, res, next) => {
  try {
    const config = req.body;
    const user = req.user;

    const result = await rackService.calculateRack(config, user);

    // Audit log
    if (user) {
      await logAudit({
        userId: user.userId,
        action: AUDIT_ACTIONS.RACK_SET_CREATE,
        entityType: ENTITY_TYPES.CALCULATION,
        newValue: { config, totalCost: result.total },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.json(result);
  } catch (error) {
    if (error.message === 'Price data not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * POST /api/rack/calculate-batch
 * Масовий розрахунок стелажів
 */
export const calculateRackBatch = async (req, res, next) => {
  try {
    const { racks } = req.body;

    const results = await rackService.calculateRackBatch(racks, req.user);

    res.json({ results });
  } catch (error) {
    if (error.message === 'Racks array is required and cannot be empty' || error.message === 'Price data not found') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export default {
  calculateRack,
  calculateRackBatch,
};
