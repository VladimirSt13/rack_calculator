# Очищення історії змін прайсу

## 📋 Огляд

Сервіс автоматичного очищення історії змін прайс-листів для оптимізації розміру бази даних.

## ⚙️ Налаштування

Додати в `.env`:

```env
# Максимальна кількість версій прайсу
PRICE_HISTORY_MAX_VERSIONS=100

# Максимальний вік версій (днів)
PRICE_HISTORY_MAX_DAYS=90

# Розклад очищення (Cron format)
PRICE_HISTORY_CLEANUP_SCHEDULE=0 3 * * 0
```

### Значення за замовчуванням:
- **100 версій** — максимум збережених записів
- **90 днів** — максимум зберігання версії
- **0 3 * * 0** — щонеділі о 03:00

## 🚀 Використання

### Автоматичне очищення

Сервіс запускається автоматично при старті сервера:

```javascript
// server/src/index.js
import { initPriceHistoryCleanup } from './services/priceHistoryCleanupService.js';

initPriceHistoryCleanup(); // Щонеділі о 03:00
```

### Ручне очищення

```bash
npm run price-history:cleanup
```

### Приклад виводу:

```
========================================
  Price History Cleanup Script
========================================

[1/3] Initializing database...
[1/3] Database initialized

[2/3] Running cleanup...
[Price History Cleanup] Starting cleanup...
[Price History Cleanup] Settings: maxVersions=100, maxDays=90
[Price History Cleanup] Cutoff date: 2025-12-13T03:00:00.000Z
[Price History Cleanup] Deleted 45 versions older than 90 days
[Price History Cleanup] Remaining versions: 78
[2/3] Cleanup completed

[3/3] Results:
  - Deleted old versions: 45
  - Deleted extra versions: 0
  - Remaining versions: 78

========================================
  Cleanup completed successfully! ✓
========================================
```

## 📊 Стратегія очищення

### Крок 1: Видалення старих версій
```sql
DELETE FROM price_versions
WHERE created_at < datetime('now', '-90 days');
```

### Крок 2: Обмеження кількості
```sql
DELETE FROM price_versions
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id FROM price_versions
    ORDER BY created_at DESC
    LIMIT 100
  )
);
```

### Крок 3: Видалення orphaned записів
```sql
DELETE FROM price_version_items
WHERE version_id NOT IN (SELECT id FROM price_versions);
```

### Крок 4: Оптимізація БД
```sql
VACUUM;
```

## 📈 Моніторинг

### Перевірка кількості версій:
```sql
SELECT COUNT(*) as total_versions FROM price_versions;
```

### Перевірка найстарішої версії:
```sql
SELECT created_at, created_by, items_count
FROM price_versions
ORDER BY created_at ASC
LIMIT 1;
```

### Перевірка розміру таблиці:
```sql
SELECT 
  page_count * page_size as size_bytes,
  page_count,
  page_size
FROM pragma_page_count(), pragma_page_size();
```

## 🔧 Зміна налаштувань

### Для великих компаній (активні зміни):
```env
PRICE_HISTORY_MAX_VERSIONS=500
PRICE_HISTORY_MAX_DAYS=180
PRICE_HISTORY_CLEANUP_SCHEDULE=0 2 * * 0  # Щонеділі о 02:00
```

### Для малих компаній (рідкісні зміни):
```env
PRICE_HISTORY_MAX_VERSIONS=50
PRICE_HISTORY_MAX_DAYS=60
PRICE_HISTORY_CLEANUP_SCHEDULE=0 4 * * 0  # Щонеділі о 04:00
```

### Тестування (локально):
```env
PRICE_HISTORY_MAX_VERSIONS=10
PRICE_HISTORY_MAX_DAYS=7
PRICE_HISTORY_CLEANUP_SCHEDULE=*/5 * * * *  # Кожні 5 хвилин
```

## ⚠️ Важливо

1. **Резервне копіювання** перед масовим видаленням:
   ```bash
   sqlite3 data/rack_calculator.db ".backup 'backups/price_backup.db'"
   ```

2. **Перевірка перед видаленням**:
   ```sql
   SELECT 
     COUNT(*) as total,
     MIN(created_at) as oldest,
     MAX(created_at) as newest
   FROM price_versions;
   ```

3. **Відновлення з backup**:
   ```bash
   sqlite3 data/rack_calculator.db ".restore 'backups/price_backup.db'"
   ```

## 📝 Логування

Всі операції записуються в консоль з префіксом `[Price History Cleanup]`.

Для збереження логів в файл:
```bash
npm run price-history:cleanup >> logs/price-cleanup.log 2>&1
```

## 🎯 Рекомендації

1. **Запускати** в нічний час (02:00-04:00)
2. **Моніторити** розмір БД після очищення
3. **Зберігати** backup перед великими очищеннями
4. **Налаштувати** сповіщення про помилки

---

**Оновлено:** 13 березня 2026
**Версія:** 1.0
