import mongoose from 'mongoose';
import { databaseConfig } from '../config/database.config';

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

/**
 * Ініціалізація підключення до MongoDB
 */
export const initDatabase = async (): Promise<void> => {
  if (isConnected) return;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    try {
      await mongoose.connect(databaseConfig.uri, {
        dbName: databaseConfig.dbName,
      });

      isConnected = true;
      console.log('[Database] MongoDB connected:', mongoose.connection.name);

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('[Database] Connection error:', error.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[Database] MongoDB disconnected');
        isConnected = false;
      });

      // Graceful shutdown
      const gracefulShutdown = async (signal: string) => {
        console.log(`[Database] ${signal} received. Shutting down...`);
        await closeDatabase();
        process.exit(0);
      };

      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    } catch (error) {
      console.error('[Database] MongoDB connection error:', error);
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
};

/**
 * Отримати поточне підключення
 */
export const getDb = (): mongoose.Connection => {
  if (!isConnected) {
    throw new Error('[Database] Database not initialized. Call initDatabase() first.');
  }
  return mongoose.connection;
};

/**
 * Закрити підключення до MongoDB
 */
export const closeDatabase = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    connectionPromise = null;
    console.log('[Database] MongoDB disconnected');
  }
};

/**
 * Перевірити чи підключено до БД
 */
export const checkConnection = (): boolean => {
  return isConnected;
};

export default {
  initDatabase,
  getDb,
  closeDatabase,
  checkConnection,
};
