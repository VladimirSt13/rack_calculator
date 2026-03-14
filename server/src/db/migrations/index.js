/**
 * Migration Runner
 *
 * Виконує всі міграції по черзі, зберігає інформацію про виконані міграції
 */

import { getDb } from "../index.js";
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = __dirname;

/**
 * Отримати список виконаних міграцій
 */
const getExecutedMigrations = (db) => {
  // Створюємо таблицю для відстеження міграцій якщо її немає
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const rows = db.prepare("SELECT name FROM _migrations ORDER BY id").all();
  return rows.map((row) => row.name);
};

/**
 * Позначити міграцію як виконану
 */
const markMigrationAsExecuted = (db, name) => {
  db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(name);
};

/**
 * Отримати список файлів міграцій
 */
const getMigrationFiles = () => {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".js") && file !== "index.js") // Виключаємо index.js
    .sort(); // Сортуємо за назвою (001, 002, 003...)

  return files;
};

/**
 * Виконати всі міграції
 */
export const runMigrations = async (db) => {
  const executed = getExecutedMigrations(db);
  const files = getMigrationFiles();

  console.log("[Migrations] Found", files.length, "migration files");
  console.log("[Migrations] Already executed:", executed.length);

  let migrated = 0;

  for (const file of files) {
    if (executed.includes(file)) {
      console.log(`[Migrations] Skipping ${file} (already executed)`);
      continue;
    }

    console.log(`[Migrations] Running ${file}...`);

    try {
      const migration = await import(`./${file}`);

      if (typeof migration.up !== "function") {
        console.warn(`[Migrations] Warning: ${file} has no up() function`);
        continue;
      }

      // Виконуємо міграцію в транзакції
      db.transaction(() => {
        migration.up(db);
        markMigrationAsExecuted(db, file);
      })();

      migrated++;
      console.log(`[Migrations] ✓ ${file} completed`);
    } catch (error) {
      console.error(`[Migrations] ✗ ${file} failed:`, error.message);
      throw error;
    }
  }

  if (migrated === 0) {
    console.log("[Migrations] No new migrations to run");
  } else {
    console.log(
      `[Migrations] ✓ ${migrated} migration(s) completed successfully`,
    );
  }
};

/**
 * Відкотити останню міграцію
 */
export const rollbackMigration = async () => {
  const db = await getDb(); // Без міграцій
  const executed = getExecutedMigrations(db);

  if (executed.length === 0) {
    console.log("[Migrations] No migrations to rollback");
    return;
  }

  const lastMigration = executed[executed.length - 1];
  console.log(`[Migrations] Rolling back ${lastMigration}...`);

  try {
    const migration = await import(`./${lastMigration}`);

    if (typeof migration.down !== "function") {
      console.warn(
        `[Migrations] Warning: ${lastMigration} has no down() function`,
      );
      return;
    }

    // Відкатуємо міграцію в транзакції
    db.transaction(() => {
      migration.down(db);
      db.prepare("DELETE FROM _migrations WHERE name = ?").run(lastMigration);
    })();

    console.log(`[Migrations] ✓ ${lastMigration} rolled back`);
  } catch (error) {
    console.error(
      `[Migrations] ✗ ${lastMigration} rollback failed:`,
      error.message,
    );
    throw error;
  }
};

/**
 * Перевірити статус міграцій
 */
export const checkMigrationStatus = async () => {
  const db = await getDb(); // Без міграцій
  const executed = getExecutedMigrations(db);
  const files = getMigrationFiles();

  console.log("\n[Migration Status]");
  console.log("================");

  for (const file of files) {
    const status = executed.includes(file) ? "✓ Executed" : "○ Pending";
    const date = executed.includes(file)
      ? db
          .prepare("SELECT executed_at FROM _migrations WHERE name = ?")
          .get(file).executed_at
      : "-";

    console.log(`${status} | ${file} | ${date}`);
  }

  console.log("================\n");
};

export default {
  runMigrations,
  rollbackMigration,
  checkMigrationStatus,
};
