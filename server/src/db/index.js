import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || resolve(__dirname, '../../data/rack_calculator.db');

let db = null;
let dbInitPromise = null;

/**
 * Ініціалізація бази даних (async)
 */
export const initDatabase = async (runMigrationsFlag = false) => {
  if (db) return db;
  
  // Якщо вже ініціалізується - чекаємо
  if (dbInitPromise) return dbInitPromise;
  
  dbInitPromise = (async () => {
    // Ensure data directory exists
    const dataDir = resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create tables (for backward compatibility)
    createTables(db);

    // Seed default data
    seedDefaultData(db);

    console.log('[Database] Initialized:', DB_PATH);
    
    // Запуск міграцій тільки якщо вказано (для CLI)
    if (runMigrationsFlag) {
      try {
        const { runMigrations } = await import('./migrations/index.js');
        await runMigrations(db);
      } catch (error) {
        console.error('[Database] Migration error:', error.message);
        throw error;
      }
    }
    
    dbInitPromise = null;
    return db;
  })();
  
  return dbInitPromise;
};

/**
 * Отримати екземпляр БД (async)
 */
export const getDb = async () => {
  if (!db) {
    return await initDatabase(false); // Без міграцій
  }
  return db;
};

/**
 * Створення таблиць
 */
const createTables = (db) => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Calculations table
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

  // Prices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data JSON NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
    CREATE INDEX IF NOT EXISTS idx_calculations_type ON calculations(type);
    CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at);
  `);

  console.log('[Database] Tables created');
};

/**
 * Seed default data
 */
const seedDefaultData = (db) => {
  // Check if prices table is empty
  const priceCount = db.prepare('SELECT COUNT(*) as count FROM prices').get();

  if (priceCount.count === 0) {
    // Load default price from legacy/price.json
    const legacyPricePath = resolve(__dirname, '../../../legacy/price.json');
    if (fs.existsSync(legacyPricePath)) {
      const defaultPrice = JSON.parse(fs.readFileSync(legacyPricePath, 'utf-8'));
      db.prepare('INSERT INTO prices (data) VALUES (?)').run(JSON.stringify(defaultPrice));
      console.log('[Database] Default price data seeded');
    }
  }
};

/**
 * Закрити БД
 */
export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
    console.log('[Database] Closed');
  }
};

export default {
  initDatabase,
  getDb,
  closeDatabase,
};
