import { getDb } from '../src/db/index.js';

const db = await getDb();

console.log('\n=== ПЕРЕВІРКА ДАНИХ rack_sets ===\n');

const rackSets = db.prepare('SELECT id, name, rack_items FROM rack_sets').all();

console.log(`Знайдено комплектів: ${rackSets.length}\n`);

rackSets.forEach(set => {
  console.log(`--- Комплект #${set.id}: ${set.name} ---`);
  
  const hasRackItems = set.rack_items ? true : false;
  
  console.log(`  rack_items: ${hasRackItems ? 'Є' : 'Немає'}`);
  
  if (hasRackItems) {
    try {
      const itemsData = JSON.parse(set.rack_items);
      console.log(`  rack_items кількість: ${itemsData.length}`);
      if (itemsData.length > 0) {
        console.log(`  Перший item:`, JSON.stringify(itemsData[0], null, 2));
      }
    } catch (e) {
      console.log(`  Помилка парсингу rack_items: ${e.message}`);
    }
  }
  
  console.log('');
});

db.close();
