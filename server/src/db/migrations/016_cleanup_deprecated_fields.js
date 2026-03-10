/**
 * Міграція 016: Видалення застарілих полів та таблиць
 *
 * Призначення:
 * - Видалити старі поля, які більше не використовуються
 * - Видалити застарілі таблиці
 * - Очищення БД після рефакторингу
 *
 * ⚠️ УВАГА: Ця міграція ламає зворотню сумісність!
 * Старі дані будуть втрачені.
 */

export const up = (db) => {
  console.log('[Migration 016] Removing deprecated fields and tables...');

  try {
    // ============================================
    // 1. Видалення поля verification_token з users
    // (тепер використовується окрема таблиця email_verifications)
    // ============================================
    console.log('[Migration 016] Removing verification_token from users...');
    
    try {
      // Отримати поточні дані
      const usersWithTokens = db.prepare(`
        SELECT id, verification_token FROM users 
        WHERE verification_token IS NOT NULL
      `).all();

      if (usersWithTokens.length > 0) {
        console.log(`[Migration 016] Found ${usersWithTokens.length} users with verification tokens`);
      }

      // Видалити поле (SQLite потребує перестворення таблиці)
      db.exec(`
        CREATE TABLE IF NOT EXISTS users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'manager', 'user')),
          permissions JSON,
          email_verified BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.exec(`
        INSERT INTO users_new (id, email, password_hash, role, permissions, email_verified, created_at)
        SELECT id, email, password_hash, role, permissions, email_verified, created_at
        FROM users
      `);

      db.exec('DROP TABLE users');
      db.exec('ALTER TABLE users_new RENAME TO users');

      // Відновити індекси
      db.exec(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

      console.log('[Migration 016] Removed verification_token from users');
    } catch (e) {
      console.log('[Migration 016] verification_token field does not exist or already removed');
    }

    // ============================================
    // 2. Видалення поля racks з rack_sets (якщо ще існує)
    // ============================================
    console.log('[Migration 016] Checking for deprecated racks field...');
    
    try {
      const tableInfo = db.prepare("PRAGMA table_info(rack_sets)").all();
      const hasRacksField = tableInfo.some(col => col.name === 'racks');
      
      if (hasRacksField) {
        // Видалити поле racks
        db.exec(`
          CREATE TABLE IF NOT EXISTS rack_sets_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            object_name TEXT,
            description TEXT,
            rack_items JSON NOT NULL,
            total_cost_snapshot REAL,
            deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        db.exec(`
          INSERT INTO rack_sets_new (id, user_id, name, object_name, description, rack_items, total_cost_snapshot, deleted, deleted_at, created_at, updated_at)
          SELECT id, user_id, name, object_name, description, rack_items, total_cost_snapshot, deleted, deleted_at, created_at, updated_at
          FROM rack_sets
        `);

        db.exec('DROP TABLE rack_sets');
        db.exec('ALTER TABLE rack_sets_new RENAME TO rack_sets');

        // Відновити індекси
        db.exec(`CREATE INDEX IF NOT EXISTS idx_rack_sets_user_id ON rack_sets(user_id)`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_rack_sets_created_at ON rack_sets(created_at)`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_rack_sets_deleted ON rack_sets(deleted)`);

        console.log('[Migration 016] Removed deprecated racks field');
      } else {
        console.log('[Migration 016] racks field does not exist (already removed)');
      }
    } catch (e) {
      console.log('[Migration 016] Error checking racks field:', e.message);
    }

    // ============================================
    // 3. Видалення застарілих таблиць (якщо існують)
    // ============================================
    console.log('[Migration 016] Removing deprecated tables...');

    // Таблиці, які могли залишитися від старих версій
    const deprecatedTables = [
      'rack_items_old',
      'rack_items_backup',
      'rack_sets_backup',
      'temp_rack_sets',
      'migrations_temp',
    ];

    for (const tableName of deprecatedTables) {
      try {
        const tableExists = db.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name=?
        `).get(tableName);

        if (tableExists) {
          db.exec(`DROP TABLE IF EXISTS ${tableName}`);
          console.log(`[Migration 016] Dropped table ${tableName}`);
        }
      } catch (e) {
        console.log(`[Migration 016] Error dropping ${tableName}:`, e.message);
      }
    }

    // ============================================
    // 4. Очищення старих даних з audit_log
    // ============================================
    console.log('[Migration 016] Cleaning up old audit logs...');
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      
      const result = db.prepare(`
        DELETE FROM audit_log WHERE created_at < ?
      `).run(cutoffDate.toISOString());
      
      console.log(`[Migration 016] Removed ${result.changes} old audit log entries`);
    } catch (e) {
      console.log('[Migration 016] Error cleaning audit logs:', e.message);
    }

    // ============================================
    // 5. Видалення прострочених refresh токенів
    // ============================================
    console.log('[Migration 016] Cleaning up expired refresh tokens...');
    
    try {
      const result = db.prepare(`
        DELETE FROM refresh_tokens 
        WHERE expires_at < datetime('now') OR revoked = 1
      `).run();
      
      console.log(`[Migration 016] Removed ${result.changes} expired/revoked refresh tokens`);
    } catch (e) {
      console.log('[Migration 016] Error cleaning refresh tokens:', e.message);
    }

    // ============================================
    // 6. Видалення використаних email верифікацій
    // ============================================
    console.log('[Migration 016] Cleaning up used email verifications...');
    
    try {
      const result = db.prepare(`
        DELETE FROM email_verifications 
        WHERE verified = 1 OR expires_at < datetime('now')
      `).run();
      
      console.log(`[Migration 016] Removed ${result.changes} used/expired email verifications`);
    } catch (e) {
      console.log('[Migration 016] Error cleaning email verifications:', e.message);
    }

    // ============================================
    // 7. Видалення використаних password reset токенів
    // ============================================
    console.log('[Migration 016] Cleaning up used password reset tokens...');
    
    try {
      const result = db.prepare(`
        DELETE FROM password_resets 
        WHERE expires_at < datetime('now')
      `).run();
      
      console.log(`[Migration 016] Removed ${result.changes} expired password reset tokens`);
    } catch (e) {
      console.log('[Migration 016] Error cleaning password reset tokens:', e.message);
    }

    console.log('[Migration 016] Completed successfully');
  } catch (error) {
    console.error('[Migration 016] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 016] Rollback is not possible - data has been permanently deleted');
  console.log('[Migration 016] This migration is irreversible');
  
  // Повертаємо поле verification_token (але без даних)
  try {
    db.exec(`
      ALTER TABLE users ADD COLUMN verification_token TEXT
    `);
    console.log('[Migration 016] Added verification_token column back (empty)');
  } catch (e) {
    console.log('[Migration 016] Could not add verification_token back:', e.message);
  }
};

export default { up, down };
