# Виправлення експорту комплектів стелажів

## Проблема
При експорті комплекту стелажів на сторінці "Мої комплекти" та в адмін-панелі в Excel не потрапляли самі стелажі. Файл експортувався, але був порожнім або містив тільки заголовки.

## Причина
При збереженні комплекту стелажів в базі даних в поле `racks` зберігалися тільки `{rackConfigId, quantity}` без повних даних стелажів (`components`, `prices`, `form` та ін.). Це призводило до того, що при експорті функція `calculateRackSetPrices` не могла розрахувати або отримати дані для стелажів.

## Внесені зміни

### 1. `server/src/controllers/rackSetController.js`

#### Функція `createRackSet`
**Було:**
```javascript
const itemsArray = rack_items || racks;
// ...
JSON.stringify(itemsArray), // зберігаємо оригінальні дані для зворотної сумісності
```

**Стало:**
```javascript
const itemsArray = rack_items || racks;
// ...
// Для збереження в поле racks використовуємо повні дані стелажів
// Якщо передано racks (старий формат) - використовуємо його
// Якщо передано тільки rack_items - розширюємо його повними даними з racks
const racksDataToSave = racks || itemsArray;

JSON.stringify(racksDataToSave), // зберігаємо повні дані стелажів для експорту
```

#### Функція `updateRackSet`
**Було:**
```javascript
if (racks !== undefined) {
  updates.push('racks = ?');
  values.push(JSON.stringify(racks));
  // ...
}
```

**Стало:**
```javascript
if (racks !== undefined) {
  updates.push('racks = ?');
  values.push(JSON.stringify(racks));
  // ...
} else if (rack_items !== undefined) {
  // Якщо оновлюється rack_items без racks, оновлюємо і racks для експорту
  const existingRacks = JSON.parse(existing.racks);
  const updatedRacks = rack_items.map(rackItem => {
    const existingRack = existingRacks.find(r =>
      r.rackConfigId === rackItem.rackConfigId || r.id === rackItem.rackConfigId
    );
    if (existingRack) {
      return { ...existingRack, quantity: rackItem.quantity || existingRack.quantity || 1 };
    }
    return rackItem;
  });
  updates.push('racks = ?');
  values.push(JSON.stringify(updatedRacks));
}
```

### 2. `server/src/services/pricingService.js`

#### Функція `calculateRackSetPrices`
**Було:**
```javascript
return racksData.map(rack => {
  // Нова структура: { rackConfigId, quantity }
  if (rack.rackConfigId && priceData) {
    // Розрахунок з БД...
  }
  // ...
});
```

**Стало:**
```javascript
return racksData.map(rack => {
  // Якщо вже є components і prices (збережені повні дані) - використовуємо їх
  // Це важливо для експорту, щоб не втрачати дані
  if (rack.components && Object.keys(rack.components).length > 0 &&
      rack.prices && rack.prices.length > 0 &&
      rack.totalCost !== undefined && rack.totalCost !== 0) {
    // Дані вже розраховані - повертаємо як є
    return {
      ...rack,
      components: rack.components,
      prices: rack.prices,
      totalCost: rack.totalCost,
      name: rack.name || 'Стелаж',
    };
  }
  // ...
});
```

### 3. `server/src/controllers/exportController.js`

#### Функція `exportRackSet`
**Було:**
```javascript
const rackSet = db.prepare(`
  SELECT id, name, object_name, description, racks, total_cost, created_at
  FROM rack_sets
  WHERE id = ? AND user_id = ?
`).get(id, userId);
```

**Стало:**
```javascript
const isAdmin = userRole === 'admin';
let rackSet;
if (isAdmin) {
  rackSet = db.prepare(`
    SELECT id, name, object_name, description, racks, total_cost, created_at
    FROM rack_sets
    WHERE id = ?
  `).get(id);
} else {
  rackSet = db.prepare(`
    SELECT id, name, object_name, description, racks, total_cost, created_at
    FROM rack_sets
    WHERE id = ? AND user_id = ?
  `).get(id, userId);
}
```

### 4. `server/src/controllers/rackSetController.js`

#### Функція `getRackSets`
Додано підтримку адміністраторів для перегляду всіх комплектів:
```javascript
const isAdmin = userRole === 'admin';
const rackSets = isAdmin
  ? db.prepare('SELECT ... FROM rack_sets ORDER BY created_at DESC').all()
  : db.prepare('SELECT ... FROM rack_sets WHERE user_id = ?').all(userId);
```

#### Функція `getRackSet`
Додано підтримку адміністраторів для перегляду будь-якого комплекту:
```javascript
const isAdmin = userRole === 'admin';
let rackSet;
if (isAdmin) {
  rackSet = db.prepare('SELECT ... WHERE id = ?').get(id);
} else {
  rackSet = db.prepare('SELECT ... WHERE id = ? AND user_id = ?').get(id, userId);
}
```

## Тестування

### Сценарій 1: Експорт з "Мої комплекти"
1. Створіть новий комплект стелажів в калькуляторі
2. Збережіть комплект
3. Перейдіть на сторінку "Мої комплекти"
4. Натисніть кнопку експорту (іконка завантаження)
5. Оберіть опції експорту
6. Відкрийте завантажений файл
7. **Очікуваний результат:** Файл містить всі стелажі з компонентами

### Сценарій 2: Експорт з адмін-панелі
1. Увійдіть як адміністратор
2. Перейдіть в адмін-панель → Комплекти стелажів
3. Натисніть кнопку експорту для будь-якого комплекту
4. Відкрийте завантажений файл
5. **Очікуваний результат:** Файл містить всі стелажі з компонентами

### Сценарій 3: Експорт нового комплекту (без збереження)
1. Створіть стелажі в калькуляторі
2. Натисніть "Зберегти комплект"
3. В діалозі натисніть "Експорт в Excel"
4. Відкрийте завантажений файл
5. **Очікуваний результат:** Файл містить всі стелажі з компонентами

## Примітки

- Виправлення зачіпає тільки нові збережені комплекти. Для старих комплектів, які вже збережені в БД без повних даних, може знадобитися міграція або повторне збереження.
- Для адміністраторів тепер доступний експорт будь-яких комплектів стелажів.
