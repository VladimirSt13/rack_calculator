/**
 * PostgreSQL Migration Runner (Supabase)
 *
 * Виконує всі міграції на PostgreSQL, зберігає інформацію про виконані міграції
 */

import { getPool } from "../index.js";
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = __dirname;

/**
 * Отримати список виконаних міграцій
 */
const getExecutedMigrations = async (pool) => {
  // Створюємо таблицю для відстеження міграцій якщо її немає
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const result = await pool.query(
    "SELECT name FROM _migrations ORDER BY id"
  );
  return result.rows.map((row) => row.name);
};

/**
 * Позначити міграцію як виконану
 */
const markMigrationAsExecuted = async (pool, name) => {
  await pool.query(
    "INSERT INTO _migrations (name) VALUES ($1)",
    [name]
  );
};

/**
 * Отримати список файлів міграцій
 */
const getMigrationFiles = () => {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".js") && file !== "index.js")
    .sort();

  return files;
};

/**
 * Конвертація SQLite SQL в PostgreSQL SQL
 */
const convertSqliteToPostgres = (sql) => {
  return sql
    // AUTOINCREMENT → SERIAL
    .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, "SERIAL PRIMARY KEY")
    .replace(/INTEGER PRIMARY KEY/gi, "SERIAL PRIMARY KEY")
    // DATETIME → TIMESTAMP
    .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    .replace(/DATETIME/gi, "TIMESTAMP")
    // JSON тип залишається
    .replace(/JSON NOT NULL/gi, "JSONB NOT NULL")
    .replace(/JSON/gi, "JSONB")
    // TEXT UNIQUE → TEXT UNIQUE
    .replace(/TEXT UNIQUE NOT NULL/gi, "TEXT UNIQUE NOT NULL")
    // CHECK constraints
    .replace(/CHECK\(type IN \('rack', 'battery'\)\)/gi, "CHECK (type IN ('rack', 'battery'))")
    // Видалення IF NOT EXISTS для індексів (PostgreSQL не підтримує для CREATE INDEX)
    .replace(/CREATE INDEX IF NOT EXISTS/gi, "CREATE INDEX IF NOT EXISTS")
    // FOREIGN KEY з ON DELETE CASCADE
    .replace(/ON DELETE CASCADE/gi, "ON DELETE CASCADE");
};

/**
 * Виконати міграцію на PostgreSQL
 */
const executeMigration = async (pool, sql) => {
  const convertedSql = convertSqliteToPostgres(sql);
  await pool.query(convertedSql);
};

/**
 * Виконати всі міграції
 */
export const runPostgresMigrations = async (pool) => {
  const client = await pool.connect();

  try {
    const executed = await getExecutedMigrations(pool);
    const files = getMigrationFiles();

    console.log("[Postgres Migrations] Found", files.length, "migration files");
    console.log("[Postgres Migrations] Already executed:", executed.length);

    let migrated = 0;

    for (const file of files) {
      if (executed.includes(file)) {
        console.log(`[Postgres Migrations] Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`[Postgres Migrations] Running ${file}...`);

      try {
        const migration = await import(`./${file}`);

        if (typeof migration.up !== "function") {
          console.warn(`[Postgres Migrations] Warning: ${file} has no up() function`);
          continue;
        }

        // Виконуємо міграцію в транзакції
        await client.query("BEGIN");

        // Викликаємо up() з pool замість db
        await migration.up(pool);
        await markMigrationAsExecuted(pool, file);

        await client.query("COMMIT");

        migrated++;
        console.log(`[Postgres Migrations] ✓ ${file} completed`);
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`[Postgres Migrations] ✗ ${file} failed:`, error.message);
        throw error;
      }
    }

    if (migrated === 0) {
      console.log("[Postgres Migrations] No new migrations to run");
    } else {
      console.log(
        `[Postgres Migrations] ✓ ${migrated} migration(s) completed successfully`
      );
    }
  } finally {
    client.release();
  }
};

/**
 * Відкотити останню міграцію
 */
export const rollbackPostgresMigration = async () => {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    const executed = await getExecutedMigrations(pool);

    if (executed.length === 0) {
      console.log("[Postgres Migrations] No migrations to rollback");
      return;
    }

    const lastMigration = executed[executed.length - 1];
    console.log(`[Postgres Migrations] Rolling back ${lastMigration}...`);

    try {
      const migration = await import(`./${lastMigration}`);

      if (typeof migration.down !== "function") {
        console.warn(
          `[Postgres Migrations] Warning: ${lastMigration} has no down() function`
        );
        return;
      }

      await client.query("BEGIN");
      await migration.down(pool);
      await pool.query(
        "DELETE FROM _migrations WHERE name = $1",
        [lastMigration]
      );
      await client.query("COMMIT");

      console.log(`[Postgres Migrations] ✓ ${lastMigration} rolled back`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(
        `[Postgres Migrations] ✗ ${lastMigration} rollback failed:`,
        error.message
      );
      throw error;
    }
  } finally {
    client.release();
  }
};

/**
 * Перевірити статус міграцій
 */
export const checkPostgresMigrationStatus = async () => {
  const pool = await getPool();
  const executed = await getExecutedMigrations(pool);
  const files = getMigrationFiles();

  console.log("\n[Postgres Migration Status]");
  console.log("========================");

  for (const file of files) {
    const status = executed.includes(file) ? "✓ Executed" : "○ Pending";

    let date = "-";
    if (executed.includes(file)) {
      const result = await pool.query(
        "SELECT executed_at FROM _migrations WHERE name = $1",
        [file]
      );
      date = result.rows[0]?.executed_at || "-";
    }

    console.log(`${status} | ${file} | ${date}`);
  }

  console.log("========================\n");
};

export default {
  runPostgresMigrations,
  rollbackPostgresMigration,
  checkPostgresMigrationStatus,
};
