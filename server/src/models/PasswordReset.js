import { BaseModel } from "./BaseModel.js";
import crypto from "crypto";

/**
 * Модель сброса пароля
 */
export class PasswordReset extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.userId = data.user_id;
    this.tokenHash = data.token_hash;
    this.expiresAt = data.expires_at;
    this.createdAt = data.created_at;
  }

  static get tableName() {
    return "password_resets";
  }

  /**
   * Найти сброс пароля по ID
   * @param {number} id
   * @returns {Promise<PasswordReset|null>}
   */
  static async findById(id) {
    const db = await this.getDb();
    const row = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(Number(id));
    return row ? new PasswordReset(row) : null;
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
   * Генерировать случайный токен
   * @returns {string}
   */
  static generateToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Найти по хэшу токена
   * @param {string} tokenHash
   * @returns {Promise<PasswordReset|null>}
   */
  static async findByTokenHash(tokenHash) {
    const db = await this.getDb();
    const row = db
      .prepare("SELECT * FROM password_resets WHERE token_hash = ?")
      .get(tokenHash);
    return row ? new PasswordReset(row) : null;
  }

  /**
   * Найти активный сброс пароля пользователя
   * @param {number} userId
   * @returns {Promise<PasswordReset|null>}
   */
  static async findActiveByUser(userId) {
    const db = await this.getDb();
    const now = new Date().toISOString();
    const row = db
      .prepare(
        `
      SELECT * FROM password_resets 
      WHERE user_id = ? AND expires_at > ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `,
      )
      .get(userId, now);
    return row ? new PasswordReset(row) : null;
  }

  /**
   * Создать новый сброс пароля
   * @param {Object} data
   * @param {number} data.userId
   * @param {string} data.token
   * @param {Date} data.expiresAt
   * @returns {Promise<PasswordReset>}
   */
  static async create(data) {
    const db = await this.getDb();
    const tokenHash = this.hashToken(data.token);

    // Удалить старые активные сбросы пользователя
    db.prepare(
      `
      DELETE FROM password_resets 
      WHERE user_id = ?
    `,
    ).run(data.userId);

    const result = db
      .prepare(
        `
      INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `,
      )
      .run(data.userId, tokenHash, data.expiresAt.toISOString());

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Создать сброс пароля с новым токеном
   * @param {number} userId
   * @param {number} [expiresInHours=1]
   * @returns {Promise<{passwordReset: PasswordReset, token: string}>}
   */
  static async createWithToken(userId, expiresInHours = 1) {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const passwordReset = await this.create({
      userId,
      token,
      expiresAt,
    });

    return { passwordReset, token };
  }

  /**
   * Проверить валидность токена
   * @returns {boolean}
   */
  isValid() {
    const now = new Date();
    const expiresAt = new Date(this.expiresAt);
    return now < expiresAt;
  }

  /**
   * Удалить сброс пароля
   * @returns {Promise<boolean>}
   */
  async delete() {
    return await BaseModel.delete(PasswordReset.tableName, this.id);
  }

  /**
   * Удалить просроченные сбросы пароля
   * @returns {Promise<number>}
   */
  static async cleanupExpired() {
    const db = await this.getDb();
    const now = new Date().toISOString();
    const result = db
      .prepare(
        `
      DELETE FROM password_resets WHERE expires_at < ?
    `,
      )
      .run(now);
    return result.changes;
  }
}

export default PasswordReset;
