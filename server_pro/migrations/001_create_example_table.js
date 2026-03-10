/**
 * Migration 001: Create example table
 * 
 * Ця міграція демонструє створення нової таблиці
 * з підтримкою soft delete
 */

export const up = (db) => {
  console.log('[Migration 001] Creating example table...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS example (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      user_id INTEGER REFERENCES users(id),
      deleted BOOLEAN DEFAULT 0,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_example_user ON example(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_example_deleted ON example(deleted)');
  
  console.log('[Migration 001] Completed');
};

export const down = (db) => {
  console.log('[Migration 001] Rolling back...');
  
  db.exec('DROP TABLE IF EXISTS example');
  
  console.log('[Migration 001] Rolled back');
};

export default { up, down };
