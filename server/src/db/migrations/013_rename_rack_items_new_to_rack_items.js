/**
 * Міграція 013: Перейменування rack_items_new → rack_items
 *
 * Призначення:
 * - Перейменувати колонку rack_items_new на rack_items
 * - Це основна колонка для зберігання елементів комплекту
 *
 * Примітка: SQLite не підтримує RENAME COLUMN безпосередньо в старих версіях,
 * тому створюємо тимчасову таблицю
 */

export const up = (db) => {
  console.log('[Migration 013] Renaming rack_items_new to rack_items...');

  try {
    // Створення тимчасової таблиці з новою назвою колонки
    db.exec(`
      CREATE TABLE rack_sets_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        object_name TEXT,
        description TEXT,
        rack_items JSON NOT NULL,
        total_cost_snapshot REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('[Migration 013] Created rack_sets_new table');

    // Перенести дані з rack_sets в rack_sets_new
    db.exec(`
      INSERT INTO rack_sets_new (id, user_id, name, object_name, description, rack_items, total_cost_snapshot, created_at, updated_at)
      SELECT id, user_id, name, object_name, description, rack_items_new, total_cost_snapshot, created_at, updated_at
      FROM rack_sets
    `);
    console.log('[Migration 013] Migrated data to rack_sets_new');

    // Видалити стару таблицю
    db.exec('DROP TABLE rack_sets');
    console.log('[Migration 013] Dropped old rack_sets table');

    // Перейменувати нову таблицю
    db.exec('ALTER TABLE rack_sets_new RENAME TO rack_sets');
    console.log('[Migration 013] Renamed rack_sets_new to rack_sets');

    // Відновити індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_user_id ON rack_sets(user_id)
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_created_at ON rack_sets(created_at)
    `);
    console.log('[Migration 013] Recreated indexes');

    // Відновити тригер для updated_at
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_rack_sets_updated_at
      AFTER UPDATE ON rack_sets
      BEGIN
        UPDATE rack_sets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
    console.log('[Migration 013] Recreated trigger for updated_at');

    console.log('[Migration 013] Completed successfully');
  } catch (error) {
    console.error('[Migration 013] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 013] Rolling back...');

  try {
    // Створення тимчасової таблиці зі старою назвою колонки
    db.exec(`
      CREATE TABLE rack_sets_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        object_name TEXT,
        description TEXT,
        rack_items_new JSON NOT NULL,
        total_cost_snapshot REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('[Migration 013] Created rack_sets_new table for rollback');

    // Перенести дані назад
    db.exec(`
      INSERT INTO rack_sets_new (id, user_id, name, object_name, description, rack_items_new, total_cost_snapshot, created_at, updated_at)
      SELECT id, user_id, name, object_name, description, rack_items, total_cost_snapshot, created_at, updated_at
      FROM rack_sets
    `);
    console.log('[Migration 013] Migrated data back');

    // Видалити нову таблицю
    db.exec('DROP TABLE rack_sets');
    console.log('[Migration 013] Dropped rack_sets table');

    // Перейменувати нову таблицю
    db.exec('ALTER TABLE rack_sets_new RENAME TO rack_sets');
    console.log('[Migration 013] Renamed rack_sets_new to rack_sets');

    // Відновити індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_user_id ON rack_sets(user_id)
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_created_at ON rack_sets(created_at)
    `);
    console.log('[Migration 013] Recreated indexes');

    // Відновити тригер для updated_at
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_rack_sets_updated_at
      AFTER UPDATE ON rack_sets
      BEGIN
        UPDATE rack_sets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
    console.log('[Migration 013] Recreated trigger for updated_at');

    console.log('[Migration 013] Rollback completed');
  } catch (error) {
    console.error('[Migration 013] Rollback error:', error.message);
    throw error;
  }
};

export default { up, down };
