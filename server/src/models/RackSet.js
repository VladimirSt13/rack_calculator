import { BaseModel } from "./BaseModel.js";
import { RackConfiguration } from "./RackConfiguration.js";

/**
 * Модель комплекта стеллажей
 */
export class RackSet extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.userId = data.user_id;
    this.name = data.name;
    this.objectName = data.object_name;
    this.description = data.description;
    this.rackItems = data.rack_items ? JSON.parse(data.rack_items) : [];
    this.totalCostSnapshot = data.total_cost_snapshot;
    this.deleted = Boolean(data.deleted);
    this.deletedAt = data.deleted_at;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static get tableName() {
    return "rack_sets";
  }

  /**
   * Найти комплект по ID
   * @param {number} id
   * @param {Object} options
   * @param {number} [options.userId]
   * @param {boolean} [options.isAdmin]
   * @param {boolean} [options.includeDeleted]
   * @returns {Promise<RackSet|null>}
   */
  static async findById(id, options = {}) {
    const { userId = null, isAdmin = false, includeDeleted = false } = options;

    const db = await this.getDb();
    let query = "SELECT * FROM rack_sets WHERE id = ?";
    const values = [id];

    if (!isAdmin && userId) {
      query += " AND user_id = ?";
      values.push(userId);
    }

    if (!includeDeleted) {
      query += " AND (deleted = 0 OR deleted IS NULL)";
    }

    const row = db.prepare(query).get(...values);
    return row ? new RackSet(row) : null;
  }

  /**
   * Найти все комплекты пользователя
   * @param {Object} options
   * @param {number} [options.userId]
   * @param {boolean} [options.isAdmin]
   * @param {boolean} [options.includeDeleted]
   * @param {string} [options.orderBy='created_at DESC']
   * @returns {Promise<RackSet[]>}
   */
  static async findAll(options = {}) {
    const {
      userId = null,
      isAdmin = false,
      includeDeleted = false,
      orderBy = "created_at DESC",
    } = options;

    const db = await this.getDb();
    let query = "SELECT * FROM rack_sets";
    const values = [];
    const conditions = [];

    if (!isAdmin && userId) {
      conditions.push("user_id = ?");
      values.push(userId);
    }

    if (!includeDeleted) {
      conditions.push("(deleted = 0 OR deleted IS NULL)");
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY " + orderBy;

    const rows = db.prepare(query).all(...values);
    return rows.map((row) => new RackSet(row));
  }

  /**
   * Найти удалённые комплекты пользователя
   * @param {Object} options
   * @param {number} options.userId
   * @param {boolean} [options.isAdmin]
   * @returns {Promise<RackSet[]>}
   */
  static async findDeleted(options = {}) {
    const { userId = null, isAdmin = false } = options;

    const db = await this.getDb();
    let query = "SELECT * FROM rack_sets WHERE deleted = 1";
    const values = [];

    if (!isAdmin && userId) {
      query += " AND user_id = ?";
      values.push(userId);
    }

    query += " ORDER BY deleted_at DESC";

    const rows = db.prepare(query).all(...values);
    return rows.map((row) => new RackSet(row));
  }

  /**
   * Создать новый комплект
   * @param {Object} data
   * @param {number} data.userId
   * @param {string} data.name
   * @param {string} [data.objectName]
   * @param {string} [data.description]
   * @param {Array} data.rackItems
   * @param {number} [data.totalCostSnapshot]
   * @returns {Promise<RackSet>}
   */
  static async create(data) {
    const db = await this.getDb();

    const result = db
      .prepare(
        `
      INSERT INTO rack_sets 
        (user_id, name, object_name, description, rack_items, total_cost_snapshot)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        data.userId,
        data.name,
        data.objectName || null,
        data.description || null,
        JSON.stringify(data.rackItems),
        data.totalCostSnapshot || 0,
      );

    return this.findById(result.lastInsertRowid, { isAdmin: true });
  }

  /**
   * Обновить комплект
   * @param {Object} data
   * @returns {Promise<RackSet>}
   */
  async update(data) {
    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.objectName !== undefined) updateData.object_name = data.objectName;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.rackItems !== undefined)
      updateData.rack_items = JSON.stringify(data.rackItems);
    if (data.totalCostSnapshot !== undefined)
      updateData.total_cost_snapshot = data.totalCostSnapshot;

    const updated = await BaseModel.update(
      RackSet.tableName,
      this.id,
      updateData,
    );
    Object.assign(this, updated);
    return this;
  }

  /**
   * Мягкое удаление (установка флага)
   * @returns {Promise<void>}
   */
  async softDelete() {
    const db = await RackSet.getDb();
    db.prepare(
      `
      UPDATE rack_sets
      SET deleted = 1, deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(this.id);
    this.deleted = true;
    this.deletedAt = new Date().toISOString();
  }

  /**
   * Восстановить удалённый комплект
   * @returns {Promise<void>}
   */
  async restore() {
    const db = await RackSet.getDb();
    db.prepare(
      `
      UPDATE rack_sets
      SET deleted = 0, deleted_at = NULL
      WHERE id = ?
    `,
    ).run(this.id);
    this.deleted = false;
    this.deletedAt = null;
  }

  /**
   * Получить стелажи с полными данными и ценами
   * @param {Object} priceData - Данные прайса
   * @param {Object} user - Пользователь (для фильтрования цен)
   * @returns {Promise<Array>}
   */
  async getRacksWithPrices(priceData, user) {
    const racks = [];

    for (const item of this.rackItems) {
      const config = await RackConfiguration.findById(item.rackConfigId);
      if (config) {
        const rackData = await this._calculateRackPrice(
          config,
          priceData,
          user,
        );
        racks.push({ ...rackData, quantity: item.quantity });
      }
    }

    return racks;
  }

  /**
   * Рассчитать цену стелажа
   * @private
   */
  async _calculateRackPrice(config, priceData, user) {
    const {
      calculateRackComponents,
      calculateTotalCost,
      calculateTotalWithoutIsolators,
      generateRackName,
    } = await import("../../../shared/rackCalculator.js");

    const rackConfig = {
      floors: config.floors,
      rows: config.rows,
      beamsPerRow: config.beamsPerRow,
      supports: config.supports,
      verticalSupports: config.verticalSupports,
      spans: config.getSpans(),
      braces: config.braces,
    };

    const components = calculateRackComponents(rackConfig, priceData);
    const totalCost = calculateTotalCost(components);
    const totalWithoutIsolators = calculateTotalWithoutIsolators(components);
    const zeroPrice = totalCost * 1.44;

    // Фильтрация цен по разрешениям пользователя
    const permissions = user?.permissions || { price_types: [] };
    const prices = [];

    if (permissions.price_types?.includes("базова")) {
      prices.push({
        type: "базова",
        label: "Базова ціна",
        value: Math.round(totalCost * 100) / 100,
      });
    }
    if (permissions.price_types?.includes("без_ізоляторів")) {
      prices.push({
        type: "без_ізоляторів",
        label: "Без ізоляторів",
        value: Math.round(totalWithoutIsolators * 100) / 100,
      });
    }
    if (permissions.price_types?.includes("нульова")) {
      prices.push({
        type: "нульова",
        label: "Нульова ціна",
        value: Math.round(zeroPrice * 100) / 100,
      });
    }

    // Основная цена для расчёта
    let mainTotalCost = 0;
    if (permissions.price_types?.includes("нульова")) {
      mainTotalCost = zeroPrice;
    } else if (permissions.price_types?.includes("без_ізоляторів")) {
      mainTotalCost = totalWithoutIsolators;
    } else if (permissions.price_types?.includes("базова")) {
      mainTotalCost = totalCost;
    }

    return {
      rackConfigId: config.id,
      name: generateRackName(rackConfig),
      config: rackConfig,
      components,
      prices,
      totalCost: mainTotalCost,
    };
  }

  /**
   * Удалить старые удалённые комплекты (для cron)
   * @param {number} days - Количество дней для хранения
   * @returns {Promise<number>} - Количество удалённых записей
   */
  static async cleanupDeleted(days = 30) {
    const db = await this.getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = db
      .prepare(
        `
      DELETE FROM rack_sets 
      WHERE deleted = 1 AND deleted_at < ?
    `,
      )
      .run(cutoffDate.toISOString());

    return result.changes;
  }

  /**
   * Преобразовать в объект для ответа API
   * @param {Array} [racksWithPrices] - Стелажи с ценами (опционально)
   * @returns {Object}
   */
  toDto(racksWithPrices = null) {
    return {
      id: this.id,
      user_id: this.userId,
      name: this.name,
      object_name: this.objectName,
      description: this.description,
      racks: racksWithPrices || this.rackItems,
      total_cost_snapshot: this.totalCostSnapshot,
      total_cost: this.totalCostSnapshot, // Для сумісності
      deleted: this.deleted,
      deleted_at: this.deletedAt,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}

export default RackSet;
