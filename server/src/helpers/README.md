# Helpers

Допоміжні модулі для спільної логіки.

## roles.js

Управління ролями та permissions користувачів.

### Використання

```javascript
import { 
  USER_ROLES, 
  PRICE_TYPES, 
  getUserPermissions,
  hasPricePermission,
  hasRole 
} from './roles.js';

// Перевірка ролі
if (hasRole(user, USER_ROLES.ADMIN)) {
  // Адмінські дії
}

// Перевірка доступу до типу ціни
if (hasPricePermission(user, PRICE_TYPES.RETAIL)) {
  // Показати роздрібну ціну
}

// Отримати permissions
const permissions = getUserPermissions(user);
console.log(permissions.price_types); // ['без_ізоляторів', 'загальна']
```

### API

#### `USER_ROLES`

Константи ролей:
- `ADMIN` - 'admin'
- `MANAGER` - 'manager'
- `OTHER` - 'other'

#### `PRICE_TYPES`

Константи типів цін:
- `NO_ISOLATORS` - 'без_ізоляторів'
- `RETAIL` - 'загальна'
- `ZERO` - 'нульова'
- `COST` - 'собівартість'
- `WHOLESALE` - 'оптова'

#### `ROLE_PERMISSIONS`

Permissions за замовчуванням для кожної ролі.

#### `getUserPermissions(user)`

Отримати permissions користувача.

**Параметри:**
- `user` - Об'єкт користувача з полями `role` та `permissions`

**Повертає:**
- Object - Permissions користувача

#### `hasPricePermission(user, priceType)`

Перевірити чи має користувач доступ до типу ціни.

**Параметри:**
- `user` - Об'єкт користувача
- `priceType` - Тип ціни (з `PRICE_TYPES`)

**Повертає:**
- boolean

#### `hasRole(user, ...roles)`

Перевірити чи має користувач одну з вказаних ролей.

**Параметри:**
- `user` - Об'єкт користувача
- `...roles` - Ролі для перевірки

**Повертає:**
- boolean

#### `filterPricesByPermissions(priceData, permissions)`

Фільтрувати ціни за permissions користувача.

**Параметри:**
- `priceData` - Дані прайсу
- `permissions` - Permissions користувача

**Повертає:**
- Object - Відфільтрований прайс

---

## audit.js

Логування дій користувачів в audit_log.

### Використання

```javascript
import { 
  logAudit, 
  AUDIT_ACTIONS, 
  ENTITY_TYPES,
  logPriceChange 
} from './audit.js';

// Записати в аудит
await logAudit({
  userId: 1,
  action: AUDIT_ACTIONS.CREATE,
  entityType: ENTITY_TYPES.RACK_SET,
  entityId: 5,
  newValue: { name: 'Новий комплект' }
});

// Спеціалізований helper для змін прайсу
await logPriceChange(userId, oldPriceData, newPriceData);
```

### API

#### `AUDIT_ACTIONS`

Константи дій:
- `CREATE` - 'CREATE'
- `UPDATE` - 'UPDATE'
- `DELETE` - 'DELETE'
- `LOGIN` - 'LOGIN'
- `LOGOUT` - 'LOGOUT'
- `PASSWORD_CHANGE` - 'PASSWORD_CHANGE'
- `PERMISSION_CHANGE` - 'PERMISSION_CHANGE'
- `PRICE_UPDATE` - 'PRICE_UPDATE'
- `RACK_SET_CREATE` - 'RACK_SET_CREATE'
- `RACK_SET_UPDATE` - 'RACK_SET_UPDATE'
- `RACK_SET_DELETE` - 'RACK_SET_DELETE'

#### `ENTITY_TYPES`

Константи типів сутностей:
- `USER` - 'user'
- `PRICE` - 'price'
- `RACK_SET` - 'rack_set'
- `RACK_SET_REVISION` - 'rack_set_revision'
- `CALCULATION` - 'calculation'

#### `logAudit(options)`

Записати запис в audit log.

**Параметри:**
- `options.userId` (number) - ID користувача
- `options.action` (string) - Дія (з `AUDIT_ACTIONS`)
- `options.entityType` (string) - Тип сутності (з `ENTITY_TYPES`)
- `options.entityId` (number, optional) - ID сутності
- `options.oldValue` (Object, optional) - Старі значення
- `options.newValue` (Object, optional) - Нові значення
- `options.ipAddress` (string, optional) - IP адреса
- `options.userAgent` (string, optional) - User agent

#### `getAuditHistory(entityType, entityId, limit = 50)`

Отримати історію аудиту для сутності.

**Параметри:**
- `entityType` - Тип сутності
- `entityId` - ID сутності
- `limit` - Ліміт записів

**Повертає:**
- Array - Масив записів аудиту

#### `getRecentAuditEntries(limit = 100)`

Отримати останні записи аудиту.

**Параметри:**
- `limit` - Ліміт записів

**Повертає:**
- Array - Масив записів аудиту

#### `logPriceChange(userId, oldPrice, newPrice)`

Helper для логування змін прайсу.

**Параметри:**
- `userId` - ID користувача
- `oldPrice` - Старі дані прайсу
- `newPrice` - Нові дані прайсу

#### `logUserChange(userId, action, userEmail, oldValue, newValue)`

Helper для логування змін користувача.

**Параметри:**
- `userId` - ID користувача
- `action` - Дія (з `AUDIT_ACTIONS`)
- `userEmail` - Email користувача
- `oldValue` - Старі значення
- `newValue` - Нові значення
