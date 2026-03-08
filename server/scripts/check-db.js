import { getDb } from '../src/db/index.js';

const db = await getDb();

// Отримати список всіх таблиць
const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
`).all();

console.log('\n=== ТАБЛИЦІ ===');
tables.forEach(table => {
  console.log(`\n📊 ${table.name}`);
  
  // Отримати структуру таблиці
  const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
  console.log('  Колонки:');
  columns.forEach(col => {
    const pk = col.pk ? ' [PK]' : '';
    const notNull = col.notnull ? ' NOT NULL' : '';
    const dflt = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
    console.log(`    - ${col.name} (${col.type})${notNull}${dflt}${pk}`);
  });
  
  // Отримати індекси
  const indexes = db.prepare(`PRAGMA index_list(${table.name})`).all();
  if (indexes.length > 0) {
    console.log('  Індекси:');
    indexes.forEach(idx => {
      console.log(`    - ${idx.name}`);
    });
  }
});

// Перевірка даних в таблицях
console.log('\n=== ДАНІ ===');

// Кількість записів в кожній таблиці
tables.forEach(table => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`${table.name}: ${count.count} записів`);
  } catch (e) {
    // Ігноруємо помилки
  }
});

db.close();
console.log('\n');
