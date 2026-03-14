import { BaseModel } from "./BaseModel.js";

/**
 * Модель разрешения
 */
export class Permission extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.name = data.name;
    this.label = data.label;
    this.category = data.category;
    this.createdAt = data.created_at;
  }

  static get tableName() {
    return "permissions";
  }

  /**
   * Найти разрешение по ID
   * @param {number} id
   * @returns {Promise<Permission|null>}
   */
  static async findById(id) {
    const db = await this.getDb();
    const row = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(Number(id));
    return row ? new Permission(row) : null;
  }

  /**
   * Найти разрешение по имени
   * @param {string} name
   * @returns {Promise<Permission|null>}
   */
  static async findByName(name) {
    const db = await this.getDb();
    const row = db
      .prepare("SELECT * FROM permissions WHERE name = ?")
      .get(name);
    return row ? new Permission(row) : null;
  }

  /**
   * Получить все разрешения по категории
   * @param {string} category
   * @returns {Promise<Permission[]>}
   */
  static async findByCategory(category) {
    const db = await this.getDb();
    const rows = db
      .prepare("SELECT * FROM permissions WHERE category = ? ORDER BY id")
      .all(category);
    return rows.map((row) => new Permission(row));
  }

  /**
   * Получить все разрешения
   * @returns {Promise<Permission[]>}
   */
  static async findAll() {
    const db = await this.getDb();
    const rows = db
      .prepare("SELECT * FROM permissions ORDER BY category, id")
      .all();
    return rows.map((row) => new Permission(row));
  }

  /**
   * Создать новое разрешение
   * @param {Object} data
   * @param {string} data.name
   * @param {string} data.label
   * @param {string} [data.category]
   * @returns {Promise<Permission>}
   */
  static async create(data) {
    const db = await this.getDb();
    const result = db
      .prepare(
        `
      INSERT INTO permissions (name, label, category)
      VALUES (?, ?, ?)
    `,
      )
      .run(data.name, data.label, data.category || null);

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Обновить разрешение
   * @param {Object} data
   * @returns {Promise<Permission>}
   */
  async update(data) {
    const updateData = {};

    if (data.label !== undefined) updateData.label = data.label;
    if (data.category !== undefined) updateData.category = data.category;

    const updated = await BaseModel.update(
      Permission.tableName,
      this.id,
      updateData,
    );
    Object.assign(this, updated);
    return this;
  }
}

export default Permission;
