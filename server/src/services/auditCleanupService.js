/**
 * Сервіс для автоматичного очищення журналу аудиту
 *
 * Налаштування в .env:
 * AUDIT_CLEANUP_ENABLED=true
 * AUDIT_CLEANUP_SCHEDULE=0 2 * * 0  # Кожну неділю о 02:00
 * AUDIT_CLEANUP_DAYS=90
 */

import cron from 'node-cron';
import { getDb } from '../db/index.js';
import { logAudit } from '../helpers/audit.js';

const DEFAULT_SCHEDULE = '0 2 * * 0'; // Кожну неділю о 02:00
const DEFAULT_DAYS = 90;

let cleanupJob = null;

/**
 * Ініціалізація cron-задачі
 */
export const initAuditCleanup = async () => {
  const enabled = process.env.AUDIT_CLEANUP_ENABLED !== 'false';
  const schedule = process.env.AUDIT_CLEANUP_SCHEDULE || DEFAULT_SCHEDULE;
  const days = parseInt(process.env.AUDIT_CLEANUP_DAYS) || DEFAULT_DAYS;

  if (!enabled) {
    console.log('[Audit Cleanup] Disabled via environment variable');
    return;
  }

  console.log(`[Audit Cleanup] Initializing with schedule: ${schedule} (days: ${days})`);

  try {
    // Перевірка валідності розкладу
    if (!cron.validate(schedule)) {
      console.error('[Audit Cleanup] Invalid cron schedule:', schedule);
      return;
    }

    // Створення cron-задачі
    cleanupJob = cron.schedule(
      schedule,
      async () => {
        console.log('[Audit Cleanup] Running scheduled cleanup...');
        await runCleanup(days);
      },
      {
        scheduled: true,
        timezone: 'Europe/Kiev',
      },
    );

    console.log('[Audit Cleanup] Scheduled successfully');

    // Запускати при старті (опціонально)
    if (process.env.AUDIT_CLEANUP_RUN_ON_START === 'true') {
      console.log('[Audit Cleanup] Running initial cleanup...');
      await runCleanup(days);
    }
  } catch (error) {
    console.error('[Audit Cleanup] Initialization error:', error.message);
  }
};

/**
 * Виконання очищення
 */
const runCleanup = async (days) => {
  try {
    const db = await getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    console.log(`[Audit Cleanup] Cutoff date: ${cutoffDateStr}`);

    // Порахуємо скільки записів буде видалено
    const { count } = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM audit_log 
      WHERE created_at < ?
    `,
      )
      .get(cutoffDateStr);

    if (count === 0) {
      console.log('[Audit Cleanup] No records to delete');
      return;
    }

    console.log(`[Audit Cleanup] Found ${count} records to delete`);

    // Видаляємо старі записи (пакетами по 1000)
    const BATCH_SIZE = 1000;
    let deletedTotal = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = db
        .prepare(
          `
        DELETE FROM audit_log
        WHERE id IN (
          SELECT id FROM audit_log
          WHERE created_at < ?
          LIMIT ?
        )
      `,
        )
        .run(cutoffDateStr, BATCH_SIZE);

      deletedTotal += result.changes;
      console.log(`[Audit Cleanup] Deleted ${result.changes} records (total: ${deletedTotal})`);

      if (result.changes < BATCH_SIZE) {
        break;
      }

      // Невелика пауза між пакетами
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Оптимізуємо базу даних після видалення
    console.log('[Audit Cleanup] Running VACUUM...');
    db.exec('VACUUM');
    console.log('[Audit Cleanup] VACUUM completed');

    // Запишемо в аудит факт очищення
    await logAudit({
      userId: 1, // Системний користувач
      action: 'AUDIT_CLEANUP',
      entityType: 'audit_log',
      newValue: { days, deletedCount: deletedTotal, scheduled: true },
    });

    console.log(`[Audit Cleanup] Completed. Total deleted: ${deletedTotal}`);
  } catch (error) {
    console.error('[Audit Cleanup] Error:', error.message);
  }
};

/**
 * Зупинка cron-задачі
 */
export const stopAuditCleanup = () => {
  if (cleanupJob) {
    console.log('[Audit Cleanup] Stopping scheduled job...');
    cleanupJob.stop();
    cleanupJob = null;
    console.log('[Audit Cleanup] Stopped');
  }
};

export default {
  initAuditCleanup,
  stopAuditCleanup,
  runCleanup,
};
