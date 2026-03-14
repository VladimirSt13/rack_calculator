/**
 * Міграція 007: Створення таблиці password_resets
 *
 * Призначення:
 * - Зберігання токенів для скидання пароля
 * - Контроль терміну дії токенів (1 година)
 */

export const up = (db) => {
  console.log("[Migration 007] Creating password_resets table...");

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("[Migration 007] Created password_resets table");

    // Створюємо індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id)
    `);
    console.log("[Migration 007] Created index on user_id");

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash)
    `);
    console.log("[Migration 007] Created index on token_hash");

    console.log("[Migration 007] Completed successfully");
  } catch (error) {
    console.error("[Migration 007] Error:", error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log("[Migration 007] Rolling back...");

  db.exec("DROP TABLE IF EXISTS password_resets");

  console.log("[Migration 007] Rollback completed");
};

export default { up, down };
