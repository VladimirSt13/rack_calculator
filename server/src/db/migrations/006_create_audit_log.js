/**
 * Міграція 006: Створення таблиці audit_log
 * 
 * Призначення:
 * - Логування всіх важливих дій в системі
 * - Відстеження змін даних
 */

export const up = (db) => {
  console.log('[Migration 006] Creating audit_log table...');
  
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        old_value JSON,
        new_value JSON,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('[Migration 006] Created audit_log table');
    
    // Створюємо індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id)
    `);
    console.log('[Migration 006] Created index on user_id');
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id)
    `);
    console.log('[Migration 006] Created index on entity');
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at)
    `);
    console.log('[Migration 006] Created index on created_at');
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action)
    `);
    console.log('[Migration 006] Created index on action');
    
    console.log('[Migration 006] Completed successfully');
  } catch (error) {
    console.error('[Migration 006] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 006] Rolling back...');
  
  db.exec('DROP TABLE IF EXISTS audit_log');
  
  console.log('[Migration 006] Rollback completed');
};

export default { up, down };
