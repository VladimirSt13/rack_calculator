/**
 * CLI script для управління міграціями
 * 
 * Використання:
 *   node scripts/migrate.js        - запустити всі міграції
 *   node scripts/migrate.js status - перевірити статус
 *   node scripts/migrate.js rollback - відкотити останню
 */

import { runMigrations, rollbackMigration, checkMigrationStatus } from '../src/db/migrations/index.js';
import { closeDatabase, initDatabase } from '../src/db/index.js';

const command = process.argv[2];

try {
  switch (command) {
    case 'status':
      await checkMigrationStatus();
      break;
    case 'rollback':
      await rollbackMigration();
      break;
    case undefined:
    case 'run':
    default:
      // Ініціалізуємо БД з запуском міграцій
      await initDatabase(true);
      break;
  }
} catch (error) {
  console.error('Migration error:', error);
  process.exit(1);
} finally {
  closeDatabase();
  process.exit(0);
}
