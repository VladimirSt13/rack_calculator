import { BaseModel } from './BaseModel.js';

/**
 * Модель пользователя
 */
export class User extends BaseModel {
  constructor(data) {
    super(data);
    this.id = data.id;
    this.email = data.email;
    this.passwordHash = data.password_hash;
    this.role = data.role;
    this.permissions = data.permissions ? JSON.parse(data.permissions) : null;
    this.emailVerified = Boolean(data.email_verified);
    this.verificationToken = data.verification_token;
    this.createdAt = data.created_at;
  }

  static get tableName() {
    return 'users';
  }

  /**
   * Найти пользователя по email
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  static async findByEmail(email) {
    const db = await this.getDb();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    return row ? new User(row) : null;
  }

  /**
   * Найти пользователя по токену верификации
   * @param {string} token
   * @returns {Promise<User|null>}
   */
  static async findByVerificationToken(token) {
    const db = await this.getDb();
    const row = db.prepare('SELECT * FROM users WHERE verification_token = ?').get(token);
    return row ? new User(row) : null;
  }

  /**
   * Найти пользователей по роли
   * @param {string} role
   * @returns {Promise<User[]>}
   */
  static async findByRole(role) {
    const db = await this.getDb();
    const rows = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC').all(role);
    return rows.map(row => new User(row));
  }

  /**
   * Создать нового пользователя
   * @param {Object} data
   * @param {string} data.email
   * @param {string} data.passwordHash
   * @param {string} [data.role='user']
   * @param {Object} [data.permissions]
   * @returns {Promise<User>}
   */
  static async create(data) {
    const userData = {
      email: data.email,
      password_hash: data.passwordHash,
      role: data.role || 'user',
      permissions: data.permissions ? JSON.stringify(data.permissions) : null,
      email_verified: data.emailVerified ? 1 : 0,
      verification_token: data.verificationToken || null,
    };

    const db = await this.getDb();
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, role, permissions, email_verified, verification_token)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userData.email,
      userData.password_hash,
      userData.role,
      userData.permissions,
      userData.email_verified,
      userData.verification_token
    );

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Обновить пользователя
   * @param {Object} data
   * @returns {Promise<User>}
   */
  async update(data) {
    const updateData = {};

    if (data.email !== undefined) updateData.email = data.email;
    if (data.passwordHash !== undefined) updateData.password_hash = data.passwordHash;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.permissions !== undefined) updateData.permissions = JSON.stringify(data.permissions);
    if (data.emailVerified !== undefined) updateData.email_verified = data.emailVerified ? 1 : 0;
    if (data.verificationToken !== undefined) updateData.verification_token = data.verificationToken;

    const updated = await BaseModel.update(User.tableName, this.id, updateData);
    Object.assign(this, updated);
    return this;
  }

  /**
   * Проверка наличия роли
   * @param {string} role
   * @returns {boolean}
   */
  hasRole(role) {
    return this.role === role;
  }

  /**
   * Проверка наличия права
   * @param {string} permission
   * @returns {boolean}
   */
  hasPermission(permission) {
    if (!this.permissions) return false;
    return this.permissions.includes(permission);
  }

  /**
   * Преобразование в объект для ответа API (без чувствительных данных)
   * @returns {Object}
   */
  toSafeObject() {
    const { passwordHash, verificationToken, ...safe } = this;
    return {
      id: safe.id,
      email: safe.email,
      role: safe.role,
      permissions: safe.permissions,
      emailVerified: safe.emailVerified,
      createdAt: safe.createdAt,
    };
  }
}

export default User;
