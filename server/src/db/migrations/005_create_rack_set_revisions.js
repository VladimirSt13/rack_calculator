/**
 * Міграція 005: Створення таблиці rack_set_revisions
 * 
 * Призначення:
 * - Збереження історії змін комплектів стелажів
 * - Можливість відновлення попередніх версій
 */

export const up = (db) => {
  console.log('[Migration 005] Creating rack_set_revisions table...');
  
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS rack_set_revisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rack_set_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        racks JSON NOT NULL,
        total_cost REAL,
        change_type TEXT CHECK(change_type IN ('create', 'update', 'delete')) NOT NULL,
        change_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rack_set_id) REFERENCES rack_sets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('[Migration 005] Created rack_set_revisions table');
    
    // Створюємо індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_revisions_rack_set_id ON rack_set_revisions(rack_set_id)
    `);
    console.log('[Migration 005] Created index on rack_set_id');
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_revisions_user_id ON rack_set_revisions(user_id)
    `);
    console.log('[Migration 005] Created index on user_id');
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_revisions_created_at ON rack_set_revisions(created_at)
    `);
    console.log('[Migration 005] Created index on created_at');
    
    console.log('[Migration 005] Completed successfully');
  } catch (error) {
    console.error('[Migration 005] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 005] Rolling back...');
  
  db.exec('DROP TABLE IF EXISTS rack_set_revisions');
  
  console.log('[Migration 005] Rollback completed');
};

export default { up, down };
