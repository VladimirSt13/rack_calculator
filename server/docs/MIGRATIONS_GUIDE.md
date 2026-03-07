# 📦 Міграції БД

## Як працюють міграції

Міграції **не виконуються автоматично** при старті сервера. Вони мають виконуватися **окремою командою** перед деплоєм нових змін.

## Команди

```bash
# Запустити всі нові міграції
npm run migrate

# Перевірити статус міграцій
npm run migrate:status

# Відкотити останню міграцію
npm run migrate:rollback
```

## Процес деплою

### 1. Перед деплою

```bash
cd server
npm run migrate
```

Це виконає тільки **нові** міграції, які ще не були виконані.

### 2. Перевірка статусу

```bash
npm run migrate:status
```

**Приклад виводу:**
```
[Migration Status]
================
✓ Executed | 001_add_roles_to_users.js | 2026-03-07 06:34:38
✓ Executed | 002_create_refresh_tokens.js | 2026-03-07 06:34:38
✓ Executed | 003_create_email_verifications.js | 2026-03-07 06:34:38
○ Pending   | 007_create_rack_templates.js | -
================
```

### 3. Запуск сервера

```bash
npm run dev
# або
npm start
```

## Як це працює

### Таблиця `_migrations`

Кожна виконана міграція записується в таблицю `_migrations`:

```sql
CREATE TABLE _migrations (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Перевірка перед виконанням

Перед виконанням міграції система перевіряє:
1. Чи існує вже ця міграція в таблиці `_migrations`
2. Якщо існує - пропускає
3. Якщо ні - виконує і записує в таблицю

### Приклад виконання

```bash
$ npm run migrate

[Migrations] Found 6 migration files
[Migrations] Already executed: 6
[Migrations] Skipping 001_add_roles_to_users.js (already executed)
[Migrations] Skipping 002_create_refresh_tokens.js (already executed)
[Migrations] Skipping 003_create_email_verifications.js (already executed)
[Migrations] Skipping 004_create_rack_sets.js (already executed)
[Migrations] Skipping 005_create_rack_set_revisions.js (already executed)
[Migrations] Skipping 006_create_audit_log.js (already executed)
[Migrations] No new migrations to run
```

## Структура міграцій

```
server/src/db/migrations/
├── index.js                  # Migration runner
├── 001_add_roles_to_users.js
├── 002_create_refresh_tokens.js
├── 003_create_email_verifications.js
├── 004_create_rack_sets.js
├── 005_create_rack_set_revisions.js
└── 006_create_audit_log.js
```

### Формат файлу міграції

```javascript
export const up = (db) => {
  // Код міграції (виконується при застосуванні)
  db.exec(`
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'other'
  `);
};

export const down = (db) => {
  // Код відкату (виконується при rollback)
  // Примітка: SQLite не підтримує DROP COLUMN напряму
};

export default { up, down };
```

## Відкат міграцій

```bash
npm run migrate:rollback
```

**Важливо:**
- Відкатується тільки **остання** міграція
- Міграція має мати функцію `down()` для відкату
- Якщо `down()` немає - відкат неможливий

## Автоматизація в CI/CD

### GitHub Actions приклад

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
        working-directory: ./server
      
      - name: Run migrations
        run: npm run migrate
        working-directory: ./server
        env:
          DB_PATH: ./data/rack_calculator.db
      
      - name: Restart server
        run: pm2 restart rack-calculator
```

### Docker приклад

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --production

COPY server/ ./

# Запуск міграцій перед стартом
CMD ["sh", "-c", "npm run migrate && npm start"]
```

## Best Practices

### ✅ Правильно

1. **Запускати міграції перед деплою**
   ```bash
   npm run migrate && npm start
   ```

2. **Перевіряти статус перед відкатом**
   ```bash
   npm run migrate:status
   npm run migrate:rollback
   ```

3. **Тестувати міграції на staging**
   ```bash
   # Staging environment
   DB_PATH=./staging.db npm run migrate
   ```

4. **Робити backup БД перед міграціями**
   ```bash
   cp data/rack_calculator.db data/backup_$(date +%Y%m%d).db
   npm run migrate
   ```

### ❌ Неправильно

1. **Не запускати міграції на продакшені без тестування**
2. **Не змінювати вже виконані міграції**
3. **Не видаляти файли виконаних міграцій**
4. **Не запускати міграції з різними версіями коду**

## Вирішення проблем

### Помилка: "table already exists"

Якщо міграція намагається створити таблицю, яка вже існує:

```javascript
// ✅ Правильно
db.exec(`
  CREATE TABLE IF NOT EXISTS users (...)
`);

// ❌ Неправильно
db.exec(`
  CREATE TABLE users (...)
`);
```

### Помилка: "column already exists"

Якщо міграція намагається додати колонку, яка вже існує:

```bash
# Видалити запис з _migrations
sqlite3 data/rack_calculator.db "DELETE FROM _migrations WHERE name = '001_add_roles_to_users.js'"

# Запустити міграцію знову
npm run migrate
```

### Помилка: "no such table"

Якщо таблиця `_migrations` не існує:

```bash
# Видалити БД і створити заново
rm data/rack_calculator.db
npm run migrate
```

**Увага:** Це видалить всі дані!

## Моніторинг

### Перевірити останні міграції

```sql
SELECT * FROM _migrations ORDER BY executed_at DESC LIMIT 10;
```

### Перевірити тривалість виконання

```sql
SELECT 
  name,
  executed_at,
  julianday('now') - julianday(executed_at) as days_ago
FROM _migrations
ORDER BY executed_at DESC;
```

## Корисні посилання

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Better-SQLite3 API](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md)
- [Migration Best Practices](https://flywaydb.org/blog/database-migration-best-practices)
