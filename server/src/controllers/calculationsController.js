import * as calculationsService from "../services/calculationsService.js";

/**
 * GET /api/calculations
 * Отримати список розрахунків користувача
 */
export const getCalculations = async (req, res, next) => {
  try {
    const { type, limit = 50 } = req.query;

    const calculations = await calculationsService.getCalculations(
      req.user.userId,
      { type, limit },
    );

    res.json({ calculations });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/calculations
 * Зберегти новий розрахунок
 */
export const createCalculation = async (req, res, next) => {
  try {
    const { name, type, data } = req.body;

    const calculation = await calculationsService.createCalculation(
      req.user.userId,
      { name, type, data },
    );

    res.status(201).json({ calculation });
  } catch (error) {
    if (
      error.message === "Invalid calculation data" ||
      error.message === 'Invalid type. Must be "rack" or "battery"'
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * GET /api/calculations/:id
 * Отримати конкретний розрахунок
 */
export const getCalculation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const calculation = await calculationsService.getCalculation(
      req.user.userId,
      id,
    );

    if (!calculation) {
      return res.status(404).json({ error: "Calculation not found" });
    }

    res.json({ calculation });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/calculations/:id
 * Видалити розрахунок
 */
export const deleteCalculation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await calculationsService.deleteCalculation(
      req.user.userId,
      id,
    );

    if (!deleted) {
      return res.status(404).json({ error: "Calculation not found" });
    }

    res.json({ message: "Calculation deleted successfully" });
  } catch (error) {
    next(error);
  }
};
