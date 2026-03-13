/**
 * Скрипт для очищення дублікатів опор
 * Видаляє ключі типу "290-edge", "430-intermediate" 
 * і залишає тільки "290", "430" тощо
 */

import { getDb } from '../src/db/index.js';

const cleanupDuplicateSupports = async () => {
  const db = await getDb();
  
  console.log('[Cleanup] Starting cleanup of duplicate supports...');
  
  try {
    // Отримуємо поточний прайс
    const priceRecord = db.prepare('SELECT id, data FROM prices ORDER BY updated_at DESC LIMIT 1').get();
    
    if (!priceRecord) {
      console.log('[Cleanup] No price data found');
      return;
    }
    
    const data = JSON.parse(priceRecord.data);
    console.log('[Cleanup] Current price data loaded');
    
    // Очищаємо дублікати опор
    if (data.supports) {
      const cleanedSupports = {};
      const duplicateKeys = [];
      
      Object.entries(data.supports).forEach(([key, item]) => {
        const anyItem = item;
        
        // Перевіряємо чи це дублікат (ключ містить -edge або -intermediate)
        if (key.includes('-edge') || key.includes('-intermediate')) {
          // Витягуємо базовий код (290-edge -> 290)
          const baseCode = key.split('-')[0];
          
          // Перевіряємо чи вже є такий код
          if (!cleanedSupports[baseCode]) {
            // Створюємо правильну структуру
            cleanedSupports[baseCode] = {
              code: baseCode,
              name: anyItem.name || baseCode,
              category: 'supports',
              size: anyItem.size || `${baseCode}мм`,
              description: anyItem.description || '',
              edge: {
                name: anyItem.edge?.name || 'Опора крайня',
                price: anyItem.edge?.price || 0,
                weight: anyItem.edge?.weight || null,
                description: anyItem.edge?.description || '',
              },
              intermediate: {
                name: anyItem.intermediate?.name || 'Проміжна опора',
                price: anyItem.intermediate?.price || 0,
                weight: anyItem.intermediate?.weight || null,
                description: anyItem.intermediate?.description || '',
              },
            };
          } else {
            // Оновлюємо існуючу структуру даними з дублікату
            if (key.includes('-edge')) {
              cleanedSupports[baseCode].edge.price = anyItem.edge?.price || cleanedSupports[baseCode].edge.price;
              cleanedSupports[baseCode].edge.weight = anyItem.edge?.weight || cleanedSupports[baseCode].edge.weight;
              cleanedSupports[baseCode].edge.name = anyItem.edge?.name || cleanedSupports[baseCode].edge.name;
              cleanedSupports[baseCode].edge.description = anyItem.edge?.description || cleanedSupports[baseCode].edge.description;
            } else if (key.includes('-intermediate')) {
              cleanedSupports[baseCode].intermediate.price = anyItem.intermediate?.price || cleanedSupports[baseCode].intermediate.price;
              cleanedSupports[baseCode].intermediate.weight = anyItem.intermediate?.weight || cleanedSupports[baseCode].intermediate.weight;
              cleanedSupports[baseCode].intermediate.name = anyItem.intermediate?.name || cleanedSupports[baseCode].intermediate.name;
              cleanedSupports[baseCode].intermediate.description = anyItem.intermediate?.description || cleanedSupports[baseCode].intermediate.description;
            }
          }
          
          duplicateKeys.push(key);
        } else {
          // Це правильний ключ — копіюємо як є
          cleanedSupports[key] = anyItem;
        }
      });
      
      data.supports = cleanedSupports;
      
      console.log('[Cleanup] Removed duplicate keys:', duplicateKeys);
      console.log('[Cleanup] Supports count:', Object.keys(data.supports).length);
    }
    
    // Зберігаємо очищені дані
    db.prepare('UPDATE prices SET data = ? WHERE id = ?').run(
      JSON.stringify(data),
      priceRecord.id
    );
    
    console.log('[Cleanup] ✓ Cleanup completed successfully');
    console.log('[Cleanup] New structure:');
    console.log('  - Supports:', Object.keys(data.supports).length);
    console.log('  - Spans:', Object.keys(data.spans || {}).length);
    console.log('  - Vertical supports:', Object.keys(data.vertical_supports || {}).length);
    console.log('  - Diagonal braces:', Object.keys(data.diagonal_brace || {}).length);
    console.log('  - Isolators:', Object.keys(data.isolator || {}).length);
    
  } catch (error) {
    console.error('[Cleanup] Error:', error.message);
    throw error;
  }
};

// Запуск скрипту
cleanupDuplicateSupports()
  .then(() => {
    console.log('[Cleanup] Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Cleanup] Script failed:', error);
    process.exit(1);
  });

export default cleanupDuplicateSupports;
