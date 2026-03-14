import { getDb } from "../db/index.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Сервіс для очищення історії змін прайсу
 *
 * Стратегія:
 * - Зберігати максимум PRICE_HISTORY_MAX_VERSIONS версій (за замовчуванням 100)
 * - Зберігати версії за останні PRICE_HISTORY_MAX_DAYS днів (за замовчуванням 90)
 * - Видаляти старі версії щонеділі о 03:00
 *
 * Примітка: Історія зберігається в таблиці prices (кожен запис - версія прайсу)
 */

/**
 * Отримати налаштування з .env
 */
const getMaxVersions = () =>
  parseInt(process.env.PRICE_HISTORY_MAX_VERSIONS || "100", 10);
const getMaxDays = () =>
  parseInt(process.env.PRICE_HISTORY_MAX_DAYS || "90", 10);

/**
 * Очистити старі версії прайсу
 *
 * @returns {Object} Результат очищення
 */
export const cleanupPriceHistory = async () => {
  const db = await getDb();

  const maxVersions = getMaxVersions();
  const maxDays = getMaxDays();

  console.log(`[Price History Cleanup] Starting cleanup...`);
  console.log(
    `[Price History Cleanup] Settings: maxVersions=${maxVersions}, maxDays=${maxDays}`,
  );

  try {
    // Обчислюємо дату відсічення
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxDays);
    const cutoffDateStr = cutoffDate.toISOString();

    console.log(`[Price History Cleanup] Cutoff date: ${cutoffDateStr}`);

    // Крок 1: Видаляємо версії старіше ніж maxDays (крім поточної)
    const oldVersionsResult = db
      .prepare(
        `
      DELETE FROM prices
      WHERE updated_at < ?
        AND id != (SELECT id FROM prices ORDER BY updated_at DESC LIMIT 1)
    `,
      )
      .run(cutoffDateStr);

    console.log(
      `[Price History Cleanup] Deleted ${oldVersionsResult.changes} versions older than ${maxDays} days`,
    );

    // Крок 2: Якщо залишилось більше ніж maxVersions, видаляємо найстаріші (крім поточної)
    const remainingCount = db
      .prepare(
        `
      SELECT COUNT(*) as count FROM prices
    `,
      )
      .get();

    console.log(
      `[Price History Cleanup] Remaining versions: ${remainingCount.count}`,
    );

    if (remainingCount.count > maxVersions) {
      const extraVersionsResult = db
        .prepare(
          `
        DELETE FROM prices
        WHERE id != (SELECT id FROM prices ORDER BY updated_at DESC LIMIT 1)
          AND id IN (
            SELECT id FROM (
              SELECT id FROM prices
              ORDER BY updated_at DESC
              LIMIT -1 OFFSET ?
            )
          )
      `,
        )
        .run(maxVersions);

      console.log(
        `[Price History Cleanup] Deleted ${extraVersionsResult.changes} extra versions (limit: ${maxVersions})`,
      );
    }

    // Крок 3: VACUUM для оптимізації БД
    db.exec("VACUUM");
    console.log(`[Price History Cleanup] Database optimized (VACUUM)`);

    const finalCount = db.prepare(`SELECT COUNT(*) as count FROM prices`).get();

    return {
      success: true,
      deletedOld: oldVersionsResult.changes,
      deletedExtra: 0,
      remaining: finalCount.count,
    };
  } catch (error) {
    console.error(`[Price History Cleanup] Error:`, error.message);
    throw error;
  }
};

/**
 * Ініціалізація Cron задачі для очищення
 */
export const initPriceHistoryCleanup = async () => {
  const cron = (await import("node-cron")).default;
  const schedule = process.env.PRICE_HISTORY_CLEANUP_SCHEDULE || "0 3 * * 0"; // Щонеділі о 03:00

  console.log(`[Price History Cleanup] Scheduling cleanup: ${schedule}`);

  cron.schedule(schedule, async () => {
    console.log(`[Price History Cleanup] Running scheduled cleanup...`);
    try {
      await cleanupPriceHistory();
      console.log(`[Price History Cleanup] Scheduled cleanup completed`);
    } catch (error) {
      console.error(
        `[Price History Cleanup] Scheduled cleanup failed:`,
        error.message,
      );
    }
  });

  console.log(`[Price History Cleanup] Cron task scheduled successfully`);
};

export default {
  cleanupPriceHistory,
  initPriceHistoryCleanup,
  getMaxVersions,
  getMaxDays,
};
