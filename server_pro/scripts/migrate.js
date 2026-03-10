import { getDb } from '../db/index.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsPath = path.join(__dirname, '../../migrations');

/**
 * Get list of applied migrations
 */
const getAppliedMigrations = (db) => {
  // Create migrations table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  return db.prepare('SELECT name FROM migrations ORDER BY id').all().map(m => m.name);
};

/**
 * Get list of migration files
 */
const getMigrationFiles = () => {
  if (!fs.existsSync(migrationsPath)) {
    fs.mkdirSync(migrationsPath, { recursive: true });
    return [];
  }
  
  return fs.readdirSync(migrationsPath)
    .filter(f => f.endsWith('.js'))
    .sort();
};

/**
 * Run migrations
 */
export const runMigrations = (db) => {
  console.log('[Migrations] Checking migrations...');
  
  const applied = getAppliedMigrations(db);
  const files = getMigrationFiles();
  
  const pending = files.filter(f => !applied.includes(f));
  
  if (pending.length === 0) {
    console.log('[Migrations] Database is up to date');
    return;
  }
  
  console.log(`[Migrations] Running ${pending.length} pending migration(s)...`);
  
  for (const file of pending) {
    console.log(`[Migrations] Running: ${file}`);
    
    try {
      const migration = await import(`file://${path.join(migrationsPath, file)}`);
      
      if (migration.up) {
        migration.up(db);
      }
      
      // Mark as applied
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
      
      console.log(`[Migrations] Completed: ${file}`);
    } catch (error) {
      console.error(`[Migrations] Failed: ${file}`, error);
      throw error;
    }
  }
  
  console.log('[Migrations] All migrations completed');
};

/**
 * Get migration status
 */
export const getMigrationStatus = (db) => {
  const applied = getAppliedMigrations(db);
  const files = getMigrationFiles();
  
  return {
    total: files.length,
    applied: applied.length,
    pending: files.length - applied.length,
    migrations: files.map(f => ({
      name: f,
      status: applied.includes(f) ? 'applied' : 'pending',
    })),
  };
};

/**
 * Rollback last migration
 */
export const rollbackMigration = (db) => {
  const applied = getAppliedMigrations(db);
  
  if (applied.length === 0) {
    console.log('[Migrations] No migrations to rollback');
    return;
  }
  
  const lastMigration = applied[applied.length - 1];
  console.log(`[Migrations] Rolling back: ${lastMigration}`);
  
  try {
    const migration = await import(`file://${path.join(migrationsPath, lastMigration)}`);
    
    if (migration.down) {
      migration.down(db);
    }
    
    // Remove from applied
    db.prepare('DELETE FROM migrations WHERE name = ?').run(lastMigration);
    
    console.log(`[Migrations] Rolled back: ${lastMigration}`);
  } catch (error) {
    console.error(`[Migrations] Rollback failed: ${lastMigration}`, error);
    throw error;
  }
};

export default { runMigrations, getMigrationStatus, rollbackMigration };
