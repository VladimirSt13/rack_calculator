import { getDb } from '../db/index.js';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '../helpers/audit.js';
import { calculateRackSetPrices, calculateRackSetTotal } from '../services/pricingService.js';

/**
 * GET /api/rack-sets
 * Отримати список комплектів стелажів для поточного користувача
 */
export const getRackSets = async (req, res, next) => {
  try {
    const db = await getDb();
    const userId = req.user.userId;

    const rackSets = db.prepare(`
      SELECT
        id,
        user_id,
        name,
        object_name,
        description,
        total_cost,
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
      // Перерахувати total_cost та racks для кожного комплекту
      const rackSetsWithPrices = await Promise.all(rackSets.map(async (rackSet) => {
        const racks = db.prepare('SELECT racks FROM rack_sets WHERE id = ?').get(rackSet.id);
        const racksData = JSON.parse(racks.racks);

        // Розрахувати ціни для всіх стелажів
        const racksWithPrices = await calculateRackSetPrices(racksData, req.user, priceData);
        const currentTotal = calculateRackSetTotal(racksWithPrices);

        return {
          ...rackSet,
          racks: racksWithPrices,
          total_cost: currentTotal,
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

    const rackSet = db.prepare(`
      SELECT
        id,
        user_id,
        name,
        object_name,
        description,
        racks,
        total_cost,
        created_at,
        updated_at
      FROM rack_sets
      WHERE id = ? AND user_id = ?
    `).get(id, userId);

    if (!rackSet) {
      return res.status(404).json({
        error: 'Rack set not found',
        code: 'NOT_FOUND'
      });
    }

    // Парсинг JSON даних
    const racksData = JSON.parse(rackSet.racks);

    // Отримати актуальний прайс
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    const priceData = priceRecord ? JSON.parse(priceRecord.data) : null;

    if (priceData) {
      // Розрахувати ціни для кожного стелажа
      const racksWithPrices = await calculateRackSetPrices(racksData, req.user, priceData);

      // Розрахувати актуальну загальну вартість
      const currentTotal = calculateRackSetTotal(racksWithPrices);

      res.json({
        rackSet: {
          ...rackSet,
          racks: racksWithPrices,
          total_cost: currentTotal,
          calculated_at: new Date().toISOString(),
        }
      });
    } else {
      rackSet.racks = racksData;
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
    const { name, object_name, description, racks, rack_items } = req.body;

    // Валідація
    if (!name || (!racks || !rack_items) || (!Array.isArray(racks) && !Array.isArray(rack_items))) {
      return res.status(400).json({
        error: 'Name and racks array or rack_items array are required',
        code: 'VALIDATION_ERROR'
      });
    }

    const itemsArray = rack_items || racks;
    if (itemsArray.length === 0) {
      return res.status(400).json({
        error: 'Racks array cannot be empty',
        code: 'VALIDATION_ERROR'
      });
    }

    // Отримати актуальний прайс для розрахунку snapshot
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
    const priceData = priceRecord ? JSON.parse(priceRecord.data) : null;

    // Розрахунок загальної вартості (snapshot)
    let totalCostSnapshot = 0;

    if (priceData && itemsArray.length > 0) {
      const racksWithPrices = await calculateRackSetPrices(itemsArray, req.user, priceData);
      totalCostSnapshot = calculateRackSetTotal(racksWithPrices);
    }

    // Підготовка даних для збереження
    // Зберігаємо в rack_items_new для нової структури
    const rackItemsNew = itemsArray.map(item => ({
      rackConfigId: item.rackConfigId || item.id,
      quantity: item.quantity || 1,
    }));

    // Створення комплекту
    const result = db.prepare(`
      INSERT INTO rack_sets (
        user_id, name, object_name, description, 
        racks, rack_items_new, total_cost_snapshot
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, 
      name, 
      object_name || null, 
      description || null, 
      JSON.stringify(itemsArray), // зберігаємо оригінальні дані для зворотної сумісності
      JSON.stringify(rackItemsNew), // нова структура
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
        racks_count: itemsArray.length 
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
        racks_count: itemsArray.length
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
    const { name, object_name, description, racks, rack_items } = req.body;

    // Перевірка чи існує комплект
    const existing = db.prepare(`
      SELECT id, user_id, racks, rack_items_new, total_cost_snapshot
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
    
    // Оновлення нової структури rack_items
    if (rack_items !== undefined) {
      updates.push('rack_items_new = ?');
      values.push(JSON.stringify(rack_items));

      // Перерахунок total_cost_snapshot з актуального прайсу
      const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();
      if (priceRecord && rack_items.length > 0) {
        const priceData = JSON.parse(priceRecord.data);
        const racksWithPrices = await calculateRackSetPrices(rack_items, req.user, priceData);
        const totalCostSnapshot = calculateRackSetTotal(racksWithPrices);
        updates.push('total_cost_snapshot = ?');
        values.push(totalCostSnapshot);
      }
    }
    
    // Оновлення старої структури racks (для зворотної сумісності)
    if (racks !== undefined) {
      updates.push('racks = ?');
      values.push(JSON.stringify(racks));

      // Перерахунок загальної вартості
      const totalCost = racks.reduce((sum, rack) => {
        const rackTotal = rack.totalCost || rack.total_cost || 0;
        const quantity = rack.quantity || 1;
        return sum + (rackTotal * quantity);
      }, 0);
      updates.push('total_cost_snapshot = ?');
      values.push(totalCost);
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
      newValue: { name, object_name, description, racks },
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
      SELECT id, name, racks, total_cost
      FROM rack_sets
      WHERE id = ? AND user_id = ?
    `).get(id, userId);

    if (!rackSet) {
      return res.status(404).json({
        error: 'Rack set not found',
        code: 'NOT_FOUND'
      });
    }

    // Створення ревізії
    const result = db.prepare(`
      INSERT INTO rack_set_revisions (rack_set_id, racks_snapshot, total_cost_snapshot, comment)
      VALUES (?, ?, ?, ?)
    `).run(id, rackSet.racks, rackSet.total_cost, comment || null);

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
