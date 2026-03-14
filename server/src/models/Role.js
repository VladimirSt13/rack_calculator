import { BaseModel } from "./BaseModel.js";

/**
 * Модель роли
 */
export class Role extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.name = data.name;
    this.label = data.label;
    this.description = data.description;
    this.isDefault = Boolean(data.is_default);
    this.isActive = Boolean(data.is_active);
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static get tableName() {
    return "roles";
  }

  /**
   * Найти роль по ID
   * @param {number} id
   * @returns {Promise<Role|null>}
   */
  static async findById(id) {
    const db = await this.getDb();
    const row = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(Number(id));
    return row ? new Role(row) : null;
  }

  /**
   * Найти роль по имени
   * @param {string} name
   * @returns {Promise<Role|null>}
   */
  static async findByName(name) {
    const db = await this.getDb();
    const row = db.prepare("SELECT * FROM roles WHERE name = ?").get(name);
    return row ? new Role(row) : null;
  }

  /**
   * Получить все активные роли
   * @returns {Promise<Role[]>}
   */
  static async findActive() {
    const db = await this.getDb();
    const rows = db
      .prepare("SELECT * FROM roles WHERE is_active = 1 ORDER BY id")
      .all();
    return rows.map((row) => new Role(row));
  }

  /**
   * Получить роль по умолчанию
   * @returns {Promise<Role|null>}
   */
  static async findDefault() {
    const db = await this.getDb();
    const row = db
      .prepare("SELECT * FROM roles WHERE is_default = 1 AND is_active = 1")
      .get();
    return row ? new Role(row) : null;
  }

  /**
   * Создать новую роль
   * @param {Object} data
   * @param {string} data.name
   * @param {string} data.label
   * @param {string} [data.description]
   * @param {boolean} [data.isDefault]
   * @param {boolean} [data.isActive]
   * @returns {Promise<Role>}
   */
  static async create(data) {
    const db = await this.getDb();
    const result = db
      .prepare(
        `
      INSERT INTO roles (name, label, description, is_default, is_active)
      VALUES (?, ?, ?, ?, ?)
    `,
      )
      .run(
        data.name,
        data.label,
        data.description || null,
        data.isDefault ? 1 : 0,
        data.isActive !== false ? 1 : 0,
      );

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Обновить роль
   * @param {Object} data
   * @returns {Promise<Role>}
   */
  async update(data) {
    const updateData = {};

    if (data.label !== undefined) updateData.label = data.label;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.isDefault !== undefined)
      updateData.is_default = data.isDefault ? 1 : 0;
    if (data.isActive !== undefined)
      updateData.is_active = data.isActive ? 1 : 0;

    const updated = await BaseModel.update(Role.tableName, this.id, updateData);
    Object.assign(this, updated);
    return this;
  }

  /**
   * Получить разрешения роли
   * @returns {Promise<Array>}
   */
  async getPermissions() {
    const db = await this.getDb();
    const rows = db
      .prepare(
        `
      SELECT p.* FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `,
      )
      .all(this.id);
    return rows;
  }

  /**
   * Получить типы цен роли
   * @returns {Promise<string[]>}
   */
  async getPriceTypes() {
    const db = await this.getDb();
    const rows = db
      .prepare(
        `
      SELECT price_type FROM role_price_types WHERE role_id = ?
    `,
      )
      .all(this.id);
    return rows.map((row) => row.price_type);
  }

  /**
   * Установить разрешения роли
   * @param {number[]} permissionIds
   * @returns {Promise<void>}
   */
  async setPermissions(permissionIds) {
    const db = await this.getDb();

    // Удалить текущие разрешения
    db.prepare("DELETE FROM role_permissions WHERE role_id = ?").run(this.id);

    // Добавить новые
    if (permissionIds.length > 0) {
      const insert = db.prepare(
        "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
      );
      const insertMany = db.transaction((ids) => {
        for (const id of ids) {
          insert.run(this.id, id);
        }
      });
      insertMany(permissionIds);
    }
  }

  /**
   * Установить типы цен роли
   * @param {string[]} priceTypes
   * @returns {Promise<void>}
   */
  async setPriceTypes(priceTypes) {
    const db = await this.getDb();

    // Удалить текущие типы цен
    db.prepare("DELETE FROM role_price_types WHERE role_id = ?").run(this.id);

    // Добавить новые
    if (priceTypes.length > 0) {
      const insert = db.prepare(
        "INSERT INTO role_price_types (role_id, price_type) VALUES (?, ?)",
      );
      const insertMany = db.transaction((types) => {
        for (const type of types) {
          insert.run(this.id, type);
        }
      });
      insertMany(priceTypes);
    }
  }
}

export default Role;
