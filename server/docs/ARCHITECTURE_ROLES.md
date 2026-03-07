# ✅ Ролі та дозволи - Архітектурні зміни

**Дата:** 7 березня 2026

---

## 📋 Проблема

**До змін:**
- ❌ Ролі захардкоджені в коді
- ❌ Дозволи розмазані по файлах
- ❌ Неможливо додати нову роль без змін коду
- ❌ Permissions в hard-coded об'єктах

**Після змін:**
- ✅ Ролі в базі даних
- ✅ Дозволи в БД (many-to-many)
- ✅ Нові ролі через API/адмін-панель
- ✅ Централізовані константи

---

## 🏗️ Архітектура

### База даних (4 нові таблиці)

```sql
roles
├── id, name, label, description
├── is_default, is_active
└── created_at, updated_at

permissions
├── id, name, label, category
└── created_at

role_permissions (зв'язок)
├── role_id → roles.id
└── permission_id → permissions.id

role_price_types
├── role_id → roles.id
└── price_type (TEXT)
```

---

## 📦 Створені файли

### Server
- ✅ `src/core/constants/roles.js` - Константи ролей та дозволів
- ✅ `src/routes/roles.js` - API для управління ролями
- ✅ `src/db/migrations/009_create_roles_permissions.js` - Міграція
- ✅ `src/helpers/roles.js` - Оновлено helper-и

### Client
- ✅ `src/core/constants/roles.ts` - Константи для клієнта
- ✅ `src/core/constants/routes.ts` - Маршрути (попередньо)

### Документація
- ✅ `server/docs/ROLES_AND_PERMISSIONS.md` - Повна документація

---

## 🔐 Дозволи (19 штук)

### Pages (3)
- `view_rack_page`
- `view_battery_page`
- `view_admin_page`

### Actions (4)
- `create_rack_set`
- `edit_rack_set`
- `delete_rack_set`
- `export_rack_set`

### Prices (5)
- `view_price_retail`
- `view_price_wholesale`
- `view_price_cost`
- `view_price_zero`
- `edit_price`

### Users (5)
- `view_users`
- `create_user`
- `edit_user`
- `delete_user`
- `manage_roles`

---

## 🎭 Ролі за замовчуванням

### Admin
- **Всі дозволи** (19)
- **Всі типи цін** (5)

### Manager
- **Дозволи:** `view_battery_page`, `create_rack_set`, `export_rack_set`, `view_price_zero`
- **Типи цін:** `нульова`

### User
- **Дозволи:** Немає
- **Типи цін:** Немає

---

## 🛠️ API Endpoints

```
GET    /api/roles                 - Список ролей
GET    /api/roles/:name           - Деталі ролі
PUT    /api/roles/:name           - Оновити роль
DELETE /api/roles/:name           - Видалити роль

GET    /api/roles/:name/permissions      - Дозволи ролі
PUT    /api/roles/:name/permissions      - Оновити дозволи

GET    /api/roles/:name/price-types      - Типи цін ролі
PUT    /api/roles/:name/price-types      - Оновити типи цін

POST   /api/roles                 - Створити нову роль
```

---

## 💡 Приклад: Додавання нової ролі

### Через API

```javascript
// Створення ролі "Supervisor"
const response = await fetch('/api/roles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ADMIN_TOKEN'
  },
  body: JSON.stringify({
    name: 'supervisor',
    label: 'Наглядач',
    description: 'Проміжна роль між менеджером та адміном',
    permissions: [
      'view_rack_page',
      'view_battery_page',
      'create_rack_set',
      'view_users'
    ],
    price_types: ['нульова', 'загальна']
  })
});

const result = await response.json();
// { message: 'Role created successfully', role: {...} }
```

### Через БД

```sql
-- 1. Створити роль
INSERT INTO roles (name, label, description, is_active)
VALUES ('supervisor', 'Наглядач', 'Проміжна роль', 1);

-- 2. Додати дозволи
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'supervisor'
  AND p.name IN ('view_rack_page', 'view_battery_page', 'create_rack_set', 'view_users');

-- 3. Додати типи цін
INSERT INTO role_price_types (role_id, price_type)
SELECT r.id, pt
FROM roles r
CROSS JOIN (VALUES ('нульова'), ('загальна')) AS v(pt)
WHERE r.name = 'supervisor';
```

---

## 📊 Використання в коді

### Server

```javascript
import { 
  getUserPermissions, 
  hasPricePermission,
  getAllRoles,
  updateRolePermissions 
} from './helpers/roles.js';

// Отримати permissions користувача
const permissions = getUserPermissions(user);

// Перевірити дозвіл
if (hasPricePermission(user, 'загальна')) {
  // Показати загальну ціну
}

// Оновити дозволи ролі
await updateRolePermissions('manager', [
  'view_battery_page',
  'create_rack_set',
  'view_price_retail' // Додати роздрібну ціну
]);
```

### Client

```typescript
import { USER_ROLES, PERMISSIONS, hasRole, canAccessPage } from '@/core/constants/roles';

// Перевірка ролі
if (hasRole(user, [USER_ROLES.ADMIN])) {
  // Показати адмін-панель
}

// Перевірка доступу до сторінки
if (canAccessPage(user.role, 'rack')) {
  // Показати сторінку "Стелаж"
}
```

---

## 🔄 Міграція існуючих даних

Міграція 009 автоматично:
1. Створює 4 нові таблиці
2. Додає 3 ролі (admin, manager, user)
3. Додає 19 дозволів
4. Зв'язує дозволи з ролями
5. Додає типи цін

**Старі дані:**
- Користувачі з `role='admin'` → автоматично отримують всі дозволи
- Користувачі з `role='manager'` → отримують дозволи менеджера
- Користувачі з `role='user'` → без дозволів

---

## ✅ Переваги

### Гнучкість
- ✅ Нові ролі без змін коду
- ✅ Дозволи налаштовуються через API
- ✅ Можливість створити кастомну роль

### Безпека
- ✅ Всі зміни логуються в audit
- ✅ Тільки адмін може змінювати ролі
- ✅ Перевірка дозволів на сервері

### Підтримка
- ✅ Централізовані константи
- ✅ Документація в одному місці
- ✅ Легко знайти всі дозволи

---

## 📝 Наступні кроки

### Адмін-панель для управління ролями
- [ ] Сторінка `/admin/roles` - список ролей
- [ ] Форма створення нової ролі
- [ ] Редагування дозволів (checkboxes)
- [ ] Редагування типів цін (checkboxes)
- [ ] Видалення ролі (якщо не використовується)

### UI компоненти
- [ ] `<RoleSelector />` - Вибір ролі
- [ ] `<PermissionCheckboxes />` - Вибір дозволів
- [ ] `<PriceTypeCheckboxes />` - Вибір типів цін

---

## 🔗 Посилання

- [ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md) - Повна документація
- [ROLES_COMPLETE.md](./ROLES_COMPLETE.md) - Статус виконання
- [MODERNIZATION_PLAN.md](../../MODERNIZATION_PLAN.md) - Загальний план
