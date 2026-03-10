import BaseModel from './BaseModel.js';
import crypto from 'crypto';

/**
 * RefreshToken Model
 */
export class RefreshToken extends BaseModel {
  constructor() {
    super('refresh_tokens');
  }

  findByUserId(userId) {
    return this.getDb().prepare(`
      SELECT * FROM refresh_tokens 
      WHERE user_id = ? AND revoked = 0 AND expires_at > datetime('now')
    `).all(userId);
  }

  async createToken(userId, expiresInDays = 30) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    this.create({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      revoked: 0,
    });
    
    return token;
  }

  async validateToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const record = this.getDb().prepare(`
      SELECT rt.*, u.email, u.role, u.permissions 
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token_hash = ? AND rt.revoked = 0 AND rt.expires_at > datetime('now')
    `).get(tokenHash);
    
    if (!record) {
      return null;
    }
    
    return {
      id: record.id,
      userId: record.user_id,
      email: record.email,
      role: record.role,
      permissions: JSON.parse(record.permissions || '[]'),
    };
  }

  async revokeToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    this.getDb().prepare('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?').run(tokenHash);
  }

  async revokeAllUserTokens(userId) {
    this.getDb().prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?').run(userId);
  }

  // Cleanup expired tokens
  cleanupExpiredTokens(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = this.getDb().prepare(`
      DELETE FROM refresh_tokens 
      WHERE expires_at < ? OR (revoked = 1 AND created_at < ?)
    `).run(cutoffDate.toISOString(), cutoffDate.toISOString());
    
    return result.changes;
  }
}

export default new RefreshToken();
