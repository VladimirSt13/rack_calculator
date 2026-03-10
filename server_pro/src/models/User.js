import BaseModel from './BaseModel.js';
import bcrypt from 'bcryptjs';

/**
 * User Model
 */
export class User extends BaseModel {
  constructor() {
    super('users');
  }

  findByEmail(email) {
    return this.getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  async create(userData) {
    const { email, password, role = 'user', permissions = [] } = userData;
    
    // Check if user exists
    const existing = this.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const user = super.create({
      email,
      password_hash: passwordHash,
      role,
      permissions: JSON.stringify(permissions),
      email_verified: 0,
    });
    
    // Remove sensitive data
    delete user.password_hash;
    
    return user;
  }

  async validatePassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }

  getPermissions(user) {
    return JSON.parse(user.permissions || '[]');
  }

  setPermissions(userId, permissions) {
    return this.update(userId, { permissions: JSON.stringify(permissions) });
  }

  // Soft delete
  softDelete(id) {
    return this.update(id, { deleted: 1, deleted_at: new Date().toISOString() });
  }

  findDeleted() {
    return this.getDb().prepare('SELECT * FROM users WHERE deleted = 1').all();
  }

  restore(id) {
    return this.update(id, { deleted: 0, deleted_at: null });
  }
}

export default new User();
