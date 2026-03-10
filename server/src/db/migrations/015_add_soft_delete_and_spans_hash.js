/**
 * Міграція 015: Додавання полів soft delete та spans_hash
 *
 * Призначення:
 * - Додати поля deleted, deleted_at до rack_sets для м'якого видалення
 * - Додати поле spans_hash до rack_configurations для швидкого пошуку
 * - Створити індекси для оптимізації
 */

import crypto from 'crypto';

export const up = (db) => {
  console.log('[Migration 015] Adding soft delete and spans_hash fields...');

  try {
    // ============================================
    // 1. Додати поля deleted до rack_sets
    // ============================================
    console.log('[Migration 015] Adding deleted fields to rack_sets...');

    try {
      db.exec(`
        ALTER TABLE rack_sets ADD COLUMN deleted BOOLEAN DEFAULT 0
      `);
      console.log('[Migration 015] Added deleted column');
    } catch (e) {
      console.log('[Migration 015] deleted column already exists');
    }

    try {
      db.exec(`
        ALTER TABLE rack_sets ADD COLUMN deleted_at DATETIME
      `);
      console.log('[Migration 015] Added deleted_at column');
    } catch (e) {
      console.log('[Migration 015] deleted_at column already exists');
    }

    // Створити індекс для deleted
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_deleted ON rack_sets(deleted)
    `);
    console.log('[Migration 015] Created index on deleted');

    // ============================================
    // 2. Додати поле spans_hash до rack_configurations
    // ============================================
    console.log('[Migration 015] Adding spans_hash to rack_configurations...');

    try {
      db.exec(`
        ALTER TABLE rack_configurations ADD COLUMN spans_hash TEXT
      `);
      console.log('[Migration 015] Added spans_hash column');
    } catch (e) {
      console.log('[Migration 015] spans_hash column already exists');
    }

    // ============================================
    // 3. Заповнити spans_hash для існуючих записів
    // ============================================
    console.log('[Migration 015] Populating spans_hash for existing records...');

    const configs = db.prepare('SELECT id, spans FROM rack_configurations WHERE spans IS NOT NULL').all();
    const update = db.prepare('UPDATE rack_configurations SET spans_hash = ? WHERE id = ?');

    for (const config of configs) {
      try {
        const spans = JSON.parse(config.spans);
        const spansHash = crypto.createHash('sha256').update(JSON.stringify(spans)).digest('hex');
        update.run(spansHash, config.id);
      } catch (e) {
        console.warn(`[Migration 015] Error processing config ${config.id}:`, e.message);
      }
    }

    console.log(`[Migration 015] Updated ${configs.length} records`);

    // ============================================
    // 4. Створити унікальний індекс з spans_hash
    // ============================================
    console.log('[Migration 015] Creating unique index with spans_hash...');

    // SQLite не дозволяє змінити існуючий UNIQUE constraint,
    // тому створюємо нову таблицю
    db.exec(`
      CREATE TABLE IF NOT EXISTS rack_configurations_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        floors INTEGER NOT NULL,
        rows INTEGER NOT NULL,
        beams_per_row INTEGER NOT NULL,
        supports TEXT,
        vertical_supports TEXT,
        spans TEXT NOT NULL,
        spans_hash TEXT NOT NULL,
        braces TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(floors, rows, beams_per_row, supports, vertical_supports, spans_hash, braces)
      )
    `);
    console.log('[Migration 015] Created rack_configurations_new table');

    // Перенести дані
    db.exec(`
      INSERT INTO rack_configurations_new (id, floors, rows, beams_per_row, supports, vertical_supports, spans, spans_hash, braces, created_at)
      SELECT id, floors, rows, beams_per_row, supports, vertical_supports, spans, spans_hash, braces, created_at
      FROM rack_configurations
    `);
    console.log('[Migration 015] Migrated data');

    // Видалити стару таблицю
    db.exec('DROP TABLE IF EXISTS rack_configurations');
    console.log('[Migration 015] Dropped old table');

    // Перейменувати
    db.exec('ALTER TABLE rack_configurations_new RENAME TO rack_configurations');
    console.log('[Migration 015] Renamed table');

    // ============================================
    // 5. Створити індекси
    // ============================================
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_config_spans_hash ON rack_configurations(spans_hash)
    `);
    console.log('[Migration 015] Created index on spans_hash');

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_configurations_created_at ON rack_configurations(created_at)
    `);
    console.log('[Migration 015] Created index on created_at');

    console.log('[Migration 015] Completed successfully');
  } catch (error) {
    console.error('[Migration 015] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 015] Rolling back...');

  try {
    // Видалити індекси
    db.exec('DROP INDEX IF EXISTS idx_rack_sets_deleted');
    db.exec('DROP INDEX IF EXISTS idx_rack_config_spans_hash');

    // Видалити поля з rack_sets
    // SQLite не підтримує DROP COLUMN, тому створюємо нову таблицю
    db.exec(`
      CREATE TABLE IF NOT EXISTS rack_sets_new (
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

    db.exec(`
      INSERT INTO rack_sets_new (id, user_id, name, object_name, description, rack_items, total_cost_snapshot, created_at, updated_at)
      SELECT id, user_id, name, object_name, description, rack_items, total_cost_snapshot, created_at, updated_at
      FROM rack_sets
    `);

    db.exec('DROP TABLE IF EXISTS rack_sets');
    db.exec('ALTER TABLE rack_sets_new RENAME TO rack_sets');

    // Відновити індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_user_id ON rack_sets(user_id)
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_sets_created_at ON rack_sets(created_at)
    `);

    // Видалити поле spans_hash з rack_configurations
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

    db.exec(`
      INSERT INTO rack_configurations_new (id, floors, rows, beams_per_row, supports, vertical_supports, spans, braces, created_at)
      SELECT id, floors, rows, beams_per_row, supports, vertical_supports, spans, braces, created_at
      FROM rack_configurations
    `);

    db.exec('DROP TABLE IF EXISTS rack_configurations');
    db.exec('ALTER TABLE rack_configurations_new RENAME TO rack_configurations');

    // Відновити індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_config_unique ON rack_configurations(floors, rows, beams_per_row)
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_configurations_created_at ON rack_configurations(created_at)
    `);

    console.log('[Migration 015] Rollback completed');
  } catch (error) {
    console.error('[Migration 015] Rollback error:', error.message);
    throw error;
  }
};

export default { up, down };
