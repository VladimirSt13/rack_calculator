import { BaseModel } from "./BaseModel.js";

/**
 * Модель ревизии (истории изменений) комплекта стеллажей
 */
export class RackSetRevision extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.rackSetId = data.rack_set_id;
    this.userId = data.user_id;
    this.racksSnapshot = data.racks_snapshot
      ? JSON.parse(data.racks_snapshot)
      : [];
    this.totalCostSnapshot = data.total_cost_snapshot;
    this.changeType = data.change_type;
    this.changeDescription = data.change_description;
    this.createdAt = data.created_at;
  }

  static get tableName() {
    return "rack_set_revisions";
  }

  /**
   * Найти все ревизии комплекта
   * @param {number} rackSetId
   * @param {Object} options
   * @param {string} [options.orderBy='created_at DESC']
   * @returns {Promise<RackSetRevision[]>}
   */
  static async findByRackSetId(rackSetId, options = {}) {
    const { orderBy = "created_at DESC" } = options;

    const db = await this.getDb();
    const rows = db
      .prepare(
        `
      SELECT * FROM rack_set_revisions
      WHERE rack_set_id = ?
      ORDER BY ${orderBy}
    `,
      )
      .all(rackSetId);

    return rows.map((row) => new RackSetRevision(row));
  }

  /**
   * Найти ревизию по ID
   * @param {number} id
   * @returns {Promise<RackSetRevision|null>}
   */
  static async findById(id) {
    const db = await this.getDb();
    const row = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(Number(id));
    return row ? new RackSetRevision(row) : null;
  }

  /**
   * Создать новую ревизию
   * @param {Object} data
   * @param {number} data.rackSetId
   * @param {number} data.userId
   * @param {Array} data.racksSnapshot
   * @param {number} [data.totalCostSnapshot]
   * @param {string} [data.changeType='update']
   * @param {string} [data.changeDescription]
   * @returns {Promise<RackSetRevision>}
   */
  static async create(data) {
    const db = await this.getDb();

    const result = db
      .prepare(
        `
      INSERT INTO rack_set_revisions 
        (rack_set_id, user_id, racks_snapshot, total_cost_snapshot, change_type, change_description)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        data.rackSetId,
        data.userId,
        JSON.stringify(data.racksSnapshot),
        data.totalCostSnapshot || 0,
        data.changeType || "update",
        data.changeDescription || null,
      );

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Создать ревизию при изменении комплекта
   * @param {Object} data
   * @param {number} data.rackSetId
   * @param {number} data.userId
   * @param {Array} data.racksSnapshot
   * @param {number} [data.totalCostSnapshot]
   * @param {string} [data.comment]
   * @returns {Promise<RackSetRevision>}
   */
  static async createFromChange(data) {
    return await this.create({
      rackSetId: data.rackSetId,
      userId: data.userId,
      racksSnapshot: data.racksSnapshot,
      totalCostSnapshot: data.totalCostSnapshot,
      changeType: "update",
      changeDescription: data.comment || null,
    });
  }

  /**
   * Получить последнюю ревизию комплекта
   * @param {number} rackSetId
   * @returns {Promise<RackSetRevision|null>}
   */
  static async findLatest(rackSetId) {
    const revisions = await this.findByRackSetId(rackSetId, {
      orderBy: "created_at DESC",
      limit: 1,
    });
    return revisions[0] || null;
  }

  /**
   * Удалить старые ревизии (для cron)
   * @param {number} days - Количество дней для хранения
   * @returns {Promise<number>} - Количество удалённых записей
   */
  static async cleanupOld(days = 90) {
    const db = await this.getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = db
      .prepare(
        `
      DELETE FROM rack_set_revisions
      WHERE created_at < ?
    `,
      )
      .run(cutoffDate.toISOString());

    return result.changes;
  }

  /**
   * Преобразовать в объект для ответа API
   * @returns {Object}
   */
  toDto() {
    return {
      id: this.id,
      rackSetId: this.rackSetId,
      userId: this.userId,
      racksSnapshot: this.racksSnapshot,
      totalCostSnapshot: this.totalCostSnapshot,
      changeType: this.changeType,
      changeDescription: this.changeDescription,
      createdAt: this.createdAt,
    };
  }
}

export default RackSetRevision;
