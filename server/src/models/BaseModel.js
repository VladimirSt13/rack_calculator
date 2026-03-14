import { getDb } from "../db/index.js";

/**
 * Базовый класс для всех моделей
 * Предоставляет общие методы для работы с БД
 */
export class BaseModel {
  /**
   * Получить подключение к БД
   * @returns {Promise<Database>}
   */
  static async getDb() {
    return await getDb();
  }

  /**
   * Найти все записи
   * @param {string} tableName - Имя таблицы
   * @param {Object} options - Опции (orderBy, limit, offset)
   * @returns {Promise<Array>}
   */
  static async findAll(tableName, options = {}) {
    const db = await this.getDb();
    let query = `SELECT * FROM ${tableName}`;
    const values = [];

    if (options.where) {
      const conditions = Object.keys(options.where).map((key) => `${key} = ?`);
      query += ` WHERE ${conditions.join(" AND ")}`;
      values.push(...Object.values(options.where));
    }

    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }

    if (options.limit) {
      query += " LIMIT ?";
      values.push(options.limit);
    }

    if (options.offset) {
      query += " OFFSET ?";
      values.push(options.offset);
    }

    const rows = db.prepare(query).all(...values);
    return rows.map((row) => new this(row));
  }

  /**
   * Найти одну запись по ID
   * @param {string} tableName - Имя таблицы
   * @param {number} id - ID записи
   * @returns {Promise<Object|null>}
   */
  static async findById(tableName, id) {
    const db = await this.getDb();
    const row = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(id);
    return row ? new this(row) : null;
  }

  /**
   * Найти одну запись по условиям
   * @param {string} tableName - Имя таблицы
   * @param {Object} where - Условия
   * @returns {Promise<Object|null>}
   */
  static async findOne(tableName, where) {
    const db = await this.getDb();
    const conditions = Object.keys(where).map((key) => `${key} = ?`);
    const query = `SELECT * FROM ${tableName} WHERE ${conditions.join(" AND ")} LIMIT 1`;
    const row = db.prepare(query).get(...Object.values(where));
    return row ? new this(row) : null;
  }

  /**
   * Вставить новую запись
   * @param {string} tableName - Имя таблицы
   * @param {Object} data - Данные для вставки
   * @returns {Promise<Object>} - Созданная запись
   */
  static async create(tableName, data) {
    const db = await this.getDb();
    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");
    const values = Object.values(data);

    const result = db
      .prepare(
        `
      INSERT INTO ${tableName} (${keys.join(", ")})
      VALUES (${placeholders})
    `,
      )
      .run(...values);

    return this.findById(tableName, Number(result.lastInsertRowid));
  }

  /**
   * Обновить запись
   * @param {string} tableName - Имя таблицы
   * @param {number} id - ID записи
   * @param {Object} data - Данные для обновления
   * @returns {Promise<Object|null>}
   */
  static async update(tableName, id, data) {
    const db = await this.getDb();
    const keys = Object.keys(data);
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(data), id];

    db.prepare(
      `
      UPDATE ${tableName} SET ${setClause} WHERE id = ?
    `,
    ).run(...values);

    return this.findById(tableName, id);
  }

  /**
   * Удалить запись
   * @param {string} tableName - Имя таблицы
   * @param {number} id - ID записи
   * @returns {Promise<boolean>}
   */
  static async delete(tableName, id) {
    const db = await this.getDb();
    const result = db
      .prepare(
        `
      DELETE FROM ${tableName} WHERE id = ?
    `,
      )
      .run(id);
    return result.changes > 0;
  }

  /**
   * Конструктор
   * @param {Object} data - Данные записи
   */
  constructor(data) {
    if (new.target === BaseModel) {
      throw new Error(
        "BaseModel is abstract and cannot be instantiated directly",
      );
    }
    Object.assign(this, data);
  }
}

export default BaseModel;
