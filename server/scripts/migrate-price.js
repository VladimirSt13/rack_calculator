/**
 * Скрипт для міграції прайсу в нову структуру
 * 
 * Стара структура:
 * {
 *   "supports": {
 *     "215": {
 *       "name": "215",
 *       "edge": { "price": 560, "weight": 2.5 },
 *       "intermediate": { "price": 700, "weight": 3.0 }
 *     }
 *   }
 * }
 * 
 * Нова структура:
 * {
 *   "supports": {
 *     "215-edge": {
 *       "code": "215",
 *       "name": "Опора крайня",
 *       "type": "edge",
 *       "price": 560,
 *       "weight": 2.5,
 *       "category": "supports"
 *     },
 *     "215-intermediate": {
 *       "code": "215",
 *       "name": "Проміжна опора",
 *       "type": "intermediate",
 *       "price": 700,
 *       "weight": 3.0,
 *       "category": "supports"
 *     }
 *   }
 * }
 */

import { getDb } from '../src/db/index.js';

const migratePriceData = async () => {
  const db = await getDb();
  
  console.log('[Price Migration] Starting migration...');
  
  try {
    // Отримуємо поточний прайс
    const priceRecord = db.prepare('SELECT id, data FROM prices ORDER BY updated_at DESC LIMIT 1').get();
    
    if (!priceRecord) {
      console.log('[Price Migration] No price data found');
      return;
    }
    
    const oldData = JSON.parse(priceRecord.data);
    console.log('[Price Migration] Current price data loaded');
    
    const newData = {
      supports: {},
      spans: {},
      vertical_supports: {},
      diagonal_brace: {},
      isolator: {},
    };
    
    // Міграція опор (supports)
    if (oldData.supports) {
      // Групуємо плоскі ключі типу "215-edge" в вкладену структуру
      const groupedSupports = {};
      
      Object.entries(oldData.supports).forEach(([key, item]) => {
        const anyItem = item;
        
        // Перевіряємо чи це плоска структура (ключ містить -edge або -intermediate)
        if (key.includes('-edge') || key.includes('-intermediate')) {
          // Витягуємо код з ключа (215-edge -> 215)
          const code = key.split('-')[0];
          
          if (!groupedSupports[code]) {
            groupedSupports[code] = {
              code: code,
              name: 'Бокові частини 1 рядна',
              category: 'supports',
              edge: { name: 'Опора крайня', price: 0, weight: null, description: '' },
              intermediate: { name: 'Проміжна опора', price: 0, weight: null, description: '' },
            };
          }
          
          // Оновлюємо відповідну вкладену позицію
          if (key.includes('-edge')) {
            groupedSupports[code].edge.price = anyItem.price || 0;
            groupedSupports[code].edge.weight = anyItem.weight || null;
            groupedSupports[code].edge.description = anyItem.description || '';
          } else if (key.includes('-intermediate')) {
            groupedSupports[code].intermediate.price = anyItem.price || 0;
            groupedSupports[code].intermediate.weight = anyItem.weight || null;
            groupedSupports[code].intermediate.description = anyItem.description || '';
          }
        } else {
          // Це вже вкладена структура або інший формат
          groupedSupports[key] = anyItem;
        }
      });
      
      newData.supports = groupedSupports;
      console.log('[Price Migration] Supports migrated:', Object.keys(newData.supports).length, 'items (grouped from flat structure)');
    }
    
    // Міграція балок (spans)
    if (oldData.spans) {
      Object.entries(oldData.spans).forEach(([code, item]) => {
        const oldItem = item;
        
        // Перевіряємо чи це стара структура (тільки price)
        if (!oldItem.code || !oldItem.category) {
          newData.spans[code] = {
            code: code,
            name: oldItem.name || `Балка ${code}`,
            category: 'spans',
            price: oldItem.price || 0,
            weight: oldItem.weight || null,
            description: oldItem.description || '',
          };
        } else {
          // Нова структура - копіюємо без sku та size
          newData.spans[code] = {
            code: oldItem.code,
            name: oldItem.name,
            category: oldItem.category,
            price: oldItem.price,
            weight: oldItem.weight,
            description: oldItem.description || '',
          };
        }
      });
      console.log('[Price Migration] Spans migrated:', Object.keys(newData.spans).length, 'items');
    }
    
    // Міграція вертикальних опор (vertical_supports)
    if (oldData.vertical_supports) {
      Object.entries(oldData.vertical_supports).forEach(([code, item]) => {
        const oldItem = item;
        
        if (!oldItem.code || !oldItem.category) {
          newData.vertical_supports[code] = {
            code: code,
            name: oldItem.name || `Вертикальна опора ${code}`,
            category: 'vertical_supports',
            price: oldItem.price || 0,
            weight: oldItem.weight || null,
            description: oldItem.description || '',
          };
        } else {
          newData.vertical_supports[code] = {
            code: oldItem.code,
            name: oldItem.name,
            category: oldItem.category,
            price: oldItem.price,
            weight: oldItem.weight,
            description: oldItem.description || '',
          };
        }
      });
      console.log('[Price Migration] Vertical supports migrated:', Object.keys(newData.vertical_supports).length, 'items');
    }
    
    // Міграція розкосів (diagonal_brace)
    if (oldData.diagonal_brace) {
      Object.entries(oldData.diagonal_brace).forEach(([code, item]) => {
        const oldItem = item;
        
        if (!oldItem.code || !oldItem.category) {
          newData.diagonal_brace[code] = {
            code: code,
            name: oldItem.name || `Розкіс ${code}`,
            category: 'diagonal_brace',
            price: oldItem.price || 0,
            weight: oldItem.weight || null,
            description: oldItem.description || '',
          };
        } else {
          newData.diagonal_brace[code] = {
            code: oldItem.code,
            name: oldItem.name,
            category: oldItem.category,
            price: oldItem.price,
            weight: oldItem.weight,
            description: oldItem.description || '',
          };
        }
      });
      console.log('[Price Migration] Diagonal braces migrated:', Object.keys(newData.diagonal_brace).length, 'items');
    }
    
    // Міграція ізоляторів (isolator)
    if (oldData.isolator) {
      Object.entries(oldData.isolator).forEach(([code, item]) => {
        const oldItem = item;
        
        if (!oldItem.code || !oldItem.category) {
          newData.isolator[code] = {
            code: code,
            name: oldItem.name || `Ізолятор ${code}`,
            category: 'isolator',
            price: oldItem.price || 0,
            weight: oldItem.weight || null,
            description: oldItem.description || '',
          };
        } else {
          newData.isolator[code] = {
            code: oldItem.code,
            name: oldItem.name,
            category: oldItem.category,
            price: oldItem.price,
            weight: oldItem.weight,
            description: oldItem.description || '',
          };
        }
      });
      console.log('[Price Migration] Isolators migrated:', Object.keys(newData.isolator).length, 'items');
    }
    
    // Зберігаємо нові дані
    const totalItems = 
      Object.keys(newData.supports).length +
      Object.keys(newData.spans).length +
      Object.keys(newData.vertical_supports).length +
      Object.keys(newData.diagonal_brace).length +
      Object.keys(newData.isolator).length;
    
    console.log('[Price Migration] Total items:', totalItems);
    
    // Оновлюємо запис в БД
    db.prepare('UPDATE prices SET data = ? WHERE id = ?').run(
      JSON.stringify(newData),
      priceRecord.id
    );
    
    console.log('[Price Migration] ✓ Migration completed successfully');
    console.log('[Price Migration] New structure:');
    console.log('  - Supports:', Object.keys(newData.supports).length);
    console.log('  - Spans:', Object.keys(newData.spans).length);
    console.log('  - Vertical supports:', Object.keys(newData.vertical_supports).length);
    console.log('  - Diagonal braces:', Object.keys(newData.diagonal_brace).length);
    console.log('  - Isolators:', Object.keys(newData.isolator).length);
    
  } catch (error) {
    console.error('[Price Migration] Error:', error.message);
    throw error;
  }
};

// Запуск міграції
migratePriceData()
  .then(() => {
    console.log('[Price Migration] Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Price Migration] Script failed:', error);
    process.exit(1);
  });

export default migratePriceData;
