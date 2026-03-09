/**
 * Міграція 014: Додати поле braces до rack_configurations
 *
 * Призначення:
 * - Додати поле для зберігання типу розкосів (брейсів)
 * - Формат: JSON або простий рядок (наприклад, "D1000")
 */

export const up = (db) => {
  console.log('[Migration 014] Adding braces column to rack_configurations...');

  try {
    // Додати поле braces
    try {
      db.exec(`
        ALTER TABLE rack_configurations ADD COLUMN braces TEXT
      `);
      console.log('[Migration 014] Added braces column');
    } catch (e) {
      console.log('[Migration 014] braces column already exists');
    }

    // Оновити унікальний індекс для врахування braces
    // SQLite не підтримує DROP COLUMN, тому створюємо нову таблицю
    db.exec(`
      CREATE TABLE IF NOT EXISTS rack_configurations_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        floors INTEGER NOT NULL,
        rows INTEGER NOT NULL,
        beams_per_row INTEGER NOT NULL,
        supports TEXT,
        vertical_supports TEXT,
        spans JSON,
        braces TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(floors, rows, beams_per_row, supports, vertical_supports, spans, braces)
      )
    `);
    console.log('[Migration 014] Created rack_configurations_new table');

    // Перенести дані
    db.exec(`
      INSERT INTO rack_configurations_new (id, floors, rows, beams_per_row, supports, vertical_supports, spans, braces, created_at)
      SELECT id, floors, rows, beams_per_row, supports, vertical_supports, spans, braces, created_at
      FROM rack_configurations
    `);
    console.log('[Migration 014] Migrated data');

    // Видалити стару таблицю
    db.exec('DROP TABLE IF EXISTS rack_configurations');
    console.log('[Migration 014] Dropped old table');

    // Перейменувати
    db.exec('ALTER TABLE rack_configurations_new RENAME TO rack_configurations');
    console.log('[Migration 014] Renamed table');

    // Відновити індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_config_unique
      ON rack_configurations(floors, rows, beams_per_row)
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_configurations_created_at
      ON rack_configurations(created_at)
    `);
    console.log('[Migration 014] Recreated indexes');

    console.log('[Migration 014] Completed successfully');
  } catch (error) {
    console.error('[Migration 014] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 014] Rolling back...');

  try {
    // Створити стару таблицю без braces
    db.exec(`
      CREATE TABLE IF NOT EXISTS rack_configurations_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        floors INTEGER NOT NULL,
        rows INTEGER NOT NULL,
        beams_per_row INTEGER NOT NULL,
        supports TEXT,
        vertical_supports TEXT,
        spans JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(floors, rows, beams_per_row, supports, vertical_supports, spans)
      )
    `);
    console.log('[Migration 014] Created rack_configurations_new for rollback');

    // Перенести дані без braces
    db.exec(`
      INSERT INTO rack_configurations_new (id, floors, rows, beams_per_row, supports, vertical_supports, spans, created_at)
      SELECT id, floors, rows, beams_per_row, supports, vertical_supports, spans, created_at
      FROM rack_configurations
    `);
    console.log('[Migration 014] Migrated data back');

    // Видалити нову таблицю
    db.exec('DROP TABLE IF EXISTS rack_configurations');
    console.log('[Migration 014] Dropped rack_configurations');

    // Перейменувати
    db.exec('ALTER TABLE rack_configurations_new RENAME TO rack_configurations');
    console.log('[Migration 014] Renamed table');

    // Відновити індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_config_unique
      ON rack_configurations(floors, rows, beams_per_row)
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_configurations_created_at
      ON rack_configurations(created_at)
    `);
    console.log('[Migration 014] Recreated indexes');

    console.log('[Migration 014] Rollback completed');
  } catch (error) {
    console.error('[Migration 014] Rollback error:', error.message);
    throw error;
  }
};

export default { up, down };
