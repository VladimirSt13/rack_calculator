import { RackSet } from "../models/RackSet.js";
import { RackConfiguration } from "../models/RackConfiguration.js";
import { RackSetRevision } from "../models/RackSetRevision.js";
import { Price } from "../models/Price.js";
import { AuditLog } from "../models/AuditLog.js";
import { calculateRackSetTotal } from "../services/pricingService.js";

/**
 * Отримати повні дані стелажа з rack_configurations
 */
const getRackDataFromConfig = async (rackConfigId, priceData, user) => {
  const config = await RackConfiguration.findById(rackConfigId);
  if (!config || !priceData) return null;

  const rackConfig = {
    floors: config.floors,
    rows: config.rows,
    beamsPerRow: config.beamsPerRow,
    supports: config.supports,
    verticalSupports: config.verticalSupports,
    spans: config.getSpans(),
    braces: config.braces,
  };

  // Імпортуємо функцію розрахунку з кореня проекту
  const rackCalculator = await import("../../../shared/rackCalculator.js");
  const {
    calculateRackComponents,
    calculateTotalCost,
    calculateTotalWithoutIsolators,
    generateRackName,
  } = rackCalculator;

  const components = calculateRackComponents(rackConfig, priceData);
  const totalCost = calculateTotalCost(components);
  const totalWithoutIsolators = calculateTotalWithoutIsolators(components);
  const zeroPrice = totalCost * 1.44;

  // Формуємо ціни з урахуванням дозволів користувача
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

  // Визначаємо основну ціну для розрахунку totalCost
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

/**
 * GET /api/rack-sets
 * Отримати список комплектів стелажів для поточного користувача
 */
export const getRackSets = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const isAdmin = userRole === "admin";

    // Отримуємо комплекти
    const rackSets = await RackSet.findAll({ userId, isAdmin });

    // Отримати актуальний прайс для розрахунку
    const price = await Price.getCurrent();
    const priceData = price?.getData() || null;

    if (priceData) {
      // Перерахувати ціни та компоненти для кожного комплекту
      const rackSetsWithPrices = await Promise.all(
        rackSets.map(async (rackSet) => {
          const racksWithPrices = await rackSet.getRacksWithPrices(
            priceData,
            req.user,
          );
          const currentTotal = calculateRackSetTotal(racksWithPrices);

          return {
            ...rackSet.toDto(racksWithPrices),
            total_cost_snapshot: currentTotal,
            calculated_at: new Date().toISOString(),
          };
        }),
      );

      res.json({ rackSets: rackSetsWithPrices });
    } else {
      res.json({ rackSets: rackSets.map((rs) => rs.toDto()) });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rack-sets/deleted
 * Отримати видалені комплекти стелажів
 */
export const getDeletedRackSets = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const isAdmin = userRole === "admin";

    const deletedSets = await RackSet.findDeleted({ userId, isAdmin });

    res.json({ rackSets: deletedSets.map((rs) => rs.toDto()) });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rack-sets/:id
 * Отримати конкретний комплект з деталями
 */
export const getRackSet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const isAdmin = userRole === "admin";

    const rackSet = await RackSet.findById(id, { userId, isAdmin });

    if (!rackSet) {
      return res.status(404).json({
        error: "Rack set not found",
        code: "NOT_FOUND",
      });
    }

    // Отримати актуальний прайс
    const price = await Price.getCurrent();
    const priceData = price?.getData() || null;

    if (priceData && rackSet.rackItems.length > 0) {
      const racksWithPrices = await rackSet.getRacksWithPrices(
        priceData,
        req.user,
      );
      const currentTotal = calculateRackSetTotal(racksWithPrices);

      res.json({
        rackSet: {
          ...rackSet.toDto(racksWithPrices),
          total_cost_snapshot: currentTotal,
          calculated_at: new Date().toISOString(),
        },
      });
    } else {
      res.json({ rackSet: rackSet.toDto() });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rack-sets
 * Створити новий комплект стелажів
 */
export const createRackSet = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, object_name, description, rack_items } = req.body;

    // Валідація
    if (!name || !rack_items || !Array.isArray(rack_items)) {
      return res.status(400).json({
        error: "Name and rack_items array are required",
        code: "VALIDATION_ERROR",
      });
    }

    if (rack_items.length === 0) {
      return res.status(400).json({
        error: "Rack items array cannot be empty",
        code: "VALIDATION_ERROR",
      });
    }

    // Отримати актуальний прайс для розрахунку snapshot
    const price = await Price.getCurrent();
    const priceData = price?.getData() || null;

    // Розрахунок загальної вартості (snapshot)
    let totalCostSnapshot = 0;

    if (priceData && rack_items.length > 0) {
      const racksWithPrices = await Promise.all(
        rack_items.map(async (item) => {
          const rackData = await getRackDataFromConfig(
            item.rackConfigId,
            priceData,
            req.user,
          );
          return rackData ? { ...rackData, quantity: item.quantity } : null;
        }),
      );
      totalCostSnapshot = calculateRackSetTotal(
        racksWithPrices.filter(Boolean),
      );
    }

    // Створення комплекту
    const rackSet = await RackSet.create({
      userId,
      name,
      objectName: object_name,
      description,
      rackItems: rack_items,
      totalCostSnapshot,
    });

    // Audit log
    await AuditLog.create({
      userId,
      action: "create",
      entityType: "rack_set",
      entityId: rackSet.id,
      newValue: {
        name,
        object_name,
        total_cost_snapshot: totalCostSnapshot,
        racks_count: rack_items.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      message: "Rack set created successfully",
      rackSet: rackSet.toDto(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/rack-sets/:id
 * Оновити існуючий комплект
 */
export const updateRackSet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { name, object_name, description, rack_items } = req.body;

    const rackSet = await RackSet.findById(id, { userId, isAdmin: false });

    if (!rackSet) {
      return res.status(404).json({
        error: "Rack set not found",
        code: "NOT_FOUND",
      });
    }

    // Підготовка даних для оновлення
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (object_name !== undefined) updateData.objectName = object_name;
    if (description !== undefined) updateData.description = description;

    // Оновлення rack_items та перерахунок total_cost_snapshot
    if (rack_items !== undefined) {
      updateData.rackItems = rack_items;

      // Перерахунок total_cost_snapshot з актуального прайсу
      const price = await Price.getCurrent();
      const priceData = price?.getData() || null;

      if (priceData && rack_items.length > 0) {
        const racksWithPrices = await Promise.all(
          rack_items.map(async (item) => {
            const rackData = await getRackDataFromConfig(
              item.rackConfigId,
              priceData,
              req.user,
            );
            return rackData ? { ...rackData, quantity: item.quantity } : null;
          }),
        );
        updateData.totalCostSnapshot = calculateRackSetTotal(
          racksWithPrices.filter(Boolean),
        );
      }
    }

    await rackSet.update(updateData);

    // Audit log
    await AuditLog.create({
      userId,
      action: "update",
      entityType: "rack_set",
      entityId: parseInt(id),
      newValue: { name, object_name, description, rack_items },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      message: "Rack set updated successfully",
      rackSet: rackSet.toDto(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/rack-sets/:id
 * Видалити комплект стелажів (soft delete)
 */
export const deleteRackSet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const rackSet = await RackSet.findById(id, { userId, isAdmin: false });

    if (!rackSet) {
      return res.status(404).json({
        error: "Rack set not found",
        code: "NOT_FOUND",
      });
    }

    // Soft delete
    await rackSet.softDelete();

    // Audit log
    await AuditLog.create({
      userId,
      action: "delete",
      entityType: "rack_set",
      entityId: parseInt(id),
      oldValue: { name: rackSet.name },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ message: "Rack set deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rack-sets/:id/restore
 * Відновити видалений комплект
 */
export const restoreRackSet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const isAdmin = userRole === "admin";

    // Для відновлення потрібно знайти видалений комплект
    const rackSet = await RackSet.findById(id, {
      userId,
      isAdmin,
      includeDeleted: true,
    });

    if (!rackSet) {
      return res.status(404).json({
        error: "Rack set not found",
        code: "NOT_FOUND",
      });
    }

    if (!rackSet.deleted) {
      return res.status(400).json({
        error: "Rack set is not deleted",
        code: "NOT_DELETED",
      });
    }

    // Відновлення
    await rackSet.restore();

    // Audit log
    await AuditLog.create({
      userId,
      action: "restore",
      entityType: "rack_set",
      entityId: parseInt(id),
      newValue: { name: rackSet.name },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ message: "Rack set restored successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/rack-sets/:id/hard
 * Повне видалення комплекту (для адміністраторів)
 */
export const hardDeleteRackSet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        error: "Admin access required",
        code: "FORBIDDEN",
      });
    }

    const rackSet = await RackSet.findById(id, {
      isAdmin: true,
      includeDeleted: true,
    });

    if (!rackSet) {
      return res.status(404).json({
        error: "Rack set not found",
        code: "NOT_FOUND",
      });
    }

    // Видалення з БД
    await RackSet.delete("rack_sets", id);

    // Audit log
    await AuditLog.create({
      userId: req.user.userId,
      action: "hard_delete",
      entityType: "rack_set",
      entityId: parseInt(id),
      oldValue: { name: rackSet.name },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ message: "Rack set permanently deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rack-sets/:id/revision
 * Створити ревізію комплекту (зберегти історію змін)
 */
export const createRackSetRevision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { comment } = req.body;

    const rackSet = await RackSet.findById(id, { userId, isAdmin: false });

    if (!rackSet) {
      return res.status(404).json({
        error: "Rack set not found",
        code: "NOT_FOUND",
      });
    }

    // Створення ревізії
    const revision = await RackSetRevision.createFromChange({
      rackSetId: id,
      userId,
      racksSnapshot: rackSet.rackItems,
      totalCostSnapshot: rackSet.totalCostSnapshot,
      comment,
    });

    // Audit log
    await AuditLog.create({
      userId,
      action: "create",
      entityType: "rack_set_revision",
      entityId: revision.id,
      newValue: { rack_set_id: id, comment },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      message: "Revision created successfully",
      revision: revision.toDto(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rack-sets/:id/revisions
 * Отримати історію ревізій комплекту
 */
export const getRackSetRevisions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const rackSet = await RackSet.findById(id, { userId, isAdmin: false });

    if (!rackSet) {
      return res.status(404).json({
        error: "Rack set not found",
        code: "NOT_FOUND",
      });
    }

    const revisions = await RackSetRevision.findByRackSetId(id);

    res.json({ revisions: revisions.map((rev) => rev.toDto()) });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rack-sets/cleanup
 * Очищення видалених комплектів (для cron)
 */
export const cleanupDeletedRackSets = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const deletedCount = await RackSet.cleanupDeleted(days);

    res.json({
      message: `Deleted ${deletedCount} rack sets older than ${days} days`,
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getRackSets,
  getDeletedRackSets,
  getRackSet,
  createRackSet,
  updateRackSet,
  deleteRackSet,
  restoreRackSet,
  hardDeleteRackSet,
  createRackSetRevision,
  getRackSetRevisions,
  cleanupDeletedRackSets,
};
