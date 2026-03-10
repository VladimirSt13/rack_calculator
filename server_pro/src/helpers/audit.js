import { getDb } from '../db/index.js';

/**
 * Audit Log Helper
 * 
 * Використання:
 * await audit.log({
 *   userId: req.user.id,
 *   action: 'CREATE',
 *   entityType: 'user',
 *   entityId: newUser.id,
 *   newValue: newUser,
 *   ipAddress: req.ip,
 *   userAgent: req.get('user-agent'),
 * });
 */

export const audit = {
  /**
   * Log an action
   */
  async log(data) {
    const {
      userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
    } = data;

    try {
      getDb().prepare(`
        INSERT INTO audit_log (
          user_id, action, entity_type, entity_id, 
          old_value, new_value, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId || null,
        action,
        entityType || null,
        entityId || null,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ipAddress || null,
        userAgent || null
      );
    } catch (error) {
      console.error('[Audit Error]', error);
    }
  },

  /**
   * Get audit logs with filters
   */
  getLogs(filters = {}) {
    const {
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = filters;

    const conditions = [];
    const params = [];

    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }

    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }

    if (entityType) {
      conditions.push('entity_type = ?');
      params.push(entityType);
    }

    if (entityId) {
      conditions.push('entity_id = ?');
      params.push(entityId);
    }

    if (startDate) {
      conditions.push('created_at >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('created_at <= ?');
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    return getDb().prepare(`
      SELECT al.*, u.email as user_email
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
  },

  /**
   * Delete old audit logs
   */
  cleanupOlderThan(days = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = getDb().prepare(`
      DELETE FROM audit_log WHERE created_at < ?
    `).run(cutoffDate.toISOString());

    return result.changes;
  },
};

export default audit;
