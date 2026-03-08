import { getDb } from '../src/db/index.js';

const db = await getDb();

const configs = db.prepare('SELECT id, floors, rows, beams_per_row, supports, vertical_supports, spans FROM rack_configurations LIMIT 3').all();

console.log('\n=== rack_configurations дані ===\n');
configs.forEach(config => {
  console.log(`ID: ${config.id}`);
  console.log(`  floors: ${config.floors}`);
  console.log(`  rows: ${config.rows}`);
  console.log(`  beams_per_row: ${config.beams_per_row}`);
  console.log(`  supports: ${config.supports} (type: ${typeof config.supports})`);
  console.log(`  vertical_supports: ${config.vertical_supports} (type: ${typeof config.vertical_supports})`);
  console.log(`  spans: ${config.spans} (type: ${typeof config.spans})`);
  console.log('');
});

db.close();
