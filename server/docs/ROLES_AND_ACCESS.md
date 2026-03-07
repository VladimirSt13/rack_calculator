# 📋 Ролі та доступ

## Ролі користувачів

### `admin` - Адміністратор
**Доступ:** Повний доступ до всіх сторінок та функцій

**Сторінки:**
- ✅ Стелаж (RackPage)
- ✅ Акумулятор (BatteryPage)
- ✅ Адмін-панель (AdminDashboard)

**Ціни:** Всі типи цін видимі
- ✅ Без ізоляторів
- ✅ Загальна
- ✅ Нульова
- ✅ Собівартість
- ✅ Оптова

---

### `manager` - Менеджер
**Доступ:** Тільки сторінка "Акумулятор"

**Сторінки:**
- ❌ Стелаж (RackPage) - **немає доступу**
- ✅ Акумулятор (BatteryPage) - **тільки ця сторінка**
- ❌ Адмін-панель - **немає доступу**

**Ціни:** Тільки нульова ціна
- ❌ Без ізоляторів - **приховано**
- ❌ Загальна - **приховано**
- ✅ Нульова - **видимо**
- ❌ Собівартість - **приховано**
- ❌ Оптова - **приховано**

---

### `user` - Користувач (обмежений доступ)
**Доступ:** Немає доступу до сторінок розрахунку

**Сторінки:**
- ❌ Стелаж (RackPage) - **немає доступу**
- ❌ Акумулятор (BatteryPage) - **немає доступу**
- ❌ Адмін-панель - **немає доступу**

**Ціни:** Немає доступу до цін

**UX:**
- Після реєстрації перенаправляється на `/access-denied`
- Повідомлення: "Зверніться до адміністратора для активації"
- Може увійти в систему, але не має доступу до функцій

---

## Master адміни

### admin@vs.com
- **Роль:** admin
- **Пароль:** P@ssw0rd13
- **Створено:** Seed скриптом
- **Permissions:** Всі типи цін

### V.Stognij@accu-energo.com.ua
- **Роль:** admin
- **Пароль:** P@ssw0rd13
- **Створено:** Seed скриптом
- **Permissions:** Всі типи цін

---

## Тестові користувачі

### manager@test.com
- **Роль:** manager
- **Пароль:** 123456
- **Permissions:** Тільки 'нульова' ціна
- **Доступ:** Тільки сторінка "Акумулятор"

### user@test.com
- **Роль:** user
- **Пароль:** 123456
- **Permissions:** Немає доступу до цін
- **Доступ:** Немає доступу (access-denied)

---

## Реєстрація нових користувачів

### Автоматична роль
Нові користувачі створюються з роллю `user` (обмежений доступ).

### Flow активації
```
1. Користувач реєструється → role='user'
2. Перенаправляється на /access-denied
3. Бачить повідомлення "Зверніться до адміна"
4. Адмін змінює роль на 'manager' або 'admin'
5. Користувач отримує доступ
```

---

## Адмін-панель (User Management)

### Функціонал
- [ ] Список всіх користувачів
- [ ] Фільтр за роллю
- [ ] Зміна ролі користувача
- [ ] Зміна permissions (типи цін)
- [ ] Видалення користувача
- [ ] Створення нового користувача (будь-яка пошта)

### Endpoint'и
```
GET    /api/users          - список користувачів (admin)
GET    /api/users/:id      - отримати користувача (admin)
PUT    /api/users/:id      - оновити користувача (admin)
DELETE /api/users/:id      - видалити користувача (admin)
POST   /api/users          - створити користувача (admin)
```

---

## Навігація

### Header
Навігація в хедері динамічно змінюється залежно від ролі:

**Admin:**
- [Стелаж] [Акумулятор]

**Manager:**
- [Акумулятор]

**User:**
- (немає навігації)

---

## Protected Routes

### Приклад використання

```tsx
// Тільки для адміна
<ProtectedRoute allowedRoles={['admin']} requireActive>
  <RackPage />
</ProtectedRoute>

// Для адміна та менеджера
<ProtectedRoute allowedRoles={['admin', 'manager']} requireActive>
  <BatteryPage />
</ProtectedRoute>

// Вимагає активну роль (не 'user')
<ProtectedRoute requireActive>
  <Navigate to="/battery" replace />
</ProtectedRoute>
```

### Props
- `allowedRoles` - дозволені ролі
- `requireActive` - вимагає активну роль (не 'user')

---

## Access Denied Page

**URL:** `/access-denied`

**Відображається коли:**
- Користувач з роллю 'user' намагається отримати доступ
- Користувач не має потрібної ролі
- Немає активної ролі

**Контент:**
- Повідомлення про необхідність звернутися до адміна
- Email користувача
- Інструкції з активації

---

## Seed скрипт

### Створення адмінів

```bash
cd server
npm run seed:admin
```

**Створює:**
1. `admin@vs.com` / `P@ssw0rd13` (admin)
2. `V.Stognij@accu-energo.com.ua` / `P@ssw0rd13` (admin)

---

## База даних

### users table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'manager', 'user')),
  permissions JSON,
  email_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Permissions структура
```json
{
  "price_types": [
    "без_ізоляторів",
    "загальна",
    "нульова",
    "собівартість",
    "оптова"
  ]
}
```

---

## Безпека

### Перевірка на сервері
Кожен API endpoint перевіряє роль користувача:

```javascript
// Middleware
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Фільтрація цін
Сервер повертає тільки дозволені ціни:

```javascript
// Manager - тільки нульова
{
  "totalCost": null,
  "totalWithoutIsolators": null,
  "totalZero": 0
}

// Admin - всі ціни
{
  "totalCost": 15000,
  "totalWithoutIsolators": 14000,
  "totalZero": 0
}
```
