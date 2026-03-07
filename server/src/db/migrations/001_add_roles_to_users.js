/**
 * Міграція 001: Додавання ролей та полів для email verification
 * 
 * Зміни:
 * - Додати колонку role (admin, manager, other)
 * - Додати колонку permissions (JSON)
 * - Додати колонку email_verified (BOOLEAN)
 * - Додати колонку verification_token (TEXT)
 */

export const up = (db) => {
  console.log('[Migration 001] Adding roles to users table...');
  
  try {
    // Додаємо колонку role
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN role TEXT DEFAULT 'other' 
      CHECK(role IN ('admin', 'manager', 'other'))
    `);
    console.log('[Migration 001] Added role column');
    
    // Додаємо колонку permissions
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN permissions JSON
    `);
    console.log('[Migration 001] Added permissions column');
    
    // Додаємо колонку email_verified
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN email_verified BOOLEAN DEFAULT 0
    `);
    console.log('[Migration 001] Added email_verified column');
    
    // Додаємо колонку verification_token
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN verification_token TEXT
    `);
    console.log('[Migration 001] Added verification_token column');
    
    // Створюємо індекс для role
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `);
    console.log('[Migration 001] Created index on role');
    
    // Створюємо індекс для verification_token
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)
    `);
    console.log('[Migration 001] Created index on verification_token');
    
    // Перший користувач автоматично стає адміном (оновлюємо пізніше в коді)
    console.log('[Migration 001] Completed successfully');
  } catch (error) {
    console.error('[Migration 001] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 001] Rolling back...');
  
  // SQLite не підтримує DROP COLUMN напряму до версії 3.35.0
  // Тому створюємо нову таблицю без цих колонок
  db.exec(`
    CREATE TABLE IF NOT EXISTS users_backup (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.exec(`
    INSERT INTO users_backup (id, email, password_hash, created_at)
    SELECT id, email, password_hash, created_at FROM users
  `);
  
  db.exec('DROP TABLE users');
  
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.exec(`
    INSERT INTO users (id, email, password_hash, created_at)
    SELECT id, email, password_hash, created_at FROM users_backup
  `);
  
  db.exec('DROP TABLE users_backup');
  
  console.log('[Migration 001] Rollback completed');
};

export default { up, down };
