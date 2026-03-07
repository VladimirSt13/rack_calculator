# 🎭 Ролі та дозволи (Roles & Permissions)

## Огляд

Система ролей та дозволів зберігається в базі даних, що дозволяє адмінам:
- ✅ Створювати нові ролі
- ✅ Налаштовувати дозволи для кожної ролі
- ✅ Керувати доступом до типів цін

---

## Архітектура

### База даних

```
roles
├── id
├── name (admin, manager, user)
├── label (Адміністратор, Менеджер...)
├── description
├── is_default
├── is_active
└── created_at

permissions
├── id
├── name (view_rack_page, edit_price...)
├── label (Перегляд сторінки "Стелаж"...)
└── category (pages, actions, prices, users)

role_permissions (зв'язок many-to-many)
├── role_id
└── permission_id

role_price_types
├── role_id
└── price_type (нульова, загальна...)
```

---

## Константи

### Ролі
```javascript
USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
}
```

### Дозволи
```javascript
PERMISSIONS = {
  // Сторінки
  VIEW_RACK_PAGE: 'view_rack_page',
  VIEW_BATTERY_PAGE: 'view_battery_page',
  VIEW_ADMIN_PAGE: 'view_admin_page',
  
  // Дії
  CREATE_RACK_SET: 'create_rack_set',
  EDIT_RACK_SET: 'edit_rack_set',
  DELETE_RACK_SET: 'delete_rack_set',
  EXPORT_RACK_SET: 'export_rack_set',
  
  // Ціни
  VIEW_PRICE_RETAIL: 'view_price_retail',
  VIEW_PRICE_WHOLESALE: 'view_price_wholesale',
  VIEW_PRICE_COST: 'view_price_cost',
  VIEW_PRICE_ZERO: 'view_price_zero',
  EDIT_PRICE: 'edit_price',
  
  // Користувачі
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  MANAGE_ROLES: 'manage_roles',
}
```

### Типи цін
```javascript
PRICE_TYPES = {
  NO_ISOLATORS: 'без_ізоляторів',
  RETAIL: 'загальна',
  ZERO: 'нульова',
  COST: 'собівартість',
  WHOLESALE: 'оптова',
}
```

---

## API Endpoints

### GET /api/roles
Отримати всі ролі з дозволами

**Auth:** Admin only

**Response:**
```json
{
  "roles": [
    {
      "id": 1,
      "name": "admin",
      "label": "Адміністратор",
      "description": "Повний доступ...",
      "is_default": true,
      "is_active": true,
      "permissions": [
        { "name": "view_rack_page", "label": "...", "category": "pages" }
      ]
    }
  ]
}
```

---

### GET /api/roles/:name/permissions
Отримати дозволи конкретної ролі

**Auth:** Admin only

**Response:**
```json
{
  "permissions": [
    { "name": "view_rack_page", "label": "...", "category": "pages" }
  ]
}
```

---

### PUT /api/roles/:name/permissions
Оновити дозволи ролі

**Auth:** Admin only

**Request:**
```json
{
  "permissions": [
    "view_rack_page",
    "view_battery_page",
    "create_rack_set"
  ]
}
```

**Response:**
```json
{
  "message": "Permissions updated successfully"
}
```

---

### GET /api/roles/:name/price-types
Отримати типи цін ролі

**Auth:** Admin only

**Response:**
```json
{
  "price_types": ["нульова", "загальна"]
}
```

---

### PUT /api/roles/:name/price-types
Оновити типи цін ролі

**Auth:** Admin only

**Request:**
```json
{
  "price_types": ["нульова", "загальна", "оптова"]
}
```

**Response:**
```json
{
  "message": "Price types updated successfully"
}
```

---

### POST /api/roles
Створити нову роль

**Auth:** Admin only

**Request:**
```json
{
  "name": "supervisor",
  "label": "Наглядач",
  "description": "Між менеджером та адміном",
  "permissions": ["view_rack_page", "view_battery_page"],
  "price_types": ["нульова", "загальна"]
}
```

**Response:**
```json
{
  "message": "Role created successfully",
  "role": {
    "id": 4,
    "name": "supervisor",
    "label": "Наглядач",
    "description": "Між менеджером та адміном"
  }
}
```

---

## Використання в коді

### Перевірка дозволів

```javascript
import { hasPermission, getUserPermissions } from './helpers/roles.js';

// Отримати permissions користувача
const permissions = getUserPermissions(user);

// Перевірити дозвіл
if (hasPermission(user, 'view_rack_page')) {
  // Дозволити доступ
}

// Перевірити тип ціни
if (hasPricePermission(user, PRICE_TYPES.RETAIL)) {
  // Показати роздрібну ціну
}
```

### Фільтрація цін

```javascript
import { filterPricesByPermissions } from './helpers/roles.js';

const filteredPrices = filterPricesByPermissions(priceData, userPermissions);
```

---

## Додавання нової ролі

### Через API

```bash
curl -X POST http://localhost:3001/api/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "supervisor",
    "label": "Наглядач",
    "description": "Проміжна роль",
    "permissions": ["view_rack_page", "view_battery_page"],
    "price_types": ["нульова", "загальна"]
  }'
```

### Через БД

```sql
-- Додати роль
INSERT INTO roles (name, label, description, is_default, is_active)
VALUES ('supervisor', 'Наглядач', 'Проміжна роль', 0, 1);

-- Додати дозволи
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'supervisor'
  AND p.name IN ('view_rack_page', 'view_battery_page');

-- Додати типи цін
INSERT INTO role_price_types (role_id, price_type)
SELECT r.id, pt
FROM roles r, (VALUES ('нульова'), ('загальна')) AS v(pt)
WHERE r.name = 'supervisor';
```

---

## Helper функції

### `getAllRoles()`
Отримати всі активні ролі з БД

### `getRolePermissionsFromDB(roleName)`
Отримати дозволи конкретної ролі

### `updateRolePermissions(roleName, permissions)`
Оновити дозволи ролі

### `updateRolePriceTypes(roleName, priceTypes)`
Оновити типи цін ролі

### `getUserPermissions(user)`
Отримати permissions користувача (з БД або з кешу)

### `hasPricePermission(user, priceType)`
Перевірити доступ до типу ціни

---

## Переваги

✅ **Гнучкість** - нові ролі без змін коду  
✅ **БД зберігання** - дозволи в БД  
✅ **Адмін UI** - можна керувати через адмін-панель  
✅ **Аудит** - всі зміни логуються  
✅ **Масштабованість** - легко додати нові дозволи

---

## Файли

- [`server/src/core/constants/roles.js`](../server/src/core/constants/roles.js) - Константи
- [`server/src/helpers/roles.js`](../server/src/helpers/roles.js) - Helper функції
- [`server/src/routes/roles.js`](../server/src/routes/roles.js) - API routes
- [`server/src/db/migrations/009_create_roles_permissions.js`](../server/src/db/migrations/009_create_roles_permissions.js) - Міграція
