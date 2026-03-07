import { getDb } from '../db/index.js';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '../helpers/audit.js';

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

    res.json({ rackSets });
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
    rackSet.racks = JSON.parse(rackSet.racks);

    res.json({ rackSet });
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
    const { name, object_name, description, racks } = req.body;

    // Валідація
    if (!name || !racks || !Array.isArray(racks)) {
      return res.status(400).json({
        error: 'Name and racks array are required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (racks.length === 0) {
      return res.status(400).json({
        error: 'Racks array cannot be empty',
        code: 'VALIDATION_ERROR'
      });
    }

    // Розрахунок загальної вартості
    const totalCost = racks.reduce((sum, rack) => {
      const rackTotal = rack.totalCost || rack.total_cost || 0;
      const quantity = rack.quantity || 1;
      return sum + (rackTotal * quantity);
    }, 0);

    // Створення комплекту
    const result = db.prepare(`
      INSERT INTO rack_sets (user_id, name, object_name, description, racks, total_cost)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, name, object_name || null, description || null, JSON.stringify(racks), totalCost);

    const rackSetId = result.lastInsertRowid;

    // Audit log
    await logAudit({
      userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.RACK_SET,
      entityId: rackSetId,
      newValue: { name, object_name, total_cost: totalCost, racks_count: racks.length },
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
        total_cost: totalCost,
        racks_count: racks.length
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
    const { name, object_name, description, racks } = req.body;

    // Перевірка чи існує комплект
    const existing = db.prepare(`
      SELECT id, user_id, racks, total_cost
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
    if (racks !== undefined) {
      updates.push('racks = ?');
      values.push(JSON.stringify(racks));
      
      // Перерахунок загальної вартості
      const totalCost = racks.reduce((sum, rack) => {
        const rackTotal = rack.totalCost || rack.total_cost || 0;
        const quantity = rack.quantity || 1;
        return sum + (rackTotal * quantity);
      }, 0);
      updates.push('total_cost = ?');
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
