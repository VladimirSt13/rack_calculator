/**
 * Скрипт для очищення старого журналу аудиту
 *
 * Використання:
 * npm run audit:cleanup [days]
 *
 * Приклад:
 * npm run audit:cleanup 90  - видалити записи старіше 90 днів
 */

import { getDb, closeDatabase } from '../src/db/index.js';

const DAYS_TO_KEEP = parseInt(process.argv[2]) || 90; // За замовчуванням 90 днів

async function cleanupAuditLog() {
  console.log(`[Audit Cleanup] Starting cleanup of records older than ${DAYS_TO_KEEP} days...`);

  try {
    const db = await getDb();

    // Обчислюємо дату відсічення
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    console.log(`[Audit Cleanup] Cutoff date: ${cutoffDateStr}`);

    // Порахуємо скільки записів буде видалено
    const countResult = db.prepare(`
      SELECT COUNT(*) as count 
      FROM audit_log 
      WHERE created_at < ?
    `).get(cutoffDateStr);

    console.log(`[Audit Cleanup] Found ${countResult.count} records to delete`);

    if (countResult.count === 0) {
      console.log('[Audit Cleanup] No records to delete');
      return;
    }

    // Видаляємо старі записи (пакетами по 1000)
    const BATCH_SIZE = 1000;
    let deletedTotal = 0;

    while (true) {
      const result = db.prepare(`
        DELETE FROM audit_log 
        WHERE id IN (
          SELECT id FROM audit_log 
          WHERE created_at < ?
          LIMIT ?
        )
      `).run(cutoffDateStr, BATCH_SIZE);

      deletedTotal += result.changes;
      console.log(`[Audit Cleanup] Deleted ${result.changes} records (total: ${deletedTotal})`);

      if (result.changes < BATCH_SIZE) {
        break;
      }

      // Невелика пауза між пакетами
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[Audit Cleanup] Completed. Total deleted: ${deletedTotal}`);

    // Оптимізуємо базу даних після видалення
    console.log('[Audit Cleanup] Running VACUUM...');
    db.exec('VACUUM');
    console.log('[Audit Cleanup] VACUUM completed');

  } catch (error) {
    console.error('[Audit Cleanup] Error:', error.message);
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Запуск скрипту
cleanupAuditLog()
  .then(() => {
    console.log('[Audit Cleanup] Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Audit Cleanup] Script failed:', error);
    process.exit(1);
  });
