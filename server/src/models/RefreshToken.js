import { BaseModel } from "./BaseModel.js";
import crypto from "crypto";

/**
 * Модель refresh токена
 */
export class RefreshToken extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.userId = data.user_id;
    this.tokenHash = data.token_hash;
    this.expiresAt = data.expires_at;
    this.revoked = Boolean(data.revoked);
    this.createdAt = data.created_at;
  }

  static get tableName() {
    return "refresh_tokens";
  }

  /**
   * Найти токен по ID
   * @param {number} id
   * @returns {Promise<RefreshToken|null>}
   */
  static async findById(id) {
    const db = await this.getDb();
    const row = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(Number(id));
    return row ? new RefreshToken(row) : null;
  }

  /**
   * Хэшировать токен
   * @param {string} token
   * @returns {string}
   */
  static hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Найти токен по хэшу
   * @param {string} tokenHash
   * @returns {Promise<RefreshToken|null>}
   */
  static async findByTokenHash(tokenHash) {
    const db = await this.getDb();
    const row = db
      .prepare("SELECT * FROM refresh_tokens WHERE token_hash = ?")
      .get(tokenHash);
    return row ? new RefreshToken(row) : null;
  }

  /**
   * Найти активные токены пользователя
   * @param {number} userId
   * @returns {Promise<RefreshToken[]>}
   */
  static async findActiveByUser(userId) {
    const db = await this.getDb();
    const now = new Date().toISOString();
    const rows = db
      .prepare(
        `
      SELECT * FROM refresh_tokens 
      WHERE user_id = ? AND expires_at > ? AND revoked = 0 
      ORDER BY created_at DESC
    `,
      )
      .all(userId, now);
    return rows.map((row) => new RefreshToken(row));
  }

  /**
   * Создать новый refresh токен
   * @param {Object} data
   * @param {number} data.userId
   * @param {string} data.token - Исходный токен (будет захэширован)
   * @param {Date} data.expiresAt
   * @returns {Promise<RefreshToken>}
   */
  static async create(data) {
    const db = await this.getDb();
    const tokenHash = this.hashToken(data.token);

    const result = db
      .prepare(
        `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `,
      )
      .run(data.userId, tokenHash, data.expiresAt.toISOString());

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Отозвать токен
   * @returns {Promise<void>}
   */
  async revoke() {
    const db = await this.getDb();
    db.prepare(
      `
      UPDATE refresh_tokens SET revoked = 1 WHERE id = ?
    `,
    ).run(this.id);
    this.revoked = true;
  }

  /**
   * Отозвать все токены пользователя
   * @param {number} userId
   * @returns {Promise<number>} - Количество отозванных токенов
   */
  static async revokeAllForUser(userId) {
    const db = await this.getDb();
    const result = db
      .prepare(
        `
      UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ? AND revoked = 0
    `,
      )
      .run(userId);
    return result.changes;
  }

  /**
   * Проверить валидность токена
   * @returns {boolean}
   */
  isValid() {
    const now = new Date();
    const expiresAt = new Date(this.expiresAt);
    return !this.revoked && now < expiresAt;
  }

  /**
   * Удалить просроченные токены
   * @returns {Promise<number>} - Количество удалённых токенов
   */
  static async cleanupExpired() {
    const db = await this.getDb();
    const now = new Date().toISOString();
    const result = db
      .prepare(
        `
      DELETE FROM refresh_tokens WHERE expires_at < ?
    `,
      )
      .run(now);
    return result.changes;
  }
}

export default RefreshToken;
