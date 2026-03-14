/**
 * Міграція 011: Створення таблиці rack_configurations
 *
 * Призначення:
 * - Нормалізація даних стелажів
 * - Окрема таблиця конфігурацій стелажів
 * - Посилання на конфігурації в rack_sets через rack_items
 * - Зберігання snapshot загальної вартості
 */

export const up = (db) => {
  console.log("[Migration 011] Creating rack_configurations table...");

  try {
    // 1. Створення таблиці конфігурацій стелажів
    db.exec(`
      CREATE TABLE IF NOT EXISTS rack_configurations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        
        -- Унікальні параметри конфігурації
        floors INTEGER NOT NULL,
        rows INTEGER NOT NULL,
        beams_per_row INTEGER NOT NULL,
        supports TEXT,  -- JSON: тип опор
        vertical_supports TEXT,  -- JSON: тип вертикальних
        spans JSON,  -- масив прольотів
        
        -- Метадані
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Унікальний індекс для пошуку однакових конфігурацій
        UNIQUE(floors, rows, beams_per_row, supports, vertical_supports, spans)
      )
    `);
    console.log("[Migration 011] Created rack_configurations table");

    // 2. Додати нові поля до rack_sets для нової структури
    console.log("[Migration 011] Adding columns to rack_sets...");

    // Додаємо поле для нової структури rack_items (масив {rack_config_id, quantity})
    try {
      db.exec(`
        ALTER TABLE rack_sets ADD COLUMN rack_items_new JSON
      `);
      console.log("[Migration 011] Added rack_items_new column");
    } catch (e) {
      // Ігноруємо, якщо колонка вже існує
      console.log("[Migration 011] rack_items_new column already exists");
    }

    // Додаємо поле для snapshot загальної вартості
    try {
      db.exec(`
        ALTER TABLE rack_sets ADD COLUMN total_cost_snapshot REAL
      `);
      console.log("[Migration 011] Added total_cost_snapshot column");
    } catch (e) {
      // Ігноруємо, якщо колонка вже існує
      console.log("[Migration 011] total_cost_snapshot column already exists");
    }

    // 3. Створення індексів для оптимізації
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_config_unique 
      ON rack_configurations(floors, rows, beams_per_row)
    `);
    console.log("[Migration 011] Created index on rack_configurations");

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rack_configurations_created_at 
      ON rack_configurations(created_at)
    `);
    console.log("[Migration 011] Created index on created_at");

    console.log("[Migration 011] Completed successfully");
  } catch (error) {
    console.error("[Migration 011] Error:", error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log("[Migration 011] Rolling back...");

  try {
    // Видалення індексів
    db.exec("DROP INDEX IF EXISTS idx_rack_config_unique");
    db.exec("DROP INDEX IF EXISTS idx_rack_configurations_created_at");

    // Видалення таблиці конфігурацій
    db.exec("DROP TABLE IF EXISTS rack_configurations");

    // Примітка: не видаляємо додані колонки з rack_sets,
    // оскільки SQLite не підтримує DROP COLUMN безпосередньо
    // Для повного відкату потрібно створити тимчасову таблицю

    console.log("[Migration 011] Rollback completed");
  } catch (error) {
    console.error("[Migration 011] Rollback error:", error.message);
    throw error;
  }
};

export default { up, down };
