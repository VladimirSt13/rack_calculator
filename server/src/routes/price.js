import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/price
 * Отримати поточний прайс-лист
 */
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();

    // Get latest price
    const price = db.prepare('SELECT data, updated_at FROM prices ORDER BY id DESC LIMIT 1').get();

    if (!price) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    res.json({
      data: JSON.parse(price.data),
      updatedAt: price.updated_at,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/price
 * Оновити прайс-лист (auth required)
 */
router.put('/', authenticate, async (req, res, next) => {
  try {
    const db = await getDb();
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid price data' });
    }

    // Insert new price
    const result = db.prepare('INSERT INTO prices (data) VALUES (?)').run(JSON.stringify(data));

    // Get the inserted price
    const price = db.prepare('SELECT data, updated_at FROM prices WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      data: price.data,
      updatedAt: price.updated_at,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/price/upload
 * Завантажити прайс з файлу (auth required)
 */
router.post('/upload', authenticate, async (req, res, next) => {
  try {
    const db = await getDb();
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid price data' });
    }

    // Validate price structure (basic)
    const requiredKeys = ['supports', 'spans', 'vertical_supports', 'diagonal_brace', 'isolator'];
    const hasRequired = requiredKeys.some(key => key in data);

    if (!hasRequired) {
      return res.status(400).json({ error: 'Invalid price structure' });
    }

    // Insert new price
    const result = db.prepare('INSERT INTO prices (data) VALUES (?)').run(JSON.stringify(data));

    const price = db.prepare('SELECT data, updated_at FROM prices WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      data: price.data,
      updatedAt: price.updated_at,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
