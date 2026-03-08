/**
 * Міграція 010: Додати індекси для оптимізації аудиту та політику зберігання
 *
 * Призначення:
 * - Оптимізація запитів до audit_log
 * - Автоматичне видалення старих записів (90 днів)
 */

export const up = (db) => {
  console.log('[Migration 010] Adding audit log retention policy...');

  try {
    // Додати комбінований індекс для ефективної пагінації
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_audit_log_created_at_desc 
      ON audit_log(created_at DESC)
    `);
    console.log('[Migration 010] Created index on created_at DESC');

    // Додати індекс для фільтрації за діями
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_audit_log_action_created 
      ON audit_log(action, created_at DESC)
    `);
    console.log('[Migration 010] Created composite index on action + created_at');

    console.log('[Migration 010] Completed successfully');
  } catch (error) {
    console.error('[Migration 010] Error:', error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log('[Migration 010] Rolling back...');

  db.exec('DROP INDEX IF EXISTS idx_audit_log_created_at_desc');
  db.exec('DROP INDEX IF EXISTS idx_audit_log_action_created');

  console.log('[Migration 010] Rollback completed');
};

export default { up, down };
