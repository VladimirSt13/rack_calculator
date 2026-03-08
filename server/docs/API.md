# 📚 API Документація

## 🔗 Swagger UI

Інтерактивна документація доступна за адресою:

**Development:**
- 🌐 http://localhost:3001/api-docs
- 📄 http://localhost:3001/api-docs.json

**Production:**
- 🌐 https://api.rack-calculator.com/api-docs

---

## 🚀 Швидкий старт

### 1. Відкрийте Swagger UI

Перейдіть за посиланням http://localhost:3001/api-docs

### 2. Авторизація

1. Натисніть кнопку **"Authorize"** у верхньому правому куті
2. Введіть ваш JWT токен у форматі: `Bearer <your-token>`
3. Натисніть **"Authorize"**

**Отримати токен можна через API:**

```bash
# Логін
curl -X POST http://localhost:3001/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vs.com",
    "password": "P@ssw0rd13"
  }'
```

Відповідь міститиме `accessToken`, який потрібно використати для авторизації.

---

## 📋 Доступні Endpoints

### **Auth** - Аутентифікація та авторизація

| Метод | Endpoint | Опис | Auth |
|-------|----------|------|------|
| POST | `/auth/users` | Реєстрація нового користувача | ❌ |
| POST | `/auth/session` | Вхід (логін) | ❌ |
| DELETE | `/auth/session` | Вихід | ❌ |
| POST | `/auth/token` | Оновлення access token | ❌ |
| POST | `/auth/email/verify` | Підтвердження email | ❌ |
| POST | `/auth/email/verification` | Повторна відправка підтвердження | ❌ |
| POST | `/auth/password-resets` | Запит на скидання пароля | ❌ |
| PUT | `/auth/password` | Скидання пароля з токеном | ❌ |
| PATCH | `/auth/password` | Зміна пароля | ✅ |
| GET | `/auth/me` | Поточний користувач | ✅ |
| POST | `/auth/admin/users` | Створення користувача (admin) | ✅ Admin |

---

### **Rack** - Розрахунок стелажів

| Метод | Endpoint | Опис | Auth |
|-------|----------|------|------|
| POST | `/rack/calculate` | Розрахунок стелажа | ✅ |
| POST | `/rack/calculate-batch` | Масовий розрахунок | ✅ |

**Приклад запиту:**

```json
{
  "floors": 3,
  "rows": 2,
  "beamsPerRow": 2,
  "supports": "C",
  "verticalSupports": "V",
  "spans": [
    { "item": "3000", "quantity": 2 },
    { "item": "2500", "quantity": 1 }
  ]
}
```

---

### **Battery** - Підбір стелажів для акумуляторів

| Метод | Endpoint | Опис | Auth |
|-------|----------|------|------|
| POST | `/battery/calculate` | Розрахунок по батареї | ✅ |
| POST | `/battery/find-best` | Підбір найкращого варіанту | ✅ |

**Приклад запиту:**

```json
{
  "batteryDimensions": {
    "length": 407,
    "width": 176,
    "height": 240,
    "weight": 30
  },
  "quantity": 24,
  "format": "L"
}
```

---

### **Users** - Управління користувачами

| Метод | Endpoint | Опис | Auth |
|-------|----------|------|------|
| GET | `/users` | Список користувачів | ✅ Admin |
| GET | `/users/:id` | Користувач за ID | ✅ Admin |
| POST | `/users` | Створити користувача | ✅ Admin |
| PUT | `/users/:id` | Оновити користувача | ✅ Admin |
| DELETE | `/users/:id` | Видалити користувача | ✅ Admin |

---

### **Roles** - Управління ролями

| Метод | Endpoint | Опис | Auth |
|-------|----------|------|------|
| GET | `/roles` | Список ролей | ✅ Admin |
| GET | `/roles/:name/permissions` | Дозволи ролі | ✅ Admin |
| PUT | `/roles/:name/permissions` | Оновити дозволи | ✅ Admin |
| PUT | `/roles/:name/price-types` | Оновити типи цін | ✅ Admin |
| POST | `/roles` | Створити роль | ✅ Admin |

---

### **Rack Sets** - Комплекти стелажів

| Метод | Endpoint | Опис | Auth |
|-------|----------|------|------|
| GET | `/rack-sets` | Список комплектів | ✅ |
| GET | `/rack-sets/:id` | Комплект за ID | ✅ |
| POST | `/rack-sets` | Створити комплект | ✅ |
| PUT | `/rack-sets/:id` | Оновити комплект | ✅ |
| DELETE | `/rack-sets/:id` | Видалити комплект | ✅ |
| GET | `/rack-sets/:id/export` | Експорт в Excel | ✅ |

---

### **Audit** - Журнал аудиту

| Метод | Endpoint | Опис | Auth |
|-------|----------|------|------|
| GET | `/audit` | Список записів аудиту | ✅ Admin |
| GET | `/audit/statistics` | Статистика аудиту | ✅ Admin |
| POST | `/audit/cleanup` | Очищення старих записів | ✅ Admin |
| GET | `/audit/:entityType/:entityId` | Аудит сутності | ✅ Admin |
| GET | `/audit/user/:userId` | Аудит користувача | ✅ Admin |

---

## 🔐 Типи авторизації

### **Bearer Token (JWT)**

Більшість endpoints вимагають JWT токен:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Рівні доступу**

| Роль | Опис |
|------|------|
| `public` | Доступно без авторизації |
| `user` | Будь-який авторизований користувач |
| `manager` | Тільки менеджери |
| `admin` | Тільки адміністратори |

---

## 📊 Коды відповідей

| Код | Опис |
|-----|------|
| 200 | Успіх |
| 201 | Створено |
| 204 | Немає вмісту |
| 400 | Помилка валідації |
| 401 | Неавторизовано |
| 403 | Заборонено (немає прав) |
| 404 | Не знайдено |
| 409 | Конфлікт (напр. email існує) |
| 422 | Помилка валідації (детальна) |
| 429 | Забагато запитів (Rate Limit) |
| 500 | Внутрішня помилка сервера |

---

## 🧪 Приклади використання

### **Реєстрація**

```bash
curl -X POST http://localhost:3001/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@accu-energo.com.ua",
    "password": "P@ssw0rd13",
    "role": "user"
  }'
```

### **Логін**

```bash
curl -X POST http://localhost:3001/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vs.com",
    "password": "P@ssw0rd13"
  }'
```

### **Розрахунок стелажа**

```bash
curl -X POST http://localhost:3001/api/rack/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "floors": 3,
    "rows": 2,
    "beamsPerRow": 2,
    "supports": "C",
    "spans": [
      {"item": "3000", "quantity": 2}
    ]
  }'
```

### **Підбір по батареї**

```bash
curl -X POST http://localhost:3001/api/battery/find-best \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "batteryDimensions": {
      "length": 407,
      "width": 176,
      "height": 240,
      "weight": 30
    },
    "quantity": 24
  }'
```

---

## 📝 Додаткові ресурси

- [Swagger Specification](https://swagger.io/specification/)
- [OpenAPI Initiative](https://www.openapis.org/)
- [JWT.io](https://jwt.io/) - декодер токенів

---

**Останнє оновлення:** 8 березня 2026  
**Версія API:** 2.0.0
