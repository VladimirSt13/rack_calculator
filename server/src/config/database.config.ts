import { config } from 'dotenv';

config();

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
};
