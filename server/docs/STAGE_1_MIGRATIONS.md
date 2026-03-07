# Етап 1: Міграції БД + ролі + refresh tokens

## Виконані зміни

### 1. Файли міграцій

Створено 6 міграцій у `server/src/db/migrations/`:

| Файл | Опис |
|------|------|
| `001_add_roles_to_users.js` | Додає ролі, permissions, email verification до users |
| `002_create_refresh_tokens.js` | Створює таблицю refresh tokenів |
| `003_create_email_verifications.js` | Створює таблицю для підтвердження email |
| `004_create_rack_sets.js` | Створює таблицю комплектів стелажів |
| `005_create_rack_set_revisions.js` | Створює таблицю історії змін комплектів |
| `006_create_audit_log.js` | Створює таблицю аудиту дій |

### 2. Система міграцій

**Файли:**
- `server/src/db/migrations/index.js` - Migration runner
- `server/scripts/migrate.js` - CLI для управління міграціями

**Команди:**
```bash
# Запустити всі міграції
npm run migrate

# Перевірити статус міграцій
npm run migrate:status

# Відкотити останню міграцію
npm run migrate:rollback
```

### 3. Helper-и

**`server/src/helpers/roles.js`:**
```javascript
import { USER_ROLES, PRICE_TYPES, getUserPermissions } from './roles.js';

// Перевірка ролі
hasRole(user, 'admin', 'manager');

// Перевірка permissions
hasPricePermission(user, PRICE_TYPES.RETAIL);

// Отримати permissions
getUserPermissions(user);
```

**`server/src/helpers/audit.js`:**
```javascript
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from './audit.js';

// Записати в аудит
await logAudit({
  userId: 1,
  action: AUDIT_ACTIONS.CREATE,
  entityType: ENTITY_TYPES.RACK_SET,
  entityId: 5,
  newValue: { name: 'Test' }
});
```

### 4. Middleware

**`server/src/middleware/authorizeRole.js`:**
```javascript
import { authorizeRole } from './middleware/authorizeRole.js';

// Використання в routes
router.get('/admin', authorizeRole('admin'), (req, res) => {
  // Тільки адмін
});

router.get('/manager', authorizeRole('admin', 'manager'), (req, res) => {
  // Адмін або менеджер
});
```

### 5. Оновлення db/index.js

Додано автоматичний запуск міграцій при ініціалізації БД:
```javascript
import { runMigrations } from './migrations/index.js';

export const initDatabase = () => {
  // ...
  runMigrations(db);
  // ...
};
```

---

## Структура БД після міграцій

### users (оновлена)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'other' CHECK(role IN ('admin', 'manager', 'other')),
  permissions JSON,
  email_verified BOOLEAN DEFAULT 0,
  verification_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### refresh_tokens (нова)
```sql
CREATE TABLE refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### email_verifications (нова)
```sql
CREATE TABLE email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### rack_sets (нова)
```sql
CREATE TABLE rack_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  object_name TEXT,
  description TEXT,
  racks JSON NOT NULL,
  total_cost REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### rack_set_revisions (нова)
```sql
CREATE TABLE rack_set_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rack_set_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  racks JSON NOT NULL,
  total_cost REAL,
  change_type TEXT CHECK(change_type IN ('create', 'update', 'delete')) NOT NULL,
  change_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rack_set_id) REFERENCES rack_sets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### audit_log (нова)
```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  old_value JSON,
  new_value JSON,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## Інструкція з запуску

### 1. Запуск міграцій

```bash
cd server

# Запустити всі міграції
npm run migrate

# Або напряму
node scripts/migrate.js
```

**Очікуваний вивід:**
```
[Migrations] Found 6 migration files
[Migrations] Already executed: 0
[Migrations] Running 001_add_roles_to_users.js...
[Migration 001] Adding roles to users table...
[Migration 001] Added role column
[Migration 001] Added permissions column
[Migration 001] Added email_verified column
[Migration 001] Added verification_token column
[Migration 001] Created index on role
[Migration 001] Created index on verification_token
[Migration 001] Completed successfully
[Migrations] ✓ 001_add_roles_to_users.js completed
...
[Migrations] ✓ 6 migration(s) completed successfully
```

### 2. Перевірка статусу

```bash
npm run migrate:status
```

**Очікуваний вивід:**
```
[Migration Status]
================
✓ Executed | 001_add_roles_to_users.js | 2025-03-07 10:00:00
✓ Executed | 002_create_refresh_tokens.js | 2025-03-07 10:00:01
✓ Executed | 003_create_email_verifications.js | 2025-03-07 10:00:02
✓ Executed | 004_create_rack_sets.js | 2025-03-07 10:00:03
✓ Executed | 005_create_rack_set_revisions.js | 2025-03-07 10:00:04
✓ Executed | 006_create_audit_log.js | 2025-03-07 10:00:05
================
```

### 3. Перший запуск сервера

```bash
npm run dev
```

Міграції запустяться автоматично при ініціалізації БД.

---

## Ролі та permissions

### Ролі за замовчуванням

| Роль | Опис | Permissions за замовчуванням |
|------|------|------------------------------|
| `admin` | Адміністратор | Всі типи цін |
| `manager` | Менеджер | Тільки `нульова` ціна |
| `other` | Інше | `без_ізоляторів`, `загальна` |

### Типи цін

```javascript
export const PRICE_TYPES = {
  NO_ISOLATORS: 'без_ізоляторів',
  RETAIL: 'загальна',
  ZERO: 'нульова',
  COST: 'собівартість',
  WHOLESALE: 'оптова',
};
```

### Індивідуальні permissions

Адмін може налаштувати індивідуальні permissions для користувача з роллю `other`:

```json
{
  "price_types": ["без_ізоляторів", "загальна", "нульова"]
}
```

---

## Наступні кроки

Після успішного виконання Етапу 1:

1. ✅ Міграції створені та виконані
2. ✅ Helper-и для ролей готові
3. ✅ Middleware для перевірки ролей готовий
4. ✅ Аудит налаштований

**Наступний етап: Етап 2 - Авторизація на сервері (розширена)**

- [ ] Оновити реєстрацію з перевіркою домену
- [ ] Додати генерацію verification token
- [ ] Додати endpoint `/verify-email`
- [ ] Реалізувати refresh token логіку
- [ ] Додати endpoint `/auth/refresh`
- [ ] Додати endpoint `/auth/revoke`
