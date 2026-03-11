import { getDb } from '../db/index.js';
import { logAudit, ENTITY_TYPES } from '../helpers/audit.js';

/**
 * Сервис для работы с журналом аудита
 */

/**
 * Получить статистику журнала аудита
 * @returns {Object} Статистика аудита
 */
export const getAuditStatistics = async () => {
  const db = await getDb();

  // Общая количество записей
  const { total } = db.prepare(`SELECT COUNT(*) as total FROM audit_log`).get();

  // Количество записей за последние 7 дней
  const { last7days } = db.prepare(`
    SELECT COUNT(*) as last7days
    FROM audit_log
    WHERE created_at >= datetime('now', '-7 days')
  `).get();

  // Количество записей за последние 30 дней
  const { last30days } = db.prepare(`
    SELECT COUNT(*) as last30days
    FROM audit_log
    WHERE created_at >= datetime('now', '-30 days')
  `).get();

  // Размер таблицы в БД
  const { pageSize } = db.prepare(`
    SELECT page_count * page_size as pageSize
    FROM pragma_page_count(), pragma_page_size()
  `).get();

  // Топ действий
  const topActions = db.prepare(`
    SELECT action, COUNT(*) as count
    FROM audit_log
    GROUP BY action
    ORDER BY count DESC
    LIMIT 10
  `).all();

  // Записи по датам (последние 7 дней)
  const byDate = db.prepare(`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as count
    FROM audit_log
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `).all();

  return {
    total,
    last7days,
    last30days,
    databaseSize: pageSize,
    topActions,
    byDate,
  };
};

/**
 * Очистить записи старше указанного периода
 * @param {number} userId - ID пользователя, выполняющего очистку
 * @param {number} days - Количество дней
 * @returns {Object} Результат очистки
 */
export const cleanupAuditLogs = async (userId, days) => {
  const db = await getDb();

  if (days < 1 || days > 365) {
    return { error: 'Days must be between 1 and 365' };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

  // Посчитаем сколько записей будет удалено
  const { count } = db.prepare(`
    SELECT COUNT(*) as count
    FROM audit_log
    WHERE created_at < ?
  `).get(cutoffDateStr);

  if (count === 0) {
    return {
      message: `No records older than ${days} days found`,
      deleted: 0,
    };
  }

  // Удаляем старые записи (пакетами по 1000)
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

    // Небольшая пауза между пакетами
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Оптимизируем базу данных после удаления
  db.exec('VACUUM');

  // Запишем в аудит факт очистки
  await logAudit({
    userId,
    action: 'AUDIT_CLEANUP',
    entityType: 'audit_log',
    newValue: { days, deletedCount: deletedTotal },
  });

  return {
    message: `Deleted ${deletedTotal} records older than ${days} days`,
    deleted: deletedTotal,
    days,
  };
};

/**
 * Получить журнал аудита с фильтрами
 * @param {Object} filters - Фильтры
 * @returns {Object} Записи аудита и пагинация
 */
export const getAuditLogs = async (filters) => {
  const {
    userId,
    action,
    entityType,
    entityId,
    dateFrom,
    dateTo,
    page = 1,
    limit = 50,
  } = filters;

  const db = await getDb();

  // Базовый запрос
  let query = `
    SELECT
      a.*,
      u.email as user_email
    FROM audit_log a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;

  const params = [];

  // Фильтры
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

  // Пагинация
  const offset = (page - 1) * limit;
  query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const logs = db.prepare(query).all(...params);

  // Получить общее количество
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

  return {
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
    },
  };
};

/**
 * Получить последние записи аудита
 * @param {number} limit - Количество записей
 * @returns {Array} Записи аудита
 */
export const getRecentAuditLogs = async (limit = 100) => {
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

  return logs;
};

/**
 * Получить историю аудита для сущности
 * @param {string} entityType - Тип сущности
 * @param {string|number} entityId - ID сущности
 * @param {number} limit - Количество записей
 * @returns {Array} Записи аудита
 */
export const getAuditByEntity = async (entityType, entityId, limit = 50) => {
  const db = await getDb();

  // Проверка типа сущности
  if (!Object.values(ENTITY_TYPES).includes(entityType)) {
    throw new Error('Invalid entity type');
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

  return logs;
};

/**
 * Получить историю аудита пользователя
 * @param {number} userId - ID пользователя
 * @param {number} limit - Количество записей
 * @returns {Array} Записи аудита
 */
export const getAuditByUser = async (userId, limit = 50) => {
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

  return logs;
};

export default {
  getAuditStatistics,
  cleanupAuditLogs,
  getAuditLogs,
  getRecentAuditLogs,
  getAuditByEntity,
  getAuditByUser,
};
