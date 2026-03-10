import { BaseModel } from './BaseModel.js';

/**
 * Модель прайс-листа
 */
export class Price extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.data = data.data ? JSON.parse(data.data) : {};
    this.updatedAt = data.updated_at;
  }

  static get tableName() {
    return 'prices';
  }

  /**
   * Получить актуальный прайс
   * @returns {Promise<Price|null>}
   */
  static async getCurrent() {
    const db = await this.getDb();
    const row = db.prepare('SELECT * FROM prices ORDER BY id DESC LIMIT 1').get();
    return row ? new Price(row) : null;
  }

  /**
   * Получить прайс по ID
   * @param {number} id
   * @returns {Promise<Price|null>}
   */
  static async findById(id) {
    const db = await this.getDb();
    const row = db.prepare('SELECT * FROM prices WHERE id = ?').get(id);
    return row ? new Price(row) : null;
  }

  /**
   * Получить историю прайсов с пагинацией
   * @param {Object} options
   * @param {number} [options.limit=20]
   * @param {number} [options.offset=0]
   * @returns {Promise<Price[]>}
   */
  static async getHistory(options = {}) {
    const { limit = 20, offset = 0 } = options;
    return await BaseModel.findAll(Price.tableName, {
      orderBy: 'id DESC',
      limit,
      offset,
    });
  }

  /**
   * Создать новый прайс
   * @param {Object} data - Данные прайса (объект)
   * @returns {Promise<Price>}
   */
  static async create(data) {
    const db = await this.getDb();
    const result = db.prepare(`
      INSERT INTO prices (data) VALUES (?)
    `).run(JSON.stringify(data));

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Получить данные прайса
   * @returns {Object}
   */
  getData() {
    return this.data;
  }

  /**
   * Получить цену элемента
   * @param {string} key - Ключ элемента
   * @returns {number|null}
   */
  getPrice(key) {
    return this.data[key] || null;
  }

  /**
   * Проверить наличие элемента в прайсе
   * @param {string} key
   * @returns {boolean}
   */
  hasPrice(key) {
    return key in this.data;
  }
}

export default Price;
