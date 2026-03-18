import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Для ES modules - отримуємо __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Завантажуємо .env з папки server
config({ path: resolve(__dirname, '../.env') });

/**
 * Конфігурація бази даних
 */
export const databaseConfig = {
  /** MongoDB connection URI */
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rack_calculator',

  /** Database name */
  dbName: process.env.MONGODB_DB_NAME || 'rack_calculator',

  /** Whether to run migrations on startup (for backward compatibility) */
  runMigrations: process.env.RUN_MIGRATIONS === 'true',

  /** MongoDB Atlas specific options */
  isAtlas:
    (process.env.MONGODB_URI || '').includes('mongodb+srv://') ||
    (process.env.MONGODB_URI || '').includes('mongodb.net'),
};
