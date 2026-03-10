import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'rack_calculator.db');
const db = new Database(dbPath);

console.log('🗑️  Очищення бази даних...\n');

db.exec('DELETE FROM rack_set_revisions');
console.log('✅ rack_set_revisions: видалено');

db.exec('DELETE FROM rack_sets');
console.log('✅ rack_sets: видалено');

db.exec('DELETE FROM rack_configurations');
console.log('✅ rack_configurations: видалено');

console.log('\n✨ Готово!\n');

db.close();
