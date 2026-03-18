# 🔐 Система дозволів (RBAC) на клієнті

**Останнє оновлення:** 17 березня 2026  
**Статус:** ✅ Працює

---

## 📋 Огляд

Клієнт використовує **RBAC** (Role-Based Access Control) систему з перевіркою **дозволів** (permissions), а не ролей.

### Основні принципи

1. **Не перевіряй ролі** — перевіряй дозволи
2. **Адмін має всі дозволи автоматично**
3. **Дозволи приходять з сервера в JWT токені**

---

## 🎯 Як використовувати

### 1. Отримання даних користувача

```typescript
import { useAuthStore } from '@/features/auth/authStore';

const { user, isAdmin, hasPermission, hasAnyPermission } = useAuthStore();

// Дані користувача
user?.id           // ID користувача
user?.email        // Email
user?.roleName     // Назва ролі (admin, manager, user)
user?.permissions  // Масив дозволів ['USERS_READ', 'PRICES_UPDATE', ...]
```

### 2. Перевірка дозволів

```typescript
const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin } = useAuthStore();

// Перевірка одного дозволу
if (hasPermission('USERS_CREATE')) {
  // Користувач може створювати користувачів
}

// Перевірка хоча б одного дозволу
if (hasAnyPermission(['PRICES_UPDATE', 'PRICES_CREATE'])) {
  // Користувач може оновлювати АБО створювати ціни
}

// Перевірка всіх дозволів
if (hasAllPermissions(['USERS_READ', 'USERS_UPDATE'])) {
  // Користувач може читати І оновлювати користувачів
}

// Перевірка чи адмін
if (isAdmin()) {
  // Адмін має всі дозволи автоматично
}
```

### 3. ProtectedRoute з дозволами

```typescript
// Замість allowedRoles використовуй requiredPermissions
<ProtectedRoute requiredPermissions={['USERS_READ', 'USERS_UPDATE']}>
  <UserManagement />
</ProtectedRoute>

// Або вимагати всі дозволи
<ProtectedRoute requiredAllPermissions={['USERS_READ', 'USERS_UPDATE', 'USERS_DELETE']}>
  <UserManagement />
</ProtectedRoute>

// Адмін пройде будь-яку перевірку автоматично
```

---

## 📦 Структура User

```typescript
interface User {
  id: string;
  email: string;
  roleName: string;      // 'admin' | 'manager' | 'user'
  permissions: string[]; // ['USERS_READ', 'PRICES_UPDATE', ...]
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}
```

---

## 🎫 Дозволи (Permissions)

### Список дозволів

| Дозвіл           | Ресурс     | Дія    | Опис                  |
| ---------------- | ---------- | ------ | --------------------- |
| USERS_CREATE     | users      | create | Створення користувача |
| USERS_READ       | users      | read   | Читання користувачів  |
| USERS_UPDATE     | users      | update | Оновлення користувача |
| USERS_DELETE     | users      | delete | Видалення користувача |
| ROLES_CREATE     | roles      | create | Створення ролі        |
| ROLES_READ       | roles      | read   | Читання ролей         |
| ROLES_UPDATE     | roles      | update | Оновлення ролі        |
| ROLES_DELETE     | roles      | delete | Видалення ролі        |
| PRICES_CREATE    | prices     | create | Створення прайсу      |
| PRICES_READ      | prices     | read   | Читання прайсів       |
| PRICES_UPDATE    | prices     | update | Оновлення прайсу      |
| PRICES_DELETE    | prices     | delete | Видалення прайсу      |
| RACK_SETS_CREATE | rack_sets  | create | Створення комплекту   |
| RACK_SETS_READ   | rack_sets  | read   | Читання комплектів    |
| RACK_SETS_UPDATE | rack_sets  | update | Оновлення комплекту   |
| RACK_SETS_DELETE | rack_sets  | delete | Видалення комплекту   |
| EXPORT_CREATE    | export     | create | Створення експорту    |
| EXPORT_READ      | export     | read   | Читання експорту      |
| AUDIT_READ       | audit      | read   | Читання журналу       |

### Дозволи за замовчуванням

**ADMIN** (автоматично має всі):
- Всі дозволи з таблиці вище

**MANAGER**:
- `PRICES_*`, `RACK_SETS_*`, `EXPORT_*`, `USERS_READ`

**USER**:
- `RACK_SETS_READ`, `RACK_SETS_CREATE`, `PRICES_READ`, `USERS_READ`

---

## 🛡️ Приклади використання

### Приклад 1: Кнопка тільки для адміна

```typescript
import { useAuthStore } from '@/features/auth/authStore';
import { Button } from '@/shared/components/Button';

const DeleteUserButton: React.FC<{ userId: string }> = ({ userId }) => {
  const { hasPermission } = useAuthStore();

  if (!hasPermission('USERS_DELETE')) {
    return null;
  }

  return (
    <Button variant="destructive" onClick={() => deleteUser(userId)}>
      Видалити
    </Button>
  );
};
```

### Приклад 2: Меню з фільтрацією

```typescript
import { useAuthStore } from '@/features/auth/authStore';

const AdminMenu: React.FC = () => {
  const { hasPermission } = useAuthStore();

  return (
    <nav>
      {hasPermission('USERS_READ') && (
        <Link to="/admin/users">Користувачі</Link>
      )}
      {hasPermission('ROLES_READ') && (
        <Link to="/admin/roles">Ролі</Link>
      )}
      {hasPermission('PRICES_READ') && (
        <Link to="/admin/prices">Ціни</Link>
      )}
      {hasPermission('AUDIT_READ') && (
        <Link to="/admin/audit">Аудит</Link>
      )}
    </nav>
  );
};
```

### Приклад 3: ProtectedRoute для сторінки

```typescript
// App.tsx
<Route
  path="/admin/users"
  element={
    <ProtectedRoute requiredPermissions={['USERS_READ', 'USERS_UPDATE']}>
      <UserManagement />
    </ProtectedRoute>
  }
/>
```

### Приклад 4: Умовний рендеринг в таблиці

```typescript
import { useAuthStore } from '@/features/auth/authStore';

const UsersTable: React.FC = () => {
  const { hasPermission } = useAuthStore();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Роль</TableHead>
          <TableHead>Дії</TableHead>
        </TableRow>
      </TableHeader>
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

---

## ⚠️ Важливі зауваження

### 1. Не перевіряй ролі напряму

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

### 2. Адмін завжди проходить

`isAdmin()` перевіряє роль і повертає `true` для адміна. В цьому випадку всі перевірки дозволів також повертають `true`.

### 3. Дозволи приходять з сервера

Не створюй дозволи на клієнті. Вони приходять з JWT токеном після логіну.

### 4. Оновлення дозволів

Якщо змінили дозволи користувача на сервері — користувач повинен перезалогінитися.

---

## 🔄 Міграція зі старих ролей

### Було (старий код)

```typescript
// ❌ Застарілий код
if (user?.role === 'admin') {
  return <AdminPanel />;
}

<ProtectedRoute allowedRoles={['admin', 'manager']}>
  <SomePage />
</ProtectedRoute>
```

### Стало (новий код)

```typescript
// ✅ Новий код
if (hasPermission('ADMIN_ACCESS')) {
  return <AdminPanel />;
}

<ProtectedRoute requiredPermissions={['USERS_READ', 'PRICES_READ']}>
  <SomePage />
</ProtectedRoute>
```

---

## 📚 Пов'язана документація

- [ROLES_AND_PERMISSIONS.md](../../server/docs/ROLES_AND_PERMISSIONS.md) — Серверна RBAC система
- [plan-server.md](../../plan-server.md) — План розробки сервера
- [plan-client.md](../../plan-client.md) — План розробки клієнта

---

**Статус:** ✅ Працює  
**Останнє оновлення:** 17 березня 2026
