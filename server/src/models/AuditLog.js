import { BaseModel } from './BaseModel.js';

/**
 * Модель лога аудита
 */
export class AuditLog extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.userId = data.user_id;
    this.action = data.action;
    this.entityType = data.entity_type;
    this.entityId = data.entity_id;
    this.oldValue = data.old_value ? JSON.parse(data.old_value) : null;
    this.newValue = data.new_value ? JSON.parse(data.new_value) : null;
    this.ipAddress = data.ip_address;
    this.userAgent = data.user_agent;
    this.createdAt = data.created_at;
  }

  static get tableName() {
    return 'audit_log';
  }

  /**
   * Создать запись аудита
   * @param {Object} data
   * @param {number} [data.userId]
   * @param {string} data.action
   * @param {string} data.entityType
   * @param {number} [data.entityId]
   * @param {Object} [data.oldValue]
   * @param {Object} [data.newValue]
   * @param {string} [data.ipAddress]
   * @param {string} [data.userAgent]
   * @returns {Promise<AuditLog>}
   */
  static async create(data) {
    const db = await this.getDb();
    const result = db.prepare(`
      INSERT INTO audit_log 
        (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.userId || null,
      data.action,
      data.entityType,
      data.entityId || null,
      data.oldValue ? JSON.stringify(data.oldValue) : null,
      data.newValue ? JSON.stringify(data.newValue) : null,
      data.ipAddress || null,
      data.userAgent || null
    );

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Получить логи по пользователю
   * @param {number} userId
   * @param {Object} [options]
   * @param {number} [options.limit=50]
   * @returns {Promise<AuditLog[]>}
   */
  static async findByUser(userId, options = {}) {
    const { limit = 50 } = options;
    const db = await this.getDb();
    const rows = db.prepare(`
      SELECT * FROM audit_log 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(userId, limit);
    return rows.map(row => new AuditLog(row));
  }

  /**
   * Получить логи по сущности
   * @param {string} entityType
   * @param {number} entityId
   * @returns {Promise<AuditLog[]>}
   */
  static async findByEntity(entityType, entityId) {
    const db = await this.getDb();
    const rows = db.prepare(`
      SELECT * FROM audit_log 
      WHERE entity_type = ? AND entity_id = ? 
      ORDER BY created_at DESC
    `).all(entityType, entityId);
    return rows.map(row => new AuditLog(row));
  }

  /**
   * Получить логи по действию
   * @param {string} action
   * @param {Object} [options]
   * @param {number} [options.limit=50]
   * @returns {Promise<AuditLog[]>}
   */
  static async findByAction(action, options = {}) {
    const { limit = 50 } = options;
    const db = await this.getDb();
    const rows = db.prepare(`
      SELECT * FROM audit_log 
      WHERE action = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(action, limit);
    return rows.map(row => new AuditLog(row));
  }

  /**
   * Получить логи за период
   * @param {Object} options
   * @param {string} options.startDate
   * @param {string} options.endDate
   * @param {number} [options.limit=100]
   * @returns {Promise<AuditLog[]>}
   */
  static async findByPeriod(options = {}) {
    const { startDate, endDate, limit = 100 } = options;
    const db = await this.getDb();
    const rows = db.prepare(`
      SELECT * FROM audit_log 
      WHERE created_at BETWEEN ? AND ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(startDate, endDate, limit);
    return rows.map(row => new AuditLog(row));
  }

  /**
   * Удалить старые логи аудита
   * @param {number} days - Количество дней для хранения
   * @returns {Promise<number>} - Количество удалённых записей
   */
  static async cleanupOldLogs(days = 90) {
    const db = await this.getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = db.prepare(`
      DELETE FROM audit_log 
      WHERE created_at < ?
    `).run(cutoffDate.toISOString());
    
    return result.changes;
  }
}

export default AuditLog;
