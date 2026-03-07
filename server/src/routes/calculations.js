import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/calculations
 * Отримати список розрахунків користувача
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const db = await getDb();
    const { type, limit = 50 } = req.query;

    let query = 'SELECT id, name, type, data, created_at FROM calculations WHERE user_id = ?';
    const params = [req.user.userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const calculations = db.prepare(query).all(...params);

    res.json({ calculations });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/calculations
 * Зберегти новий розрахунок
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const db = await getDb();
    const { name, type, data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid calculation data' });
    }

    if (!type || !['rack', 'battery'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be "rack" or "battery"' });
    }

    const result = db.prepare(`
      INSERT INTO calculations (user_id, name, type, data)
      VALUES (?, ?, ?, ?)
    `).run(req.user.userId, name || null, type, JSON.stringify(data));

    const calculation = db.prepare(`
      SELECT id, name, type, data, created_at
      FROM calculations
      WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ calculation });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/calculations/:id
 * Отримати конкретний розрахунок
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const calculation = db.prepare(`
      SELECT id, name, type, data, created_at
      FROM calculations
      WHERE id = ? AND user_id = ?
    `).get(id, req.user.userId);

    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    res.json({ calculation });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/calculations/:id
 * Видалити розрахунок
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const result = db.prepare(`
      DELETE FROM calculations
      WHERE id = ? AND user_id = ?
    `).run(id, req.user.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    res.json({ message: 'Calculation deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
