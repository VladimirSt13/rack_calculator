/**
 * Міграція 008: Оновлення ролі з 'other' на 'user'
 *
 * Зміни:
 * - Змінити CHECK constraint для role
 */

export const up = (db) => {
  console.log("[Migration 008] Updating role constraint...");

  try {
    // Створюємо нову таблицю users з правильним CHECK constraint
    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'manager', 'user')),
        permissions JSON,
        email_verified BOOLEAN DEFAULT 0,
        verification_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("[Migration 008] Created users_new table");

    // Копіюємо дані
    db.exec(`
      INSERT INTO users_new (id, email, password_hash, role, permissions, email_verified, verification_token, created_at)
      SELECT id, email, password_hash, 
             CASE WHEN role = 'other' THEN 'user' ELSE role END,
             permissions, email_verified, verification_token, created_at
      FROM users
    `);
    console.log("[Migration 008] Copied data");

    // Видаляємо стару таблицю
    db.exec("DROP TABLE users");
    console.log("[Migration 008] Dropped old users table");

    // Перейменовуємо нову таблицю
    db.exec("ALTER TABLE users_new RENAME TO users");
    console.log("[Migration 008] Renamed users_new to users");

    // Відновлюємо індекси
    db.exec("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)");
    db.exec(
      "CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)",
    );
    console.log("[Migration 008] Recreated indexes");

    console.log("[Migration 008] Completed successfully");
  } catch (error) {
    console.error("[Migration 008] Error:", error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log("[Migration 008] Rolling back...");

  try {
    // Створюємо стару таблицю
    db.exec(`
      CREATE TABLE users_backup (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'other' CHECK(role IN ('admin', 'manager', 'other')),
        permissions JSON,
        email_verified BOOLEAN DEFAULT 0,
        verification_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Копіюємо дані назад
    db.exec(`
      INSERT INTO users_backup (id, email, password_hash, role, permissions, email_verified, verification_token, created_at)
      SELECT id, email, password_hash,
             CASE WHEN role = 'user' THEN 'other' ELSE role END,
             permissions, email_verified, verification_token, created_at
      FROM users
    `);

    // Видаляємо нову таблицю
    db.exec("DROP TABLE users");

    // Перейменовуємо backup
    db.exec("ALTER TABLE users_backup RENAME TO users");

    console.log("[Migration 008] Rollback completed");
  } catch (error) {
    console.error("[Migration 008] Rollback error:", error.message);
    throw error;
  }
};

export default { up, down };
