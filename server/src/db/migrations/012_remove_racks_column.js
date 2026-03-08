/**
 * Міграція 012: Видалення поля racks з rack_sets
 *
 * Призначення:
 * - Видалити дублююче поле racks (старі дані для зворотної сумісності)
 * - Використовувати тільки rack_items_new для посилання на конфігурації
 * - Нормалізація даних, уникнення дублювання
 *
 * Примітка: SQLite не підтримує DROP COLUMN безпосередньо,
 * тому потрібно створити тимчасову таблицю без поля racks
 */

export const up = (db) => {
  console.log('[Migration 012] Removing racks column from rack_sets...');

  try {
    // Отримати поточні дані для перевірки
    const existingSets = db.prepare('SELECT id, racks, rack_items_new FROM rack_sets').all();
    
    // Перевірити чи є дані в racks, які не містяться в rack_items_new
    let needsMigration = false;
    for (const set of existingSets) {
      if (set.racks && !set.rack_items_new) {
        needsMigration = true;
        console.log(`[Migration 012] Set ${set.id} has racks data without rack_items_new`);
      }
    }

    if (needsMigration) {
      throw new Error(
        'Cannot remove racks column: some sets have racks data without rack_items_new. ' +
        'Please migrate data first.'
      );
    }

    // Створення тимчасової таблиці без поля racks
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
    console.log('[Migration 012] Created rack_sets_new table');

    // Перенести дані з rack_sets в rack_sets_new
    db.exec(`
      INSERT INTO rack_sets_new (id, user_id, name, object_name, description, rack_items_new, total_cost_snapshot, created_at, updated_at)
      SELECT id, user_id, name, object_name, description, rack_items_new, total_cost_snapshot, created_at, updated_at
      FROM rack_sets
    `);
    console.log('[Migration 012] Migrated data to rack_sets_new');

    // Видалити стару таблицю
    db.exec('DROP TABLE rack_sets');
    console.log('[Migration 012] Dropped old rack_sets table');

    // Перейменувати нову таблицю
    db.exec('ALTER TABLE rack_sets_new RENAME TO rack_sets');
    console.log('[Migration 012] Renamed rack_sets_new to rack_sets');

    // Відновити індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_user_id ON rack_sets(user_id)
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_created_at ON rack_sets(created_at)
    `);
    console.log('[Migration 012] Recreated indexes');

    // Відновити тригер для updated_at
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_rack_sets_updated_at
      AFTER UPDATE ON rack_sets
      BEGIN
        UPDATE rack_sets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
    console.log('[Migration 012] Recreated trigger for updated_at');

    console.log('[Migration 012] Completed successfully');
  } catch (error) {
    console.error('[Migration 012] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 012] Rolling back...');

  try {
    // Створення тимчасової таблиці з полем racks
    db.exec(`
      CREATE TABLE rack_sets_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        object_name TEXT,
        description TEXT,
        racks JSON NOT NULL,
        rack_items_new JSON,
        total_cost_snapshot REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('[Migration 012] Created rack_sets_new table for rollback');

    // Перенести дані назад з порожнім racks
    db.exec(`
      INSERT INTO rack_sets_new (id, user_id, name, object_name, description, racks, rack_items_new, total_cost_snapshot, created_at, updated_at)
      SELECT id, user_id, name, object_name, description, '[]', rack_items_new, total_cost_snapshot, created_at, updated_at
      FROM rack_sets
    `);
    console.log('[Migration 012] Migrated data back');

    // Видалити нову таблицю
    db.exec('DROP TABLE rack_sets');
    console.log('[Migration 012] Dropped rack_sets table');

    // Перейменувати нову таблицю
    db.exec('ALTER TABLE rack_sets_new RENAME TO rack_sets');
    console.log('[Migration 012] Renamed rack_sets_new to rack_sets');

    // Відновити індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_user_id ON rack_sets(user_id)
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_created_at ON rack_sets(created_at)
    `);
    console.log('[Migration 012] Recreated indexes');

    // Відновити тригер для updated_at
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_rack_sets_updated_at
      AFTER UPDATE ON rack_sets
      BEGIN
        UPDATE rack_sets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
    console.log('[Migration 012] Recreated trigger for updated_at');

    console.log('[Migration 012] Rollback completed');
  } catch (error) {
    console.error('[Migration 012] Rollback error:', error.message);
    throw error;
  }
};

export default { up, down };
