import { BaseModel } from './BaseModel.js';
import crypto from 'crypto';

/**
 * Модель конфигурации стеллажа
 */
export class RackConfiguration extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.floors = data.floors;
    this.rows = data.rows;
    this.beamsPerRow = data.beams_per_row;
    this.supports = data.supports;
    this.verticalSupports = data.vertical_supports;
    this.spans = data.spans ? JSON.parse(data.spans) : [];
    this.spansHash = data.spans_hash;
    this.braces = data.braces;
    this.createdAt = data.created_at;
  }

  static get tableName() {
    return 'rack_configurations';
  }

  /**
   * Хэшировать spans JSON для уникального индекса
   * @param {Array} spans - [{item, quantity}]
   * @returns {string}
   */
  static hashSpans(spans) {
    const json = JSON.stringify(spans);
    return crypto.createHash('sha256').update(json).digest('hex');
  }

  /**
   * Найти конфигурацию по уникальным параметрам
   * @param {Object} params
   * @returns {Promise<RackConfiguration|null>}
   */
  static async findByUniqueParams(params) {
    const db = await this.getDb();
    const spansHash = this.hashSpans(params.spans);
    
    const row = db.prepare(`
      SELECT * FROM rack_configurations
      WHERE floors = ? 
        AND rows = ? 
        AND beams_per_row = ?
        AND supports = ?
        AND vertical_supports = ?
        AND spans_hash = ?
        AND braces = ?
    `).get(
      params.floors,
      params.rows,
      params.beamsPerRow,
      params.supports || null,
      params.verticalSupports || null,
      spansHash,
      params.braces || null
    );
    
    return row ? new RackConfiguration(row) : null;
  }

  /**
   * Найти конфигурацию по ID
   * @param {number} id
   * @returns {Promise<RackConfiguration|null>}
   */
  static async findById(id) {
    const db = await this.getDb();
    const row = db.prepare('SELECT * FROM rack_configurations WHERE id = ?').get(id);
    return row ? new RackConfiguration(row) : null;
  }

  /**
   * Создать новую конфигурацию
   * @param {Object} params
   * @returns {Promise<RackConfiguration>}
   */
  static async create(params) {
    const db = await this.getDb();
    const spansJson = JSON.stringify(params.spans);
    const spansHash = this.hashSpans(params.spans);
    
    const result = db.prepare(`
      INSERT INTO rack_configurations 
        (floors, rows, beams_per_row, supports, vertical_supports, spans, spans_hash, braces)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      params.floors,
      params.rows,
      params.beamsPerRow,
      params.supports || null,
      params.verticalSupports || null,
      spansJson,
      spansHash,
      params.braces || null
    );
    
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Найти или создать конфигурацию
   * @param {Object} params
   * @returns {Promise<RackConfiguration>}
   */
  static async findOrCreate(params) {
    let config = await this.findByUniqueParams(params);
    if (!config) {
      config = await this.create(params);
    }
    return config;
  }

  /**
   * Конвертировать spans из БД в клиентский формат
   * @returns {Array} [{item, quantity}]
   */
  getSpans() {
    // Если spans хранится как [600, 600, 750] (числа)
    if (Array.isArray(this.spans) && typeof this.spans[0] === 'number') {
      const spansMap = new Map();
      this.spans.forEach(span => {
        const key = String(span);
        spansMap.set(key, (spansMap.get(key) || 0) + 1);
      });
      return Array.from(spansMap.entries()).map(([item, quantity]) => ({
        item,
        quantity,
      }));
    }
    
    // Если spans уже в формате [{item, quantity}]
    return this.spans;
  }

  /**
   * Преобразовать в объект для клиента
   * @returns {Object}
   */
  toClientFormat() {
    return {
      id: this.id,
      floors: this.floors,
      rows: this.rows,
      beamsPerRow: this.beamsPerRow,
      supports: this.supports,
      verticalSupports: this.verticalSupports,
      spans: this.getSpans(),
      braces: this.braces,
    };
  }

  /**
   * Получить тип опоры (straight/step)
   * @returns {string}
   */
  getSupportType() {
    if (!this.supports) return 'straight';
    return this.supports.includes('C') ? 'step' : 'straight';
  }
}

export default RackConfiguration;
