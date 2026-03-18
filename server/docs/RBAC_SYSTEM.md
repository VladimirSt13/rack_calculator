# 🔐 Система дозволів (RBAC) - Повний гайд

**Останнє оновлення:** 17 березня 2026  
**Статус:** ✅ Працює

---

## 📋 Огляд

Система RBAC (Role-Based Access Control) реалізована на **сервері** та **клієнті**.

### Архітектура

```
┌─────────────────────────────────────────────────────────┐
│                    КЛІЄНТ (React)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ProtectedRoute                                   │   │
│  │  - requiredPermissions={['USERS_READ']}          │   │
│  │  - requiredAllPermissions={['USERS_*']}          │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  useAuthStore                                     │   │
│  │  - hasPermission('USERS_CREATE')                 │   │
│  │  - hasAnyPermission(['USERS_READ', ...])         │   │
│  │  - hasAllPermissions(['USERS_READ', ...])        │   │
│  │  - isAdmin()                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↕ JWT Token (permissions)
┌─────────────────────────────────────────────────────────┐
│                   СЕРВЕР (Express)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Middleware                                       │   │
│  │  - authorizeRole('admin')                        │   │
│  │  - authorizePermission('users:create')           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  JWT Payload                                      │   │
│  │  - userId, email, roleId, roleName               │   │
│  │  - permissions: ['USERS_READ', 'USERS_CREATE']   │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  MongoDB                                          │   │
│  │  - Role: { name, permissions: [ObjectId] }       │   │
│  │  - Permission: { name, resource, action }        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎭 Ролі

| Роль      | Опис                    | Дозволи                                    |
| --------- | ----------------------- | ------------------------------------------ |
| **ADMIN** | Системний адміністратор | **Всі дозволи** (автоматично)              |
| MANAGER   | Менеджер                | PRICES_*, RACK_SETS_*, EXPORT_*, USERS_READ |
| USER      | Користувач              | RACK_SETS_*, PRICES_READ, USERS_READ       |

---

## 🎫 Дозволи

### Повна таблиця

| Код дозволу      | Ресурс     | Дія    | Опис                     |
| ---------------- | ---------- | ------ | ------------------------ |
| USERS_CREATE     | users      | create | Створення користувача    |
| USERS_READ       | users      | read   | Читання користувачів     |
| USERS_UPDATE     | users      | update | Оновлення користувача    |
| USERS_DELETE     | users      | delete | Видалення користувача    |
| ROLES_CREATE     | roles      | create | Створення ролі            |
| ROLES_READ       | roles      | read   | Читання ролей             |
| ROLES_UPDATE     | roles      | update | Оновлення ролі            |
| ROLES_DELETE     | roles      | delete | Видалення ролі            |
| PRICES_CREATE    | prices     | create | Створення прайсу          |
| PRICES_READ      | prices     | read   | Читання прайсів           |
| PRICES_UPDATE    | prices     | update | Оновлення прайсу          |
| PRICES_DELETE    | prices     | delete | Видалення прайсу          |
| RACK_SETS_CREATE | rack_sets  | create | Створення комплекту        |
| RACK_SETS_READ   | rack_sets  | read   | Читання комплектів         |
| RACK_SETS_UPDATE | rack_sets  | update | Оновлення комплекту        |
| RACK_SETS_DELETE | rack_sets  | delete | Видалення комплекту        |
| EXPORT_CREATE    | export     | create | Створення експорту         |
| EXPORT_READ      | export     | read   | Читання експорту           |
| AUDIT_READ       | audit      | read   | Читання журналу аудиту     |
| **ALL**          | all        | all    | Універсальний дозвіл       |

---

## 🛡️ Серверна перевірка

### Middleware

```typescript
import { authenticate, authorizeRole, authorizePermission } from '@/common/middleware/auth.middleware';

// Перевірка ролі
router.delete('/users/:id',
  authenticate,
  authorizeRole('admin'),
  usersController.deleteUser
);

// Перевірка дозволу
router.post('/users',
  authenticate,
  authorizePermission('users:create'),
  usersController.createUser
);

// Кілька ролей
router.get('/data',
  authenticate,
  authorizeRole('admin', 'manager'),
  controller.getData
);
```

### Логіка middleware

```typescript
// authorizeRole
export const authorizeRole = (...roles: string[]) => {
  return (req, res, next) => {
    if (!req.user) {
      ApiResponder.unauthorized(res, 'Authentication required');
      return;
    }

    // Адмін проходить будь-яку перевірку
    if (req.user.roleName === 'admin') {
      next();
      return;
    }

    if (!roles.includes(req.user.roleName)) {
      ApiResponder.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

// authorizePermission
export const authorizePermission = (permission: string) => {
  return (req, res, next) => {
    if (!req.user) {
      ApiResponder.unauthorized(res, 'Authentication required');
      return;
    }

    // Адмін проходить будь-яку перевірку
    if (req.user.roleName === 'admin') {
      next();
      return;
    }

    const permissions = req.user.permissions || [];
    if (!permissions.includes(permission) && !permissions.includes('all')) {
      ApiResponder.forbidden(res, `Permission '${permission}' required`);
      return;
    }

    next();
  };
};
```

---

## 💻 Клієнтська перевірка

### useAuthStore хуки

```typescript
import { useAuthStore } from '@/features/auth/authStore';

const {
  user,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin
} = useAuthStore();

// Перевірка одного дозволу
if (hasPermission('USERS_CREATE')) {
  // ✅ Користувач може створювати користувачів
}

// Перевірка хоча б одного дозволу
if (hasAnyPermission(['PRICES_UPDATE', 'PRICES_CREATE'])) {
  // ✅ Користувач може оновлювати АБО створювати ціни
}

// Перевірка всіх дозволів
if (hasAllPermissions(['USERS_READ', 'USERS_UPDATE'])) {
  // ✅ Користувач може читати І оновлювати користувачів
}

// Перевірка чи адмін
if (isAdmin()) {
  // ✅ Адмін має всі дозволи автоматично
}
```

### ProtectedRoute

```typescript
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';

// Замість allowedRoles використовуй requiredPermissions
<ProtectedRoute requiredPermissions={['USERS_READ', 'USERS_UPDATE']}>
  <UserManagement />
</ProtectedRoute>

// Вимагати всі дозволи
<ProtectedRoute requiredAllPermissions={['USERS_READ', 'USERS_UPDATE', 'USERS_DELETE']}>
  <UserManagement />
</ProtectedRoute>

// Для адмін панелей
<ProtectedRoute requiredPermissions={['ROLES_READ', 'USERS_READ']}>
  <AdminDashboard />
</ProtectedRoute>
```

### Умовний рендеринг

```typescript
import { useAuthStore } from '@/features/auth/authStore';
import { Button } from '@/shared/components/Button';

const UserActions: React.FC<{ userId: string }> = ({ userId }) => {
  const { hasPermission } = useAuthStore();

  return (
    <div className="flex gap-2">
      {hasPermission('USERS_READ') && (
        <Button variant="outline" onClick={() => viewUser(userId)}>
          Перегляд
        </Button>
      )}

      {hasPermission('USERS_UPDATE') && (
        <Button onClick={() => editUser(userId)}>
          Редагувати
        </Button>
      )}

      {hasPermission('USERS_DELETE') && (
        <Button variant="destructive" onClick={() => deleteUser(userId)}>
          Видалити
        </Button>
      )}
    </div>
  );
};
```

---

## 🔄 Потік авторизації

```
1. Користувач логіниться → POST /api/auth/login
2. Сервер перевіряє credentials
3. Сервер знаходить користувача з роллю та дозволами
4. Сервер генерує JWT токен з:
   - userId
   - email
   - roleId (ObjectId)
   - roleName (admin/manager/user)
   - permissions (масив назв дозволів)
5. Клієнт зберігає токен в localStorage
6. Кожен запит йде з Authorization: Bearer <token>
7. Сервер перевіряє токен (authenticate middleware)
8. Сервер перевіряє роль/дозвіл (authorizeRole/Permission)
9. Якщо адмін — пропускає одразу
10. Якщо ні — перевіряє роль/дозвіл з JWT
```

---

## 📦 JWT Token Payload

```typescript
interface AuthJwtPayload {
  userId: string;
  email: string;
  roleId?: string;        // ObjectId ролі
  roleName?: string;      // Назва ролі (admin, manager, user)
  permissions?: string[]; // Масив дозволів ['USERS_READ', 'PRICES_UPDATE', ...]
}
```

**Приклад токену:**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "admin@accu-energo.com.ua",
  "roleId": "507f1f77bcf86cd799439012",
  "roleName": "admin",
  "permissions": [
    "USERS_CREATE",
    "USERS_READ",
    "USERS_UPDATE",
    "USERS_DELETE",
    "ROLES_CREATE",
    "ROLES_READ",
    "ROLES_UPDATE",
    "ROLES_DELETE",
    "PRICES_CREATE",
    "PRICES_READ",
    "PRICES_UPDATE",
    "PRICES_DELETE",
    "RACK_SETS_CREATE",
    "RACK_SETS_READ",
    "RACK_SETS_UPDATE",
    "RACK_SETS_DELETE",
    "EXPORT_CREATE",
    "EXPORT_READ",
    "AUDIT_READ",
    "ALL"
  ],
  "iat": 1710691200,
  "exp": 1710692100
}
```

---

## 🎯 Приклади використання

### Приклад 1: Створення користувача (сервер)

```typescript
// users.routes.ts
import { authenticate, authorizePermission } from '@/common/middleware/auth.middleware';

usersRoutes.post(
  '/',
  authenticate,
  authorizePermission('users:create'),
  validateRequest(CreateUserDto),
  usersController.createUser
);
```

### Приклад 2: Видалення користувача (клієнт)

```typescript
// UserManagement.tsx
import { useAuthStore } from '@/features/auth/authStore';

const UsersTable: React.FC = () => {
  const { hasPermission } = useAuthStore();

  return (
    <Table>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.roleName}</TableCell>
            <TableCell>
              {hasPermission('USERS_UPDATE') && (
                <IconButton onClick={() => editUser(user)}>
                  <Edit />
                </IconButton>
              )}
              {hasPermission('USERS_DELETE') && (
                <IconButton variant="destructive" onClick={() => deleteUser(user)}>
                  <Delete />
                </IconButton>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

### Приклад 2: Меню адміна

```typescript
// AdminSidebar.tsx
import { useAuthStore } from '@/features/auth/authStore';

const AdminSidebar: React.FC = () => {
  const { hasPermission } = useAuthStore();

  return (
    <nav>
      {hasPermission('USERS_READ') && (
        <Link to="/admin/users">
          <Users />
          <span>Користувачі</span>
        </Link>
      )}
      {hasPermission('ROLES_READ') && (
        <Link to="/admin/roles">
          <Shield />
          <span>Ролі</span>
        </Link>
      )}
      {hasPermission('PRICES_READ') && (
        <Link to="/admin/prices">
          <DollarSign />
          <span>Ціни</span>
        </Link>
      )}
      {hasPermission('AUDIT_READ') && (
        <Link to="/admin/audit">
          <FileText />
          <span>Аудит</span>
        </Link>
      )}
    </nav>
  );
};
```

---

## ⚠️ Важливі зауваження

### 1. Адмін завжди проходить

І на сервері, і на клієнті адмін має **автоматичний доступ** до всього.

```typescript
// Сервер
if (req.user.roleName === 'admin') {
  next(); // ✅ Пропускає
  return;
}

// Клієнт
if (isAdmin()) {
  return true; // ✅ Всі дозволи доступні
}
```

### 2. Дозвіл `ALL`

Дозвіл `ALL` (resource: `all`, action: `all`) надає повний доступ як `admin`.

```typescript
if (permissions.includes('all') || permissions.includes('ALL')) {
  next(); // ✅ Пропускає
  return;
}
```

### 3. Оновлення дозволів

Якщо змінили дозволи користувача на сервері — користувач повинен **перезалогінитися** для оновлення JWT токену.

### 4. Не перевіряй ролі на клієнті

❌ **Погано:**
```typescript
if (user?.role === 'admin') {
  // ...
}
```

✅ **Добре:**
```typescript
if (hasPermission('USERS_CREATE')) {
  // ...
}

// Або
if (isAdmin()) {
  // ...
}
```

---

## 📚 Пов'язана документація

- [ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md) — Серверна RBAC система
- [client/docs/RBAC_PERMISSIONS.md](../client/docs/RBAC_PERMISSIONS.md) — Клієнтська RBAC система
- [plan-server.md](../plan-server.md) — План розробки сервера

---

**Статус:** ✅ Працює  
**Останнє оновлення:** 17 березня 2026
