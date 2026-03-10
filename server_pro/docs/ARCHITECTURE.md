# Архітектура Server Pro

## Огляд

Server Pro - це модульний шаблон сервера з мікро-архітектурою, побудований на Express.js та SQLite.

---

## Архітектурні принципи

### 1. Separation of Concerns

Кожен шар має чітку відповідальність:

```
┌─────────────────────────────────────┐
│         Routes (routes/)            │  ← Маршрутизація запитів
├─────────────────────────────────────┤
│      Controllers (controllers/)     │  ← Обробка запитів, валідація
├─────────────────────────────────────┤
│      Services (services/)           │  ← Бізнес-логіка
├─────────────────────────────────────┤
│       Models (models/)              │  ← Доступ до даних
├─────────────────────────────────────┤
│       Database (db/)                │  ← Підключення до БД
└─────────────────────────────────────┘
```

### 2. Single Responsibility

Кожен модуль відповідає за одну функцію:
- `authController.js` - тільки авторизація
- `audit.js` - тільки логування
- `scheduler.js` - тільки Cron задачі

### 3. Dependency Injection

Залежності передаються ззовні:

```javascript
// Погано
const db = require('../db');

// Добре
function UserService(db) {
  this.db = db;
}
```

---

## Шари архітектури

### Routes Layer (`routes/`)

**Відповідальність:** Маршрутизація HTTP запитів до контролерів.

```javascript
// routes/auth.js
router.post('/login', login);
router.post('/register', register);
```

**Правила:**
- ❌ Без бізнес-логіки
- ✅ Тільки mapping URL → Controller
- ✅ Swagger JSDoc коментарі

---

### Controllers Layer (`controllers/`)

**Відповідальність:** Обробка запитів, валідація вхідних даних, виклик сервісів.

```javascript
// authController.js
export const login = async (req, res) => {
  // 1. Валідація вхідних даних
  const { email, password } = req.body;
  
  // 2. Виклик сервісу/моделі
  const user = await User.findByEmail(email);
  
  // 3. Відповідь клієнту
  res.json({ user, token });
};
```

**Правила:**
- ✅ Валідація req.body, req.params
- ✅ Обробка помилок
- ✅ Формування HTTP відповіді
- ❌ Без прямої роботи з БД

---

### Services Layer (`services/`)

**Відповідальність:** Бізнес-логіка, координація між моделями.

```javascript
// services/scheduler.js
export const initCronJobs = () => {
  // Бізнес-логіка розкладу задач
};
```

**Правила:**
- ✅ Бізнес-правила
- ✅ Координація кількох моделей
- ✅ Зовнішні інтеграції (email, API)

---

### Models Layer (`models/`)

**Відповідальність:** Робота з базою даних.

```javascript
// models/User.js
export class User extends BaseModel {
  findByEmail(email) {
    return this.getDb().prepare('...').get(email);
  }
}
```

**Правила:**
- ✅ CRUD операції
- ✅ SQL запити
- ✅ Валідація даних БД
- ❌ Без HTTP логіки

---

### Middleware Layer (`middleware/`)

**Відповідальність:** Перехоплення та обробка запитів.

```javascript
// middleware/auth.js
export const authenticate = (req, res, next) => {
  // Перевірка JWT токена
};
```

**Типи:**
- Auth middleware (перевірка токенів)
- Validation middleware
- Logging middleware
- Error handling middleware

---

### Helpers (`helpers/`)

**Відповідальність:** Допоміжні утиліти.

```javascript
// helpers/audit.js
export const audit = {
  log: async (data) => { ... },
  getLogs: (filters) => { ... },
};
```

---

## Потік даних

```
Клієнт
   │
   ▼
┌─────────────────┐
│     Request     │
└─────────────────┘
   │
   ▼
┌─────────────────┐
│    Middleware   │  ← Auth, Logging, Validation
└─────────────────┘
   │
   ▼
┌─────────────────┐
│     Routes      │  ← Маршрутизація
└─────────────────┘
   │
   ▼
┌─────────────────┐
│   Controllers   │  ← Обробка, Валідація
└─────────────────┘
   │
   ▼
┌─────────────────┐
│    Services     │  ← Бізнес-логіка
└─────────────────┘
   │
   ▼
┌─────────────────┐
│     Models      │  ← БД запити
└─────────────────┘
   │
   ▼
┌─────────────────┐
│    Database     │
└─────────────────┘
   │
   ▼
┌─────────────────┐
│    Response     │
└─────────────────┘
   │
   ▼
Клієнт
```

---

## База даних

### Схема

```
┌──────────────────────────────────────┐
│              users                   │
├──────────────────────────────────────┤
│ id, email, password_hash, role,      │
│ permissions, email_verified,         │
│ created_at, updated_at               │
└──────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│  refresh_tokens │ │  email_verif.   │
└─────────────────┘ └─────────────────┘

┌──────────────────────────────────────┐
│            audit_log                 │
├──────────────────────────────────────┤
│ id, user_id, action, entity_type,    │
│ old_value, new_value, created_at     │
└──────────────────────────────────────┘
```

### Міграції

Використовується система міграцій з відстеженням:

```
migrations/
├── 001_create_example_table.js
├── 002_create_another_table.js
└── ...
```

Кожна міграція має `up()` та `down()` функції.

---

## Безпека

### JWT Flow

```
┌──────────┐                         ┌──────────┐
│  Client  │                         │  Server  │
└────┬─────┘                         └────┬─────┘
     │                                    │
     │  POST /login (email, password)     │
     │───────────────────────────────────>│
     │                                    │
     │                           Перевірка credentials
     │                                    │
     │      { token, refreshToken }       │
     │<───────────────────────────────────│
     │                                    │
     │  POST /api/protected               │
     │  Authorization: Bearer <token>     │
     │───────────────────────────────────>│
     │                                    │
     │                           Verify JWT
     │                                    │
     │         { data }                   │
     │<───────────────────────────────────│
     │                                    │
     │  (token expired)                   │
     │                                    │
     │  POST /auth/refresh                │
     │  Cookie: refreshToken=<token>      │
     │───────────────────────────────────>│
     │                                    │
     │                        Verify Refresh
     │                                    │
     │      { new token }                 │
     │<───────────────────────────────────│
```

### Hashing

```javascript
// bcrypt з salt rounds = 12
const hash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hash);
```

### Rate Limiting

```
Global:  100 запитів / 15 хвилин
Auth:    5 запитів / 1 година
```

---

## Розширення

### Додати новий endpoint

1. **Створити міграцію** (якщо потрібна нова таблиця)
2. **Створити модель** (опціонально, якщо складна логіка)
3. **Створити контролер**
4. **Створити routes**
5. **Додати route в index.js**
6. **Додати Swagger документацію**

### Додати нову роль

1. Оновити CHECK constraint в таблиці `users`
2. Додати дозволи в систему

### Додати нову Cron задачу

1. Додати функцію в `services/scheduler.js`
2. Додати змінні оточення в `.env`

---

## Тестування

### Unit тести

```javascript
// tests/models/User.test.js
describe('User Model', () => {
  it('should find user by email', () => {
    const user = User.findByEmail('test@example.com');
    expect(user.email).toBe('test@example.com');
  });
});
```

### Integration тести

```javascript
// tests/auth.test.js
describe('POST /api/auth/login', () => {
  it('should return token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
```

---

## Продуктивність

### Оптимізації

- **WAL mode** для SQLite
- **Індекси** на часто використовуваних полях
- **Connection pooling** (для PostgreSQL)
- **Кешування** (Redis - опціонально)

### Моніторинг

- Audit log для відстеження дій
- Логування помилок
- Health check endpoint

---

## Deployment

### Змінні оточення

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=strong_random_secret
DB_PATH=/var/data/app.db
CORS_ORIGIN=https://yourdomain.com
```

### Продакшн чек-лист

- [ ] Змінити JWT_SECRET
- [ ] Встановити NODE_ENV=production
- [ ] Налаштувати HTTPS
- [ ] Увімкнути Cron задачі
- [ ] Налаштувати backup БД
- [ ] Встановити rate limiting
- [ ] Увімкнути логування

---

## Ліцензія

MIT
