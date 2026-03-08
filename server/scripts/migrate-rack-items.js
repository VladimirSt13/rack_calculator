/**
 * Скрипт для міграції даних з racks до rack_items
 * 
 * Використання:
 * node scripts/migrate-rack-items.js
 */

import { getDb } from '../src/db/index.js';

const db = await getDb();

console.log('\n=== МІГРАЦІЯ racks → rack_items ===\n');

// Отримати всі комплекти
const rackSets = db.prepare('SELECT id, name, racks, rack_items FROM rack_sets').all();

let migratedCount = 0;
let skippedCount = 0;
let errorCount = 0;

for (const set of rackSets) {
  // Пропустити якщо вже є rack_items
  if (set.rack_items) {
    console.log(`⏭️  Комплект #${set.id}: вже має rack_items`);
    skippedCount++;
    continue;
  }

  // Пропустити якщо немає racks
  if (!set.racks) {
    console.log(`⏭️  Комплект #${set.id}: немає racks даних`);
    skippedCount++;
    continue;
  }

  try {
    const racksData = JSON.parse(set.racks);
    
    if (!Array.isArray(racksData) || racksData.length === 0) {
      console.log(`⚠️  Комплект #${set.id}: racks не є масивом або порожній`);
      errorCount++;
      continue;
    }

    // Конвертувати racks до rack_items формату
    const rackItems = racksData.map(rack => ({
      rackConfigId: rack.rackConfigId || rack.id || null,
      quantity: rack.quantity || 1,
    }));

    // Оновити запис в БД
    db.prepare(`
      UPDATE rack_sets 
      SET rack_items = ?
      WHERE id = ?
    `).run(JSON.stringify(rackItems), set.id);

    console.log(`✅ Комплект #${set.id}: мігровано ${racksData.length} стелажів`);
    migratedCount++;

  } catch (error) {
    console.error(`❌ Комплект #${set.id}: помилка міграції - ${error.message}`);
    errorCount++;
  }
}

console.log('\n=== ПІДСУМКИ ===');
console.log(`Всього комплектів: ${rackSets.length}`);
console.log(`Мігровано: ${migratedCount}`);
console.log(`Пропущено: ${skippedCount}`);
console.log(`Помилок: ${errorCount}`);
console.log('');

db.close();
