/**
 * Міграція 002: Створення таблиці refresh_tokens
 * 
 * Призначення:
 * - Зберігання refresh токенів для оновлення access token
 * - Можливість відкликання токенів
 */

export const up = (db) => {
  console.log('[Migration 002] Creating refresh_tokens table...');
  
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        revoked BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('[Migration 002] Created refresh_tokens table');
    
    // Створюємо індекси
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)
    `);
    console.log('[Migration 002] Created index on user_id');
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash)
    `);
    console.log('[Migration 002] Created index on token_hash');
    
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at)
    `);
    console.log('[Migration 002] Created index on expires_at');
    
    console.log('[Migration 002] Completed successfully');
  } catch (error) {
    console.error('[Migration 002] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 002] Rolling back...');
  
  db.exec('DROP TABLE IF EXISTS refresh_tokens');
  
  console.log('[Migration 002] Rollback completed');
};

export default { up, down };
