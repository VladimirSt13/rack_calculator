# Server Pro - Шаблон сервера з авторизацією

Модульний сервер на Express + SQLite з готовою системою авторизації, ролями, аудитуванням та Cron задачами.

---

## 🚀 Швидкий старт

### 1. Встановлення залежностей

```bash
cd server_pro
npm install
```

### 2. Налаштування оточення

```bash
# Скопіювати шаблон .env
cp .env.example .env
```

**Обов'язково змініть у `.env`:**
```env
JWT_SECRET=your_super_secret_unique_key_here
NODE_ENV=production  # для продакшену
```

### 3. Запуск міграцій

```bash
npm run migrate
```

### 4. Створення адміністратора

```bash
npm run seed:admin
```

### 5. Запуск сервера

```bash
# Розробка (з авто-рестартом)
npm run dev

# Продакшн
npm start
```

Сервер запуститься на `http://localhost:3001`

---

## 📁 Структура проєкту

```
server_pro/
├── src/
│   ├── config/
│   │   ├── index.js         # Конфігурація з .env
│   │   └── swagger.js       # Swagger налаштування
│   ├── controllers/
│   │   └── authController.js # Авторизація
│   ├── routes/
│   │   ├── auth.js          # Auth routes
│   │   └── example.js       # Приклад CRUD
│   ├── middleware/
│   │   └── auth.js          # Auth, ролі, дозволи
│   ├── services/
│   │   └── scheduler.js     # Cron задачі
│   ├── models/
│   │   ├── BaseModel.js     # Базовий CRUD
│   │   ├── User.js          # Користувачі
│   │   └── RefreshToken.js  # Refresh токени
│   ├── helpers/
│   │   └── audit.js         # Журнал аудиту
│   ├── db/
│   │   └── index.js         # Ініціалізація БД
│   └── index.js             # Точка входу
├── migrations/
│   └── 001_create_example_table.js
├── scripts/
│   ├── migrate.js           # Управління міграціями
│   └── seed-admin.js        # Створення адміна
├── data/
│   └── app.db               # SQLite база
├── .env.example
├── package.json
└── README.md
```

---

## 🔐 API Endpoints

### Авторизація

| Метод | Endpoint | Опис | Auth |
|-------|----------|------|------|
| POST | `/api/auth/register` | Реєстрація | ❌ |
| POST | `/api/auth/login` | Вхід | ❌ |
| POST | `/api/auth/logout` | Вихід | ✅ |
| POST | `/api/auth/refresh` | Оновлення токена | ❌ |
| POST | `/api/auth/verify-email` | Підтвердження email | ❌ |
| GET | `/api/auth/me` | Поточний користувач | ✅ |

### Приклад (Example CRUD)

| Метод | Endpoint | Опис | Auth |
|-------|----------|------|------|
| GET | `/api/example` | Список | ✅ |
| POST | `/api/example` | Створити | ✅ |
| GET | `/api/example/:id` | Отримати | ✅ |
| PUT | `/api/example/:id` | Оновити | ✅ |
| DELETE | `/api/example/:id` | Видалити (soft) | ✅ |
| GET | `/api/example/deleted/list` | Видалені | ✅ Admin |
| POST | `/api/example/:id/restore` | Відновити | ✅ Admin |

---

## 📝 Приклади запитів

### Реєстрація

```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Відповідь:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "emailVerified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "verificationToken": "abc123..."
}
```

### Вхід

```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Створити приклад

```bash
POST http://localhost:3001/api/example
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Test Example",
  "description": "Description here"
}
```

---

## 🗄️ База даних

### Таблиці

| Таблиця | Опис |
|---------|------|
| `users` | Користувачі (email, password_hash, role, permissions) |
| `refresh_tokens` | Refresh токени (hashed) |
| `email_verifications` | Токени підтвердження email |
| `password_resets` | Токени скидання пароля |
| `audit_log` | Журнал дій користувачів |
| `migrations` | Відстеження міграцій |
| `example` | Приклад таблиці з soft delete |

### Міграції

**Створити нову міграцію:**

```bash
# migrations/002_create_new_table.js
export const up = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS new_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export const down = (db) => {
  db.exec('DROP TABLE IF EXISTS new_table');
};
```

**Команди:**
```bash
npm run migrate          # Запуск всіх_pending міграцій
npm run migrate:status   # Статус міграцій
npm run migrate:rollback # Відкат останньої міграції
```

---

## 🔒 Ролі та дозволи

### Ролі

- `admin` - повний доступ до всіх функцій
- `manager` - обмежений доступ
- `user` - базовий доступ

### Дозволи

Зберігаються в JSON полі `permissions`:

```json
["users:read", "users:write", "reports:read", "*"]
```

### Використання middleware

```javascript
import { authenticate, authorizeRole } from './middleware/auth.js';

// Тільки авторизовані
router.get('/protected', authenticate, handler);

// Тільки адмін
router.delete('/users/:id', authenticate, authorizeRole('admin'), handler);

// Кілька ролей
router.get('/reports', authenticate, authorizeRole('admin', 'manager'), handler);
```

---

## 🛡️ Безпека

| Функція | Опис |
|---------|------|
| **JWT** | Access token (7 днів) + Refresh token (30 днів) |
| **Rate Limiting** | 100 запитів/15хв, 5 auth-запитів/год |
| **Helmet** | Security HTTP заголовки |
| **bcrypt** | Хешування паролів (salt rounds: 12) |
| **CORS** | Налаштовувані allowed origins |
| **Soft Delete** | Видалення з прапором та можливістю відновлення |

---

## 🧹 Cron задачі

| Задача | Розклад | Опис | Змінна |
|--------|---------|------|--------|
| Audit Cleanup | `0 2 * * 0` | Аудит > 90 днів | `AUDIT_CLEANUP_ENABLED` |
| Token Cleanup | `0 3 * * 0` | Токени > 30 днів | `TOKEN_CLEANUP_ENABLED` |
| Deleted Cleanup | `0 4 * * 0` | Видалені > 30 днів | `DELETED_CLEANUP_ENABLED` |

**Налаштування в `.env`:**
```env
AUDIT_CLEANUP_ENABLED=true
AUDIT_CLEANUP_SCHEDULE=0 2 * * 0
AUDIT_CLEANUP_DAYS=90
```

---

## 📊 API Документація

Swagger UI доступний за адресою:

```
http://localhost:3001/api-docs
```

JSON специфікація:
```
http://localhost:3001/api-docs.json
```

---

## 🧪 Аудит

Всі критичні дії логуються в `audit_log`:

```javascript
import audit from './helpers/audit.js';

await audit.log({
  userId: req.user.id,
  action: 'CREATE',
  entityType: 'example',
  entityId: newRecord.id,
  newValue: newRecord,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});
```

---

## 🔄 Розширення функціоналу

### Додати новий CRUD

1. Створити міграцію в `migrations/`
2. Створити модель в `models/` (опціонально)
3. Створити контролер в `controllers/`
4. Створити routes в `routes/`
5. Додати route в `src/index.js`

### Додати нову роль

1. Оновити CHECK constraint в БД
2. Додати дозволи в `models/User.js`

### Додати нову Cron задачу

1. Додати функцію в `services/scheduler.js`
2. Додати змінні в `.env.example`

---

## 🛠️ Корисні команди

```bash
npm run dev              # Запуск з auto-reload
npm run migrate          # Міграції БД
npm run seed:admin       # Створити адміна
npm run lint             # Linting
npm run format           # Форматування
npm test                 # Тести
```

---

## 📄 Ліцензія

MIT
