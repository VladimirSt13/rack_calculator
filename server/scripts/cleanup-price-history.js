/**
 * Скрипт для ручного очищення історії змін прайсу
 * 
 * Використання:
 * npm run price-history:cleanup
 * 
 * Налаштування в .env:
 * PRICE_HISTORY_MAX_VERSIONS=100  (максимум версій)
 * PRICE_HISTORY_MAX_DAYS=90       (максимум днів)
 */

import { cleanupPriceHistory } from '../src/services/priceHistoryCleanupService.js';
import { getDb } from '../src/db/index.js';

const runCleanup = async () => {
  console.log('========================================');
  console.log('  Price History Cleanup Script');
  console.log('========================================\n');
  
  try {
    // Ініціалізація БД
    console.log('[1/3] Initializing database...');
    await getDb();
    console.log('[1/3] Database initialized\n');
    
    // Очищення
    console.log('[2/3] Running cleanup...');
    const result = await cleanupPriceHistory();
    console.log('[2/3] Cleanup completed\n');
    
    // Результати
    console.log('[3/3] Results:');
    console.log(`  - Deleted old versions: ${result.deletedOld}`);
    console.log(`  - Deleted extra versions: ${result.deletedExtra}`);
    console.log(`  - Remaining versions: ${result.remaining}`);
    console.log('\n========================================');
    console.log('  Cleanup completed successfully! ✓');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n========================================');
    console.error('  Cleanup failed! ✗');
    console.error('========================================');
    console.error('\nError:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
};

runCleanup();
