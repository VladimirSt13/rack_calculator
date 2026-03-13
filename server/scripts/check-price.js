import { getDb } from '../src/db/index.js';

const db = await getDb();
const price = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();

if (price) {
  const data = JSON.parse(price.data);
  console.log('=== СТРУКТУРА ПРАЙСА ===\n');
  
  Object.entries(data).forEach(([category, items]) => {
    const count = Object.keys(items).length;
    console.log(`${category}: ${count} позицій`);
    
    // Показуємо перші 3 позиції для прикладу
    const sample = Object.entries(items).slice(0, 3);
    sample.forEach(([code, item]) => {
      console.log(`  ${code}: ${JSON.stringify(item)}`);
    });
    
    if (count > 3) {
      console.log(`  ... ще ${count - 3} позицій`);
    }
    console.log('');
  });
} else {
  console.log('Прайс не знайдено');
}

process.exit(0);
