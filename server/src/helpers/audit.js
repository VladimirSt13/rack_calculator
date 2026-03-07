/**
 * Helper для логування аудиту
 */

import { getDb } from '../db/index.js';

/**
 * Типи дій для аудиту
 */
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PERMISSION_CHANGE: 'PERMISSION_CHANGE',
  PRICE_UPDATE: 'PRICE_UPDATE',
  RACK_SET_CREATE: 'RACK_SET_CREATE',
  RACK_SET_UPDATE: 'RACK_SET_UPDATE',
  RACK_SET_DELETE: 'RACK_SET_DELETE',
};

/**
 * Типи сутностей
 */
export const ENTITY_TYPES = {
  USER: 'user',
  PRICE: 'price',
  RACK_SET: 'rack_set',
  RACK_SET_REVISION: 'rack_set_revision',
  CALCULATION: 'calculation',
};

/**
 * Записати запис в audit log
 * @param {Object} options - Опції
 * @param {number} options.userId - ID користувача
 * @param {string} options.action - Дія (з AUDIT_ACTIONS)
 * @param {string} options.entityType - Тип сутності (з ENTITY_TYPES)
 * @param {number} options.entityId - ID сутності
 * @param {Object} options.oldValue - Старі значення (для UPDATE/DELETE)
 * @param {Object} options.newValue - Нові значення (для CREATE/UPDATE)
 * @param {string} options.ipAddress - IP адреса
 * @param {string} options.userAgent - User agent
 */
export const logAudit = async ({
  userId,
  action,
  entityType,
  entityId = null,
  oldValue = null,
  newValue = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    const db = await getDb();
    
    db.prepare(`
      INSERT INTO audit_log (
        user_id,
        action,
        entity_type,
        entity_id,
        old_value,
        new_value,
        ip_address,
        user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      action,
      entityType,
      entityId,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      ipAddress,
      userAgent
    );
  } catch (error) {
    console.error('[Audit] Error logging audit entry:', error.message);
    // Не кидаємо помилку, щоб не ламати основний потік
  }
};

/**
 * Отримати історію аудиту для сутності
 * @param {string} entityType - Тип сутності
 * @param {number} entityId - ID сутності
 * @param {number} limit - Ліміт записів
 * @returns {Array}
 */
export const getAuditHistory = async (entityType, entityId, limit = 50) => {
  const db = await getDb();
  
  return db.prepare(`
    SELECT 
      a.*,
      u.email as user_email
    FROM audit_log a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.entity_type = ? AND a.entity_id = ?
    ORDER BY a.created_at DESC
    LIMIT ?
  `).all(entityType, entityId, limit);
};

/**
 * Отримати останні записи аудиту (для адміна)
 * @param {number} limit - Ліміт записів
 * @returns {Array}
 */
export const getRecentAuditEntries = async (limit = 100) => {
  const db = await getDb();
  
  return db.prepare(`
    SELECT 
      a.*,
      u.email as user_email
    FROM audit_log a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT ?
  `).all(limit);
};

/**
 * Helper для створення audit запису при зміні прайсу
 */
export const logPriceChange = async (userId, oldPrice, newPrice) => {
  await logAudit({
    userId,
    action: AUDIT_ACTIONS.PRICE_UPDATE,
    entityType: ENTITY_TYPES.PRICE,
    oldValue: { data: oldPrice },
    newValue: { data: newPrice },
  });
};

/**
 * Helper для створення audit запису при зміні користувача
 */
export const logUserChange = async (userId, action, userEmail, oldValue, newValue) => {
  await logAudit({
    userId,
    action,
    entityType: ENTITY_TYPES.USER,
    entityId: userId,
    oldValue,
    newValue,
  });
};

export default {
  AUDIT_ACTIONS,
  ENTITY_TYPES,
  logAudit,
  getAuditHistory,
  getRecentAuditEntries,
  logPriceChange,
  logUserChange,
};
