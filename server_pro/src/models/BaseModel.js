import { getDb } from '../db/index.js';

/**
 * Base Model - загальні CRUD операції
 */
export class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  getDb() {
    return getDb();
  }

  findAll(where = '', params = []) {
    const sql = where ? `SELECT * FROM ${this.tableName} WHERE ${where}` : `SELECT * FROM ${this.tableName}`;
    return this.getDb().prepare(sql).all(...params);
  }

  findById(id) {
    return this.getDb().prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(id);
  }

  create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = this.getDb().prepare(sql).run(...values);
    
    return this.findById(result.lastInsertRowid);
  }

  update(id, data) {
    const keys = Object.keys(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const sql = `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    this.getDb().prepare(sql).run(...Object.values(data), id);
    
    return this.findById(id);
  }

  delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    return this.getDb().prepare(sql).run(id);
  }
}

export default BaseModel;
