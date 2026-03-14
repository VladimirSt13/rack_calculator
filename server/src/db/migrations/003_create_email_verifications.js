/**
 * Міграція 003: Створення таблиці email_verifications
 *
 * Призначення:
 * - Зберігання токенів для підтвердження email
 * - Контроль терміну дії токенів
 */

export const up = (db) => {
  console.log("[Migration 003] Creating email_verifications table...");

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("[Migration 003] Created email_verifications table");

    // Створюємо індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id)
    `);
    console.log("[Migration 003] Created index on user_id");

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token)
    `);
    console.log("[Migration 003] Created index on token");

    console.log("[Migration 003] Completed successfully");
  } catch (error) {
    console.error("[Migration 003] Error:", error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log("[Migration 003] Rolling back...");

  db.exec("DROP TABLE IF EXISTS email_verifications");

  console.log("[Migration 003] Rollback completed");
};

export default { up, down };
