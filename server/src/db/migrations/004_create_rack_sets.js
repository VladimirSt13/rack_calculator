/**
 * Міграція 004: Створення таблиці rack_sets
 * 
 * Призначення:
 * - Збереження комплектів стелажів
 * - Зберігання конфігурації, вартості, метаданих
 */

export const up = (db) => {
  console.log('[Migration 004] Creating rack_sets table...');
  
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS rack_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        object_name TEXT,
        description TEXT,
        racks JSON NOT NULL,
        total_cost REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('[Migration 004] Created rack_sets table');
    
    // Створюємо індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_user_id ON rack_sets(user_id)
    `);
    console.log('[Migration 004] Created index on user_id');
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_created_at ON rack_sets(created_at)
    `);
    console.log('[Migration 004] Created index on created_at');
    
    // Тригер для оновлення updated_at
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_rack_sets_updated_at 
      AFTER UPDATE ON rack_sets
      BEGIN
        UPDATE rack_sets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
    console.log('[Migration 004] Created trigger for updated_at');
    
    console.log('[Migration 004] Completed successfully');
  } catch (error) {
    console.error('[Migration 004] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 004] Rolling back...');
  
  db.exec('DROP TRIGGER IF EXISTS update_rack_sets_updated_at');
  db.exec('DROP TABLE IF EXISTS rack_sets');
  
  console.log('[Migration 004] Rollback completed');
};

export default { up, down };
