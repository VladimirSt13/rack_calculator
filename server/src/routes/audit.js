import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { getDb } from '../db/index.js';
import { logAudit, ENTITY_TYPES } from '../helpers/audit.js';

const router = express.Router();

/**
 * GET /api/audit/statistics
 * Отримати статистику журналу аудиту
 */
router.get('/statistics', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const db = await getDb();

    // Загальна кількість записів
    const { total } = db.prepare(`SELECT COUNT(*) as total FROM audit_log`).get();

    // Кількість записів за останні 7 днів
    const { last7days } = db.prepare(`
      SELECT COUNT(*) as last7days 
      FROM audit_log 
      WHERE created_at >= datetime('now', '-7 days')
    `).get();

    // Кількість записів за останні 30 днів
    const { last30days } = db.prepare(`
      SELECT COUNT(*) as last30days 
      FROM audit_log 
      WHERE created_at >= datetime('now', '-30 days')
    `).get();

    // Розмір таблиці в БД
    const { pageSize } = db.prepare(`
      SELECT page_count * page_size as pageSize 
      FROM pragma_page_count(), pragma_page_size()
    `).get();

    // Топ дій
    const topActions = db.prepare(`
      SELECT action, COUNT(*) as count
      FROM audit_log
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // Записи по датах (останні 7 днів)
    const byDate = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM audit_log
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all();

    res.json({
      total,
      last7days,
      last30days,
      databaseSize: pageSize,
      topActions,
      byDate,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/audit/cleanup
 * Очистити записи старіше вказаного періоду
 */
router.post('/cleanup', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { days = 90 } = req.body;
    const db = await getDb();

    if (days < 1 || days > 365) {
      return res.status(400).json({ error: 'Days must be between 1 and 365' });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    // Порахуємо скільки записів буде видалено
    const { count } = db.prepare(`
      SELECT COUNT(*) as count 
      FROM audit_log 
      WHERE created_at < ?
    `).get(cutoffDateStr);

    if (count === 0) {
      return res.json({
        message: `No records older than ${days} days found`,
        deleted: 0,
      });
    }

    // Видаляємо старі записи (пакетами по 1000)
    const BATCH_SIZE = 1000;
    let deletedTotal = 0;

    while (true) {
      const result = db.prepare(`
        DELETE FROM audit_log 
        WHERE id IN (
          SELECT id FROM audit_log 
          WHERE created_at < ?
          LIMIT ?
        )
      `).run(cutoffDateStr, BATCH_SIZE);

      deletedTotal += result.changes;

      if (result.changes < BATCH_SIZE) {
        break;
      }

      // Невелика пауза між пакетами
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Оптимізуємо базу даних після видалення
    db.exec('VACUUM');

    // Запишемо в аудит факт очищення
    await logAudit({
      userId: req.user.userId,
      action: 'AUDIT_CLEANUP',
      entityType: 'audit_log',
      newValue: { days, deletedCount: deletedTotal },
    });

    res.json({
      message: `Deleted ${deletedTotal} records older than ${days} days`,
      deleted: deletedTotal,
      days,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit
 * Отримати журнал аудиту з фільтрами
 */
router.get('/', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const {
      userId,
      action,
      entityType,
      entityId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = req.query;

    const db = await getDb();

    // Базовий запит
    let query = `
      SELECT
        a.*,
        u.email as user_email
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Фільтри
    if (userId) {
      query += ' AND a.user_id = ?';
      params.push(userId);
    }

    if (action) {
      query += ' AND a.action = ?';
      params.push(action);
    }

    if (entityType) {
      query += ' AND a.entity_type = ?';
      params.push(entityType);
    }

    if (entityId) {
      query += ' AND a.entity_id = ?';
      params.push(entityId);
    }

    if (dateFrom) {
      query += ' AND a.created_at >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND a.created_at <= ?';
      params.push(dateTo);
    }

    // Пагінація
    const offset = (page - 1) * limit;
    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const logs = db.prepare(query).all(...params);

    // Отримати загальну кількість
    let countQuery = `SELECT COUNT(*) as total FROM audit_log WHERE 1=1`;
    const countParams = [];

    if (userId) {
      countQuery += ' AND user_id = ?';
      countParams.push(userId);
    }
    if (action) {
      countQuery += ' AND action = ?';
      countParams.push(action);
    }
    if (entityType) {
      countQuery += ' AND entity_type = ?';
      countParams.push(entityType);
    }
    if (entityId) {
      countQuery += ' AND entity_id = ?';
      countParams.push(entityId);
    }
    if (dateFrom) {
      countQuery += ' AND created_at >= ?';
      countParams.push(dateFrom);
    }
    if (dateTo) {
      countQuery += ' AND created_at <= ?';
      countParams.push(dateTo);
    }

    const { total } = db.prepare(countQuery).get(...countParams);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/recent
 * Отримати останні записи аудиту
 */
router.get('/recent', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    const db = await getDb();

    const logs = db.prepare(`
      SELECT
        a.*,
        u.email as user_email
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ?
    `).all(parseInt(limit));

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/:entityType/:entityId
 * Отримати історію аудиту для сутності
 */
router.get('/:entityType/:entityId', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 50 } = req.query;
    const db = await getDb();

    // Перевірка типу сутності
    if (!Object.values(ENTITY_TYPES).includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const logs = db.prepare(`
      SELECT
        a.*,
        u.email as user_email
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.entity_type = ? AND a.entity_id = ?
      ORDER BY a.created_at DESC
      LIMIT ?
    `).all(entityType, entityId, parseInt(limit));

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/user/:userId
 * Отримати історію аудиту користувача
 */
router.get('/user/:userId', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    const db = await getDb();

    const logs = db.prepare(`
      SELECT
        a.*,
        u.email as user_email
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT ?
    `).all(userId, parseInt(limit));

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export default router;
