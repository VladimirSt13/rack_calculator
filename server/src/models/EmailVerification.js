import { BaseModel } from "./BaseModel.js";
import crypto from "crypto";

/**
 * Модель подтверждения email
 */
export class EmailVerification extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.userId = data.user_id;
    this.token = data.token;
    this.expiresAt = data.expires_at;
    this.verified = Boolean(data.verified);
    this.createdAt = data.created_at;
  }

  static get tableName() {
    return "email_verifications";
  }

  /**
   * Найти верификацию по ID
   * @param {number} id
   * @returns {Promise<EmailVerification|null>}
   */
  static async findById(id) {
    const db = await this.getDb();
    const row = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(Number(id));
    return row ? new EmailVerification(row) : null;
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
   * Найти по токену
   * @param {string} token
   * @returns {Promise<EmailVerification|null>}
   */
  static async findByToken(token) {
    const db = await this.getDb();
    const row = db
      .prepare("SELECT * FROM email_verifications WHERE token = ?")
      .get(token);
    return row ? new EmailVerification(row) : null;
  }

  /**
   * Найти активную верификацию пользователя
   * @param {number} userId
   * @returns {Promise<EmailVerification|null>}
   */
  static async findActiveByUser(userId) {
    const db = await this.getDb();
    const now = new Date().toISOString();
    const row = db
      .prepare(
        `
      SELECT * FROM email_verifications 
      WHERE user_id = ? AND expires_at > ? AND verified = 0 
      ORDER BY created_at DESC 
      LIMIT 1
    `,
      )
      .get(userId, now);
    return row ? new EmailVerification(row) : null;
  }

  /**
   * Создать новую верификацию
   * @param {Object} data
   * @param {number} data.userId
   * @param {string} data.token
   * @param {Date} data.expiresAt
   * @returns {Promise<EmailVerification>}
   */
  static async create(data) {
    const db = await this.getDb();

    // Удалить старые активные верификации пользователя
    db.prepare(
      `
      DELETE FROM email_verifications 
      WHERE user_id = ? AND verified = 0
    `,
    ).run(data.userId);

    const result = db
      .prepare(
        `
      INSERT INTO email_verifications (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `,
      )
      .run(data.userId, data.token, data.expiresAt.toISOString());

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Создать верификацию с новым токеном
   * @param {number} userId
   * @param {number} [expiresInHours=24]
   * @returns {Promise<{verification: EmailVerification, token: string}>}
   */
  static async createWithToken(userId, expiresInHours = 24) {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const verification = await this.create({
      userId,
      token,
      expiresAt,
    });

    return { verification, token };
  }

  /**
   * Подтвердить верификацию
   * @returns {Promise<void>}
   */
  async markAsVerified() {
    const db = await this.getDb();
    db.prepare(
      `
      UPDATE email_verifications SET verified = 1 WHERE id = ?
    `,
    ).run(this.id);
    this.verified = true;
  }

  /**
   * Проверить валидность токена
   * @returns {boolean}
   */
  isValid() {
    const now = new Date();
    const expiresAt = new Date(this.expiresAt);
    return !this.verified && now < expiresAt;
  }

  /**
   * Удалить просроченные верификации
   * @returns {Promise<number>}
   */
  static async cleanupExpired() {
    const db = await this.getDb();
    const now = new Date().toISOString();
    const result = db
      .prepare(
        `
      DELETE FROM email_verifications WHERE expires_at < ?
    `,
      )
      .run(now);
    return result.changes;
  }
}

export default EmailVerification;
