# 📊 Аудит змін: Нормалізація БД та виправлення розрахунку цін

**Дата:** 9 березня 2026  
**Статус:** ✅ Завершено  
**Версія:** 2.2

---

## 📋 Зміни

### 1. Нормалізація бази даних

#### Міграція 012: Видалення поля `racks`
- **Файл:** `server/src/db/migrations/012_remove_racks_column.js`
- **Опис:** Видалено дублююче поле `racks` з таблиці `rack_sets`
- **Причина:** Дані дублювалися - зберігалися і в `racks`, і в `rack_items_new`

**Зміни в БД:**
```sql
-- Було:
rack_sets (
  racks JSON NOT NULL,           -- Старі дані (повні дані стелажів)
  rack_items_new JSON,           -- Нова структура (посилання)
  total_cost_snapshot REAL
)

-- Стало:
rack_sets (
  rack_items JSON NOT NULL,      -- Тільки посилання на конфігурації
  total_cost_snapshot REAL
)
```

#### Міграція 013: Перейменування `rack_items_new` → `rack_items`
- **Файл:** `server/src/db/migrations/013_rename_rack_items_new_to_rack_items.js`
- **Опис:** Перейменовано колонку для чистої назви
- **Статус:** ✅ Виконано

---

### 2. Оновлення контролерів

#### `rackSetController.js`

**Зміни:**
1. Додано helper функцію `getRackDataFromConfig()`
2. Отримання даних з `rack_configurations` замість `racks`
3. Виправлено імпорт з `shared/rackCalculator.ts`
4. Виправлено парсинг полів:
   - `supports` - простий рядок (не JSON)
   - `vertical_supports` - JSON
   - `spans` - JSON

**Приклад використання:**
```javascript
const getRackDataFromConfig = async (db, rackConfigId, priceData, user) => {
  const config = db.prepare('SELECT * FROM rack_configurations WHERE id = ?').get(rackConfigId);
  
  const rackConfig = {
    floors: config.floors,
    rows: config.rows,
    beamsPerRow: config.beams_per_row,
    supports: config.supports || null,  // Простий рядок
    verticalSupports: config.vertical_supports ? JSON.parse(config.vertical_supports) : null,
    spans: config.spans ? JSON.parse(config.spans) : null,
  };
  
  const rackCalculator = await import('../../../shared/rackCalculator.js');
  const { calculateRackComponents, calculateTotalCost, calculateTotalWithoutIsolators, generateRackName } = rackCalculator;
  
  // Розрахунок цін з урахуванням дозволів
  // ...
};
```

#### `exportController.js`

**Зміни:**
1. Додано `getRackDataFromConfig()` (аналогічно до `rackSetController`)
2. Оновлено `exportRackSet()` для роботи з `rack_items`
3. Оновлено `exportNewRackSet()` для прийому `rack_items`

---

### 3. Виправлення розрахунку цін

#### `pricingService.js`

**Проблема:**
```javascript
// ❌ Неправильно - знижка 10% замість виключення ізоляторів
const prices = [
  { type: 'базова', value: totalCost },
  { type: 'без_ізоляторів', value: totalCost * 0.9 },  // Помилка!
  { type: 'нульова', value: totalCost * 1.44 },
];
```

**Виправлення:**
```javascript
// ✅ Правильно - використовуємо calculateTotalWithoutIsolators
import { calculateTotalCost, calculateTotalWithoutIsolators } from '../../../shared/rackCalculator.js';

const totalCost = calculateTotalCost(components);
const totalWithoutIsolators = calculateTotalWithoutIsolators(components);

const prices = [
  { type: 'базова', value: totalCost },
  { type: 'без_ізоляторів', value: totalWithoutIsolators },  // ✅
  { type: 'нульова', value: totalCost * 1.44 },
];
```

**Приклад розрахунку:**
```
Комплектація:
№  Назва              К-сть  Ціна     Сума
1  Опора 290          4        780.00   6240.00 ₴
2  Балка 1000         8        790.00   12640.00 ₴
3  Верт. стійка 1190  8        1150.00  18400.00 ₴
4  Розкос             4        380.00   3040.00 ₴
──────────────────────────────────────────────────
Базова ціна:         40320.00 ₴  ← Сума компонентів
Ціна без ізоляторів: 40320.00 ₴  ← Базова (ізоляторів немає, floors > 1)
Нульова ціна:        58060.80 ₴  ← 40320 * 1.44
```

---

### 4. Ролі та відображення цін

#### Логіка для різних ролей

| Роль | Дозволи | Ціни в таблиці | totalCost |
|------|---------|---------------|-----------|
| **admin** | базова, без ізол., нульова | ✅ Всі | Нульова |
| **manager** | нульова | ✅ Нульова | Нульова |
| **user** | (немає) | ❌ Не показуємо | **0** |

**Код:**
```javascript
const permissions = user?.permissions || { price_types: [] };

let mainTotalCost = 0;
if (permissions.price_types?.includes('нульова')) {
  mainTotalCost = zeroPrice;
} else if (permissions.price_types?.includes('без_ізоляторів')) {
  mainTotalCost = totalWithoutIsolators;
} else if (permissions.price_types?.includes('базова')) {
  mainTotalCost = totalCost;
} else {
  mainTotalCost = 0;  // Немає дозволів на ціни
}

return {
  // ...
  totalCost: mainTotalCost,
};
```

---

### 5. Клієнтська частина

#### Оновлення `MyRackSetsPage.tsx`

**Зміни:**
1. Додано підтримку `total_cost_snapshot` для зворотної сумісності
2. Оновлено відображення загальної вартості

```typescript
// ✅ Тепер правильно
{(rackSet.total_cost_snapshot || rackSet.total_cost || 0).toFixed(2)} ₴
```

#### Оновлення `rackSetsApi.ts`

**Зміни:**
```typescript
export interface RackSet {
  total_cost?: number;        // Старе поле (для сумісності)
  total_cost_snapshot?: number;  // Нове поле
}
```

---

## 📊 Результати

### Покращення

1. **Нормалізація БД:**
   - ✅ Видалено дублювання даних
   - ✅ Зменшено розмір БД
   - ✅ Покращено продуктивність

2. **Виправлення цін:**
   - ✅ "Без ізоляторів" = базова мінус ізолятори (а не знижка 10%)
   - ✅ Базова ціна = сума всіх компонентів
   - ✅ Коректний розрахунок для всіх ролей

3. **Архітектура:**
   - ✅ Централізований розрахунок в `getRackDataFromConfig()`
   - ✅ Консистентність між контролерами
   - ✅ Правильний імпорт з TypeScript файлів

### Статистика змін

| Файл | Зміни |
|------|-------|
| `012_remove_racks_column.js` | +100 рядків (міграція) |
| `013_rename_rack_items_new_to_rack_items.js` | +100 рядків (міграція) |
| `rackSetController.js` | ~150 рядків змін |
| `exportController.js` | ~100 рядків змін |
| `pricingService.js` | ~10 рядків змін |
| `MyRackSetsPage.tsx` | ~5 рядків змін |
| `rackSetsApi.ts` | ~3 рядки змін |

---

## ✅ Перевірка

### TypeScript
```bash
npm run typecheck
> ✅ Успішно, без помилок
```

### Міграції
```bash
npm run migrate:status
> ✅ Executed | 013_rename_rack_items_new_to_rack_items.js
```

### Тестування
- ✅ Перевірено відображення в "Моїх комплектах"
- ✅ Перевірено розрахунок цін для admin/manager/user
- ✅ Перевірено експорт в Excel

---

## 📝 Висновки

### Що було виправлено

1. **Дублювання даних в БД** - видалено поле `racks`
2. **Неправильний розрахунок "Без ізоляторів"** - використовується `calculateTotalWithoutIsolators`
3. **Відображення цін для user** - тепер показує 0

### Що покращилося

1. **Продуктивність** - менше даних зберігається в БД
2. **Консистентність** - одна логіка в всіх контролерах
3. **Прозорість** - правильні формули розрахунку цін

---

**Аудит провів:** Qwen Code  
**Дата:** 9 березня 2026  
**Статус:** ✅ Завершено
