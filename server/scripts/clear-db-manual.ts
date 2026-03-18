import mongoose from 'mongoose';
import { databaseConfig } from '../config/database.config';

/**
 * Скрипт для очищення БД
 */
const clearDatabase = async () => {
  try {
    console.log('[Clear DB] Connecting to MongoDB...');
    await mongoose.connect(databaseConfig.uri, {
      dbName: databaseConfig.dbName,
    });

    console.log('[Clear DB] Connected successfully');

    // Видалення всіх колекцій
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      await collection.drop();
      console.log(`[Clear DB] Dropped collection: ${collection.collectionName}`);
    }

    console.log('[Clear DB] Database cleared successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Clear DB] Error:', error);
    process.exit(1);
  }
};

clearDatabase();
