/**
 * Міграція 017: Додавання поля category до prices
 *
 * Призначення:
 * - Додати поле category для зберігання ключа категорії
 * - Додати індекс для швидкої фільтрації
 * - Забезпечити цілісність даних
 *
 * Зміни:
 * - ALTER TABLE prices ADD COLUMN category TEXT
 * - CREATE INDEX idx_prices_category
 */

export const up = (db) => {
  console.log('[Migration 017] Adding category field to prices table...');

  try {
    // ============================================
    // 1. Додавання поля category
    // ============================================
    console.log('[Migration 017] Adding category column...');

    try {
      // Перевіряємо чи поле вже існує
      const tableInfo = db.prepare("PRAGMA table_info(prices)").all();
      const hasCategoryField = tableInfo.some(col => col.name === 'category');

      if (!hasCategoryField) {
        // Додаємо нове поле
        db.exec(`
          ALTER TABLE prices ADD COLUMN category TEXT
        `);
        console.log('[Migration 017] Added category column');
      } else {
        console.log('[Migration 017] category column already exists');
      }
    } catch (e) {
      console.error('[Migration 017] Error adding category column:', e.message);
      throw e;
    }

    // ============================================
    // 2. Створення індексу для category
    // ============================================
    console.log('[Migration 017] Creating index on category...');

    try {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_prices_category ON prices(category)
      `);
      console.log('[Migration 017] Created index idx_prices_category');
    } catch (e) {
      console.log('[Migration 017] Index already exists or error:', e.message);
    }

    // ============================================
    // 3. Оновлення існуючих записів (якщо є)
    // ============================================
    console.log('[Migration 017] Updating existing records...');

    try {
      // Отримуємо всі записи з prices
      const allPrices = db.prepare('SELECT id, data FROM prices').all();

      for (const record of allPrices) {
        try {
          const data = JSON.parse(record.data);
          
          // Визначаємо категорії з даних
          const categories = new Set();
          
          if (data.supports && Object.keys(data.supports).length > 0) {
            categories.add('supports');
          }
          if (data.spans && Object.keys(data.spans).length > 0) {
            categories.add('spans');
          }
          if (data.vertical_supports && Object.keys(data.vertical_supports).length > 0) {
            categories.add('vertical_supports');
          }
          if (data.diagonal_brace && Object.keys(data.diagonal_brace).length > 0) {
            categories.add('diagonal_brace');
          }
          if (data.isolator && Object.keys(data.isolator).length > 0) {
            categories.add('isolator');
          }

          // Зберігаємо список категорій як JSON
          if (categories.size > 0) {
            const categoryJson = JSON.stringify(Array.from(categories));
            db.prepare(`
              UPDATE prices SET category = ? WHERE id = ?
            `).run(categoryJson, record.id);
          }
        } catch (e) {
          console.log(`[Migration 017] Error processing record ${record.id}:`, e.message);
        }
      }

      console.log(`[Migration 017] Updated ${allPrices.length} records`);
    } catch (e) {
      console.log('[Migration 017] Error updating records:', e.message);
    }

    console.log('[Migration 017] Completed successfully');
  } catch (error) {
    console.error('[Migration 017] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 017] Rolling back category field...');

  try {
    // Видалення індексу
    db.exec(`DROP INDEX IF EXISTS idx_prices_category`);
    console.log('[Migration 017] Dropped index idx_prices_category');

    // Видалення поля (SQLite потребує перестворення таблиці)
    db.exec(`
      CREATE TABLE IF NOT EXISTS prices_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data JSON NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      INSERT INTO prices_new (id, data, updated_at)
      SELECT id, data, updated_at FROM prices
    `);

    db.exec('DROP TABLE prices');
    db.exec('ALTER TABLE prices_new RENAME TO prices');

    console.log('[Migration 017] Removed category column');
  } catch (error) {
    console.error('[Migration 017] Rollback error:', error.message);
    throw error;
  }
};

export default { up, down };
