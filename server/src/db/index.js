import Database from 'better-sqlite3';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Визначаємо тип БД за змінною оточення
const USE_POSTGRES = !!process.env.DATABASE_URL;

// SQLite змінні
let sqliteDb = null;
let sqliteInitPromise = null;

const DB_PATH = process.env.DB_PATH || resolve(__dirname, '../../data/rack_calculator.db');

// PostgreSQL змінні
let postgresPool = null;
let postgresInitPromise = null;

/**
 * Ініціалізація бази даних
 * Автоматично обирає SQLite або PostgreSQL залежно від DATABASE_URL
 */
export const initDatabase = async (runMigrationsFlag = false) => {
  if (USE_POSTGRES) {
    return await initPostgres(runMigrationsFlag);
  }
  return await initSqlite(runMigrationsFlag);
};

/**
 * Ініціалізація SQLite (локальна розробка)
 */
const initSqlite = async (runMigrationsFlag = false) => {
  if (sqliteDb) return sqliteDb;

  if (sqliteInitPromise) return sqliteInitPromise;

  sqliteInitPromise = (async () => {
    const dataDir = resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');

    createSqliteTables(sqliteDb);
    seedSqliteDefaultData(sqliteDb);

    console.log('[Database] SQLite initialized:', DB_PATH);

    if (runMigrationsFlag) {
      try {
        const { runMigrations } = await import('./migrations/index.js');
        await runMigrations(sqliteDb);
      } catch (error) {
        console.error('[Database] Migration error:', error.message);
        throw error;
      }
    }

    sqliteInitPromise = null;
    return sqliteDb;
  })();

  return sqliteInitPromise;
};

/**
 * Ініціалізація PostgreSQL (Supabase для продакшену)
 */
const initPostgres = async (runMigrationsFlag = false) => {
  if (postgresPool) return postgresPool;

  if (postgresInitPromise) return postgresInitPromise;

  const databaseUrl = process.env.DATABASE_URL;

  postgresInitPromise = (async () => {
    try {
      postgresPool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Перевірка підключення
      const client = await postgresPool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('[Database] PostgreSQL initialized (Supabase)');

      if (runMigrationsFlag) {
        try {
          const { runPostgresMigrations } = await import('./migrations/postgres.js');
          await runPostgresMigrations(postgresPool);
        } catch (error) {
          console.error('[Database] Postgres migration error:', error.message);
          throw error;
        }
      }

      postgresInitPromise = null;
      return postgresPool;
    } catch (error) {
      console.error('[Database] PostgreSQL connection error:', error.message);
      postgresInitPromise = null;
      throw error;
    }
  })();

  return postgresInitPromise;
};

/**
 * Отримати екземпляр БД
 */
export const getDb = async () => {
  if (USE_POSTGRES) {
    return await getPool();
  }
  return await getSqliteDb();
};

/**
 * Отримати SQLite екземпляр
 */
const getSqliteDb = async () => {
  if (!sqliteDb) {
    return await initSqlite(false);
  }
  return sqliteDb;
};

/**
 * Отримати PostgreSQL pool
 */
export const getPool = async () => {
  if (!postgresPool) {
    return await initPostgres(false);
  }
  return postgresPool;
};

/**
 * Закрити підключення до БД
 */
export const closeDatabase = async () => {
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
    console.log('[Database] SQLite closed');
  }
  if (postgresPool) {
    await postgresPool.end();
    postgresPool = null;
    console.log('[Database] PostgreSQL closed');
  }
};

// ===== SQLite Helper Functions =====

const createSqliteTables = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT,
      data JSON NOT NULL,
      type TEXT CHECK(type IN ('rack', 'battery')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data JSON NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
    CREATE INDEX IF NOT EXISTS idx_calculations_type ON calculations(type);
    CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at);
  `);

  console.log('[Database] SQLite tables created');
};

const seedSqliteDefaultData = (db) => {
  const priceCount = db.prepare('SELECT COUNT(*) as count FROM prices').get();

  if (priceCount.count === 0) {
    const legacyPricePath = resolve(__dirname, '../../../legacy/price.json');
    if (fs.existsSync(legacyPricePath)) {
      const defaultPrice = JSON.parse(fs.readFileSync(legacyPricePath, 'utf-8'));
      db.prepare('INSERT INTO prices (data) VALUES (?)').run(JSON.stringify(defaultPrice));
      console.log('[Database] Default price data seeded');
    }
  }
};

export default {
  initDatabase,
  getDb,
  getPool,
  closeDatabase,
  isPostgres: () => USE_POSTGRES,
  isSqlite: () => !USE_POSTGRES,
};
