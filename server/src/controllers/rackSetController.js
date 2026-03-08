import { getDb } from '../db/index.js';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '../helpers/audit.js';
import { calculateRackSetPrices, calculateRackSetTotal } from '../services/pricingService.js';

/**
 * Отримати повні дані стелажа з rack_configurations
 */
const getRackDataFromConfig = async (db, rackConfigId, priceData, user) => {
  const config = db.prepare(`
    SELECT * FROM rack_configurations WHERE id = ?
  `).get(rackConfigId);

  if (!config || !priceData) return null;

  // Парсинг JSON полів
  const rackConfig = {
    floors: config.floors,
    rows: config.rows,
    beamsPerRow: config.beams_per_row,
    supports: config.supports || null,  // Простий рядок, не JSON
    verticalSupports: config.vertical_supports ? JSON.parse(config.vertical_supports) : null,
    spans: config.spans ? JSON.parse(config.spans) : null,
  };

  // Імпортуємо функцію розрахунку
  const rackCalculator = await import('../../../shared/rackCalculator.js');
  const { calculateRackComponents, calculateTotalCost, calculateTotalWithoutIsolators, generateRackName } = rackCalculator;

  const components = calculateRackComponents(rackConfig, priceData);
  const totalCost = calculateTotalCost(components);
  const totalWithoutIsolators = calculateTotalWithoutIsolators(components);
  const zeroPrice = totalCost * 1.44;

  // Формуємо ціни з урахуванням дозволів користувача
  const permissions = user?.permissions || { price_types: [] };
  const prices = [];

  if (permissions.price_types?.includes('базова')) {
    prices.push({ type: 'базова', label: 'Базова ціна', value: Math.round(totalCost * 100) / 100 });
  }
  if (permissions.price_types?.includes('без_ізоляторів')) {
    prices.push({ type: 'без_ізоляторів', label: 'Без ізоляторів', value: Math.round(totalWithoutIsolators * 100) / 100 });
  }
  if (permissions.price_types?.includes('нульова')) {
    prices.push({ type: 'нульова', label: 'Нульова ціна', value: Math.round(zeroPrice * 100) / 100 });
  }

  // Визначаємо основну ціну для розрахунку totalCost
  // Якщо є дозвіл на "нульова" - використовуємо її, інакше "без ізоляторів" або "базова"
  // Якщо немає дозволів на ціни - повертаємо 0
  let mainTotalCost = 0;
  if (permissions.price_types?.includes('нульова')) {
    mainTotalCost = zeroPrice;
  } else if (permissions.price_types?.includes('без_ізоляторів')) {
    mainTotalCost = totalWithoutIsolators;
  } else if (permissions.price_types?.includes('базова')) {
    mainTotalCost = totalCost;
  } else {
    mainTotalCost = 0;  // Немає дозволів на ціни
  }

  return {
    rackConfigId: config.id,
    name: generateRackName(rackConfig),
    config: rackConfig,
    components,
    prices,
    totalCost: mainTotalCost,  // Використовуємо основну ціну для totalCost
  };
};

/**
 * GET /api/rack-sets
 * Отримати список комплектів стелажів для поточного користувача
 */
export const getRackSets = async (req, res, next) => {
  try {
    const db = await getDb();
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Перевіряємо чи є користувач адміністратором
    const isAdmin = userRole === 'admin';

    // Отримуємо комплекти: для адміністраторів - всі, для інших - тільки свої
    const rackSets = isAdmin
      ? db.prepare(`
        SELECT
          id,
          user_id,
          name,
          object_name,
          description,
          rack_items,
          total_cost_snapshot,
          created_at,
          updated_at
        FROM rack_sets
        ORDER BY created_at DESC
      `).all()
      : db.prepare(`
        SELECT
          id,
          user_id,
          name,
          object_name,
          description,
          rack_items,
          total_cost_snapshot,
          created_at,
          updated_at
        FROM rack_sets
        WHERE user_id = ?
        ORDER BY created_at DESC
      `).all(userId);

    // Отримати актуальний прайс для розрахунку
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    const priceData = priceRecord ? JSON.parse(priceRecord.data) : null;

    if (priceData) {
      // Перерахувати ціни та компоненти для кожного комплекту
      const rackSetsWithPrices = await Promise.all(rackSets.map(async (rackSet) => {
        const rackItems = rackSet.rack_items ? JSON.parse(rackSet.rack_items) : [];

        // Отримати повні дані для кожного стелажа
        const racksWithPrices = (await Promise.all(rackItems.map(async (item) => {
          const rackData = await getRackDataFromConfig(db, item.rackConfigId, priceData, req.user);
          return rackData ? { ...rackData, quantity: item.quantity } : null;
        }))).filter(Boolean);

        const currentTotal = calculateRackSetTotal(racksWithPrices);

        return {
          ...rackSet,
          racks: racksWithPrices,
          total_cost_snapshot: currentTotal,
          calculated_at: new Date().toISOString(),
        };
      }));

      res.json({ rackSets: rackSetsWithPrices });
    } else {
      res.json({ rackSets });
    }
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
    const db = await getDb();
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Перевіряємо чи є користувач адміністратором
    const isAdmin = userRole === 'admin';

    // Отримати комплект: для адміністраторів - будь-який, для інших - тільки свій
    let rackSet;
    if (isAdmin) {
      rackSet = db.prepare(`
        SELECT
          id,
          user_id,
          name,
          object_name,
          description,
          rack_items,
          total_cost_snapshot,
          created_at,
          updated_at
        FROM rack_sets
        WHERE id = ?
      `).get(id);
    } else {
      rackSet = db.prepare(`
        SELECT
          id,
          user_id,
          name,
          object_name,
          description,
          rack_items,
          total_cost_snapshot,
          created_at,
          updated_at
        FROM rack_sets
        WHERE id = ? AND user_id = ?
      `).get(id, userId);
    }

    if (!rackSet) {
      return res.status(404).json({
        error: 'Rack set not found',
        code: 'NOT_FOUND'
      });
    }

    // Отримати актуальний прайс
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    const priceData = priceRecord ? JSON.parse(priceRecord.data) : null;

    if (priceData && rackSet.rack_items) {
      // Отримати повні дані для кожного стелажа
      const rackItems = JSON.parse(rackSet.rack_items);
      const racksWithPrices = (await Promise.all(rackItems.map(async (item) => {
        const rackData = await getRackDataFromConfig(db, item.rackConfigId, priceData, req.user);
        return rackData ? { ...rackData, quantity: item.quantity } : null;
      }))).filter(Boolean);

      const currentTotal = calculateRackSetTotal(racksWithPrices);

      res.json({
        rackSet: {
          ...rackSet,
          racks: racksWithPrices,
          total_cost_snapshot: currentTotal,
          calculated_at: new Date().toISOString(),
        }
      });
    } else {
      // Повертаємо тільки rack_items без розрахунку
      res.json({ rackSet });
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
    const db = await getDb();
    const userId = req.user.userId;
    const { name, object_name, description, rack_items } = req.body;

    // Валідація
    if (!name || !rack_items || !Array.isArray(rack_items)) {
      return res.status(400).json({
        error: 'Name and rack_items array are required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (rack_items.length === 0) {
      return res.status(400).json({
        error: 'Rack items array cannot be empty',
        code: 'VALIDATION_ERROR'
      });
    }

    // Отримати актуальний прайс для розрахунку snapshot
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    const priceData = priceRecord ? JSON.parse(priceRecord.data) : null;

    // Розрахунок загальної вартості (snapshot)
    let totalCostSnapshot = 0;

    if (priceData && rack_items.length > 0) {
      // Отримати повні дані для кожного стелажа та розрахувати ціни
      const racksWithPrices = (await Promise.all(rack_items.map(async (item) => {
        const rackData = await getRackDataFromConfig(db, item.rackConfigId, priceData, req.user);
        return rackData ? { ...rackData, quantity: item.quantity } : null;
      }))).filter(Boolean);

      totalCostSnapshot = calculateRackSetTotal(racksWithPrices);
    }

    // Створення комплекту
    const result = db.prepare(`
      INSERT INTO rack_sets (
        user_id, name, object_name, description,
        rack_items, total_cost_snapshot
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      name,
      object_name || null,
      description || null,
      JSON.stringify(rack_items),
      totalCostSnapshot
    );

    const rackSetId = result.lastInsertRowid;

    // Audit log
    await logAudit({
      userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.RACK_SET,
      entityId: rackSetId,
      newValue: {
        name,
        object_name,
        total_cost_snapshot: totalCostSnapshot,
        racks_count: rack_items.length
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      message: 'Rack set created successfully',
      rackSet: {
        id: rackSetId,
        name,
        object_name: object_name || null,
        description: description || null,
        total_cost_snapshot: totalCostSnapshot,
        racks_count: rack_items.length
      }
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
    const db = await getDb();
    const { id } = req.params;
    const userId = req.user.userId;
    const { name, object_name, description, rack_items } = req.body;

    // Перевірка чи існує комплект
    const existing = db.prepare(`
      SELECT id, user_id, rack_items, total_cost_snapshot
      FROM rack_sets
      WHERE id = ? AND user_id = ?
    `).get(id, userId);

    if (!existing) {
      return res.status(404).json({
        error: 'Rack set not found',
        code: 'NOT_FOUND'
      });
    }

    // Підготовка даних для оновлення
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (object_name !== undefined) {
      updates.push('object_name = ?');
      values.push(object_name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    // Оновлення rack_items та перерахунок total_cost_snapshot
    if (rack_items !== undefined) {
      updates.push('rack_items = ?');
      values.push(JSON.stringify(rack_items));

      // Перерахунок total_cost_snapshot з актуального прайсу
      const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
      if (priceRecord && rack_items.length > 0) {
        const priceData = JSON.parse(priceRecord.data);
        const racksWithPrices = (await Promise.all(rack_items.map(async (item) => {
          const rackData = await getRackDataFromConfig(db, item.rackConfigId, priceData, req.user);
          return rackData ? { ...rackData, quantity: item.quantity } : null;
        }))).filter(Boolean);

        const totalCostSnapshot = calculateRackSetTotal(racksWithPrices);
        updates.push('total_cost_snapshot = ?');
        values.push(totalCostSnapshot);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No fields to update',
        code: 'VALIDATION_ERROR'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, userId);

    const updateQuery = `
      UPDATE rack_sets
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `;

    db.prepare(updateQuery).run(...values);

    // Audit log
    await logAudit({
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.RACK_SET,
      entityId: id,
      newValue: { name, object_name, description, rack_items },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      message: 'Rack set updated successfully',
      rackSet: {
        id: parseInt(id),
        name: name || existing.name,
        object_name: object_name !== undefined ? object_name : existing.object_name,
        description: description !== undefined ? description : existing.description
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/rack-sets/:id
 * Видалити комплект стелажів
 */
export const deleteRackSet = async (req, res, next) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const userId = req.user.userId;

    // Перевірка чи існує комплект
    const existing = db.prepare(`
      SELECT id, name
      FROM rack_sets
      WHERE id = ? AND user_id = ?
    `).get(id, userId);

    if (!existing) {
      return res.status(404).json({
        error: 'Rack set not found',
        code: 'NOT_FOUND'
      });
    }

    // Видалення
    db.prepare(`
      DELETE FROM rack_sets
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

    // Audit log
    await logAudit({
      userId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: ENTITY_TYPES.RACK_SET,
      entityId: id,
      oldValue: { name: existing.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Rack set deleted successfully' });
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
    const db = await getDb();
    const { id } = req.params;
    const userId = req.user.userId;
    const { comment } = req.body;

    // Отримання поточного стану комплекту
    const rackSet = db.prepare(`
      SELECT id, name, rack_items, total_cost_snapshot
      FROM rack_sets
      WHERE id = ? AND user_id = ?
    `).get(id, userId);

    if (!rackSet) {
      return res.status(404).json({
        error: 'Rack set not found',
        code: 'NOT_FOUND'
      });
    }

    // Створення ревізії з rack_items snapshot
    const result = db.prepare(`
      INSERT INTO rack_set_revisions (rack_set_id, racks_snapshot, total_cost_snapshot, comment)
      VALUES (?, ?, ?, ?)
    `).run(id, rackSet.rack_items, rackSet.total_cost_snapshot, comment || null);

    const revisionId = result.lastInsertRowid;

    // Audit log
    await logAudit({
      userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.RACK_SET_REVISION,
      entityId: revisionId,
      newValue: { rack_set_id: id, comment },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      message: 'Revision created successfully',
      revision: {
        id: revisionId,
        rack_set_id: id,
        comment: comment || null,
        created_at: new Date().toISOString()
      }
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
    const db = await getDb();
    const { id } = req.params;
    const userId = req.user.userId;

    // Перевірка доступу до комплекту
    const rackSet = db.prepare(`
      SELECT id FROM rack_sets
      WHERE id = ? AND user_id = ?
    `).get(id, userId);

    if (!rackSet) {
      return res.status(404).json({
        error: 'Rack set not found',
        code: 'NOT_FOUND'
      });
    }

    const revisions = db.prepare(`
      SELECT id, rack_set_id, comment, total_cost_snapshot, created_at
      FROM rack_set_revisions
      WHERE rack_set_id = ?
      ORDER BY created_at DESC
    `).all(id);

    res.json({ revisions });
  } catch (error) {
    next(error);
  }
};

export default {
  getRackSets,
  getRackSet,
  createRackSet,
  updateRackSet,
  deleteRackSet,
  createRackSetRevision,
  getRackSetRevisions,
};
