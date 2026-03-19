# 📡 API Endpoints Documentation

**Дата оновлення:** 18 березня 2026  
**Версія:** 1.0  
**Статус:** Актуально

---

## 📋 Зміст

1. [Auth Module](#auth-module)
2. [Users Module](#users-module)
3. [Roles Module](#roles-module)
4. [Prices Module](#prices-module)
5. [Rack Configurations Module](#rack-configurations-module)
6. [Rack Sets Module](#rack-sets-module)
7. [Calculations Module](#calculations-module)
8. [Battery Module](#battery-module)
9. [Export Module](#export-module)
10. [Audit Module](#audit-module)

---

## Auth Module

### POST `/api/auth/login`

**Опис:** Login user  
**Доступ:** Public

#### Request Body (LoginDto)

```typescript
{
  email: string; // Email користувача
  password: string; // Пароль (мін. 8 символів)
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    user: {
      id: number;
      email: string;
      nickname: string;
      roleName: string;
      isVerified: boolean;
    }
    accessToken: string; // JWT токен
    refreshToken: string; // Refresh токен
  }
}
```

---

### POST `/api/auth/register`

**Опис:** Register new user  
**Доступ:** Public

#### Request Body (RegisterDto)

```typescript
{
  email: string;      // Email
  password: string;   // Пароль (мін. 8 символів, 1 буква, 1 цифра)
  nickname?: string;  // Нікнейм (опціонально)
}
```

#### Response (201 Created)

```typescript
{
  success: true;
  data: {
    user: {
      id: number;
      email: string;
      nickname: string | null;
      roleName: string;
      isVerified: boolean;
    }
    message: string; // "Verification email sent"
  }
}
```

---

### POST `/api/auth/refresh`

**Опис:** Refresh access token  
**Доступ:** Public

#### Request Body (RefreshTokenDto)

```typescript
{
  refreshToken: string; // Refresh токен
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    accessToken: string; // Новий JWT токен
    refreshToken: string; // Новий refresh токен
  }
}
```

---

### POST `/api/auth/forgot-password`

**Опис:** Request password reset  
**Доступ:** Public

#### Request Body (ForgotPasswordDto)

```typescript
{
  email: string; // Email користувача
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Reset email sent"
  }
}
```

---

### POST `/api/auth/reset-password`

**Опис:** Reset password  
**Доступ:** Public

#### Request Body (ResetPasswordDto)

```typescript
{
  token: string; // Токен з email
  password: string; // Новий пароль
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Password reset successfully"
  }
}
```

---

### POST `/api/auth/verify-email`

**Опис:** Verify email address  
**Доступ:** Public

#### Request Body (VerifyEmailDto)

```typescript
{
  token: string; // Токен з email
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Email verified successfully"
  }
}
```

---

### POST `/api/auth/logout`

**Опис:** Logout user  
**Доступ:** Private (Authenticated)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Logged out successfully"
  }
}
```

---

### POST `/api/auth/logout-all`

**Опис:** Logout from all devices  
**Доступ:** Private (Authenticated)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Logged out from all devices"
  }
}
```

---

## Users Module

### GET `/api/users/me`

**Опис:** Get current user profile  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    email: string;
    nickname: string | null;
    roleName: string;
    isVerified: boolean;
    priceTypes?: number[];  // Доступні типи цін
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### PATCH `/api/users/me`

**Опис:** Update current user profile  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (UpdateUserDto)

```typescript
{
  nickname?: string;        // Новий нікнейм
  priceTypes?: number[];    // Доступні типи цін
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    email: string;
    nickname: string | null;
    roleName: string;
    priceTypes?: number[];
    updatedAt: string;
  };
}
```

---

### GET `/api/users`

**Опис:** Get all users with pagination  
**Доступ:** Private (Admin/Manager)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Query Parameters

```
page?: number       // Сторінка (default: 1)
limit?: number      // Ліміт (default: 10)
search?: string     // Пошук по email/nickname
role?: string       // Фільтр по ролі
sortBy?: string     // Сортування (default: createdAt)
order?: asc|desc    // Порядок сортування
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    users: Array<{
      id: number;
      email: string;
      nickname: string | null;
      roleName: string;
      isVerified: boolean;
      priceTypes?: number[];
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }
}
```

---

### GET `/api/users/stats`

**Опис:** Get users statistics  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    usersByRole: {
      admin: number;
      manager: number;
      user: number;
    }
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
  }
}
```

---

### GET `/api/users/:id`

**Опис:** Get user by ID  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    email: string;
    nickname: string | null;
    roleName: string;
    isVerified: boolean;
    priceTypes?: number[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}
```

---

### POST `/api/users`

**Опис:** Create new user  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (CreateUserDto)

```typescript
{
  email: string;           // Email
  password: string;        // Пароль
  nickname?: string;       // Нікнейм
  roleId: number;          // ID ролі
  priceTypes?: number[];   // Доступні типи цін
}
```

#### Response (201 Created)

```typescript
{
  success: true;
  data: {
    id: number;
    email: string;
    nickname: string | null;
    roleName: string;
    isVerified: boolean;
    priceTypes?: number[];
    createdAt: string;
  };
}
```

---

### PATCH `/api/users/:id`

**Опис:** Update user  
**Доступ:** Private (Admin or self)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (UpdateUserDto)

```typescript
{
  nickname?: string;       // Новий нікнейм
  roleId?: number;         // Нова роль (тільки адмін)
  priceTypes?: number[];   // Нові типи цін
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    email: string;
    nickname: string | null;
    roleName: string;
    priceTypes?: number[];
    updatedAt: string;
  };
}
```

---

### POST `/api/users/:id/change-password`

**Опис:** Change user password  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (ChangePasswordDto)

```typescript
{
  currentPassword: string; // Поточний пароль
  newPassword: string; // Новий пароль
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Password changed successfully"
  }
}
```

---

### DELETE `/api/users/:id`

**Опис:** Delete user (soft delete)  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "User deleted successfully"
  }
}
```

---

### POST `/api/users/:id/restore`

**Опис:** Restore deleted user  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "User restored successfully"
  }
}
```

---

## Roles Module

### GET `/api/roles`

**Опис:** Get all roles  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: [
    {
      id: number;
      name: string;  // "ADMIN" | "MANAGER" | "USER"
      description: string | null;
      permissions: Array<{
        id: number;
        resource: string;
        action: string;
      }>;
      createdAt: string;
      updatedAt: string;
    }
  ];
}
```

---

### GET `/api/roles/:id`

**Опис:** Get role by ID  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    description: string | null;
    permissions: Array<{
      id: number;
      resource: string;
      action: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }
}
```

---

### POST `/api/roles`

**Опис:** Create new role  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (CreateRoleDto)

```typescript
{
  name: string;           // Назва ролі
  description?: string;   // Опис
  permissions?: number[]; // IDs дозволів
}
```

#### Response (201 Created)

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    description: string | null;
    permissions: Array<{
      id: number;
      resource: string;
      action: string;
    }>;
    createdAt: string;
  }
}
```

---

### PATCH `/api/roles/:id`

**Опис:** Update role  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (UpdateRoleDto)

```typescript
{
  name?: string;          // Нова назва
  description?: string;   // Новий опис
  permissions?: number[]; // Нові дозволи
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    description: string | null;
    permissions: Array<{
      id: number;
      resource: string;
      action: string;
    }>;
    updatedAt: string;
  }
}
```

---

### DELETE `/api/roles/:id`

**Опис:** Delete role  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Role deleted successfully"
  }
}
```

---

### POST `/api/roles/:id/permissions`

**Опис:** Assign permissions to role  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (AssignPermissionsDto)

```typescript
{
  permissions: number[];  // IDs дозволів
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    permissions: Array<{
      id: number;
      resource: string;
      action: string;
    }>;
    updatedAt: string;
  }
}
```

---

### POST `/api/roles/:id/permissions/:permissionId`

**Опис:** Add permission to role  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Permission added successfully"
  }
}
```

---

### DELETE `/api/roles/:id/permissions/:permissionId`

**Опис:** Remove permission from role  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Permission removed successfully"
  }
}
```

---

### GET `/api/permissions`

**Опис:** Get all permissions  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: [
    {
      id: number;
      resource: string;  // "users" | "roles" | "prices" | "rack_sets" | "export" | "audit" | "all"
      action: string;    // "create" | "read" | "update" | "delete" | "all"
      description: string | null;
      createdAt: string;
    }
  ];
}
```

---

### GET `/api/permissions/:id`

**Опис:** Get permission by ID  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    resource: string;
    action: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }
}
```

---

### POST `/api/permissions`

**Опис:** Create new permission  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (CreatePermissionDto)

```typescript
{
  resource: string;     // Ресурс
  action: string;       // Дія
  description?: string; // Опис
}
```

#### Response (201 Created)

```typescript
{
  success: true;
  data: {
    id: number;
    resource: string;
    action: string;
    description: string | null;
    createdAt: string;
  }
}
```

---

### PATCH `/api/permissions/:id`

**Опис:** Update permission  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (UpdatePermissionDto)

```typescript
{
  resource?: string;    // Новий ресурс
  action?: string;      // Нова дія
  description?: string; // Новий опис
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    resource: string;
    action: string;
    description: string | null;
    updatedAt: string;
  }
}
```

---

### DELETE `/api/permissions/:id`

**Опис:** Delete permission  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Permission deleted successfully"
  }
}
```

---

## Prices Module

### GET `/api/prices`

**Опис:** Get current price  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    version: number;
    data: {
      rack: Array<{
        id: number;
        name: string;
        price: number;
      }>;
      battery: Array<{
        id: number;
        name: string;
        price: number;
      }>;
      // ... інші категорії
    }
    createdAt: string;
    updatedAt: string;
  }
}
```

---

### GET `/api/prices/history`

**Опис:** Get price history  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: [
    {
      id: number;
      version: number;
      createdAt: string;
      updatedAt: string;
    }
  ];
}
```

---

### GET `/api/prices/categories`

**Опис:** Get price categories  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: string[];  // ["rack", "battery", "panels", ...]
}
```

---

### POST `/api/prices`

**Опис:** Create new price  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (CreatePriceDto)

```typescript
{
  data: {
    rack?: Array<{ id: number; name: string; price: number }>;
    battery?: Array<{ id: number; name: string; price: number }>;
    // ... інші категорії
  };
}
```

#### Response (201 Created)

```typescript
{
  success: true;
  data: {
    id: number;
    version: number;
    data: object;
    createdAt: string;
  }
}
```

---

### PATCH `/api/prices/current`

**Опис:** Update current price  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (UpdatePriceDto)

```typescript
{
  data: {
    rack?: Array<{ id: number; name: string; price: number }>;
    battery?: Array<{ id: number; name: string; price: number }>;
    // ... інші категорії
  };
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    version: number;
    data: object;
    updatedAt: string;
  }
}
```

---

### PATCH `/api/prices/:id`

**Опис:** Update price  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (UpdatePriceDto)

```typescript
{
  data: {
    rack?: Array<{ id: number; name: string; price: number }>;
    battery?: Array<{ id: number; name: string; price: number }>;
    // ... інші категорії
  };
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    version: number;
    data: object;
    updatedAt: string;
  }
}
```

---

### GET `/api/price-components`

**Опис:** Get all price components  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: [
    {
      id: number;
      name: string;
      category: string;
      price: number;
      unit: string;
      createdAt: string;
    }
  ];
}
```

---

### GET `/api/price-components/categories`

**Опис:** Get component categories  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: string[];  // ["rack", "battery", "panels", ...]
}
```

---

### GET `/api/price-components/:id`

**Опис:** Get component by ID  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    category: string;
    price: number;
    unit: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

---

### POST `/api/price-components`

**Опис:** Create new component  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (CreatePriceComponentDto)

```typescript
{
  name: string; // Назва компонента
  category: string; // Категорія
  price: number; // Ціна
  unit: string; // Одиниця виміру
}
```

#### Response (201 Created)

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    category: string;
    price: number;
    unit: string;
    createdAt: string;
  }
}
```

---

### PATCH `/api/price-components/:id`

**Опис:** Update component  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (UpdatePriceComponentDto)

```typescript
{
  name?: string;     // Нова назва
  category?: string; // Нова категорія
  price?: number;    // Нова ціна
  unit?: string;     // Нова одиниця
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    category: string;
    price: number;
    unit: string;
    updatedAt: string;
  }
}
```

---

### DELETE `/api/price-components/:id`

**Опис:** Delete component  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Component deleted successfully"
  }
}
```

---

### GET `/api/prices/rack-components`

**Опис:** Get rack components from current price  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: [
    {
      id: number;
      name: string;
      category: string;
      price: number;
      unit: string;
    }
  ];
}
```

---

### POST `/api/prices/parse-excel`

**Опис:** Parse Excel file (preview)  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### FormData

```
file: File  // Excel файл
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    preview: Array<{
      category: string;
      name: string;
      price: number;
      unit: string;
    }>;
    rowCount: number;
  }
}
```

---

### POST `/api/prices/upload-excel`

**Опис:** Upload price from Excel file  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### FormData

```
file: File  // Excel файл
```

#### Response (201 Created)

```typescript
{
  success: true;
  data: {
    id: number;
    version: number;
    createdAt: string;
  }
}
```

---

### POST `/api/prices/history/:id/restore`

**Опис:** Restore price version  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Price version restored"
    newPriceId: number;
  }
}
```

---

### GET `/api/prices/history/:id`

**Опис:** Get price version by ID  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    version: number;
    data: object;
    createdAt: string;
    updatedAt: string;
  }
}
```

---

### GET `/api/prices/export-excel`

**Опис:** Export current price to Excel  
**Доступ:** Public

#### Response (200 OK)

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="price_YYYYMMDD.xlsx"

[Binary Excel data]
```

---

## Rack Configurations Module

### GET `/api/rack-configurations`

**Опис:** Get all rack configurations  
**Доступ:** Public

#### Query Parameters

```
type?: string  // "rack" | "battery" | "all"
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: [
    {
      id: number;
      name: string;
      type: string;
      length: number;
      width: number;
      height: number;
      gap?: number;
      components: Array<{
        name: string;
        amount: number;
      }>;
      createdAt: string;
      updatedAt: string;
    }
  ];
}
```

---

### GET `/api/rack-configurations/types`

**Опис:** Get configuration types  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: string[];  // ["rack", "battery"]
}
```

---

### GET `/api/rack-configurations/:id`

**Опис:** Get configuration by ID  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    type: string;
    length: number;
    width: number;
    height: number;
    gap?: number;
    components: Array<{
      name: string;
      amount: number;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### POST `/api/rack-configurations`

**Опис:** Create new configuration  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (CreateRackConfigurationDto)

```typescript
{
  name: string;                    // Назва
  type: string;                    // Тип
  length: number;                  // Довжина (мм)
  width: number;                   // Ширина (мм)
  height: number;                  // Висота (мм)
  gap?: number;                    // Зазор (мм)
  components: Array<{              // Компоненти
    name: string;
    amount: number;
  }>;
}
```

#### Response (201 Created)

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    type: string;
    length: number;
    width: number;
    height: number;
    gap?: number;
    components: Array<{
      name: string;
      amount: number;
    }>;
    createdAt: string;
  };
}
```

---

### PATCH `/api/rack-configurations/:id`

**Опис:** Update configuration  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (UpdateRackConfigurationDto)

```typescript
{
  name?: string;                   // Нова назва
  type?: string;                   // Новий тип
  length?: number;                 // Нова довжина
  width?: number;                  // Нова ширина
  height?: number;                 // Нова висота
  gap?: number;                    // Новий зазор
  components?: Array<{             // Нові компоненти
    name: string;
    amount: number;
  }>;
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    type: string;
    length: number;
    width: number;
    height: number;
    gap?: number;
    components: Array<{
      name: string;
      amount: number;
    }>;
    updatedAt: string;
  };
}
```

---

### DELETE `/api/rack-configurations/:id`

**Опис:** Delete configuration  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Configuration deleted successfully"
  }
}
```

---

## Rack Sets Module

### GET `/api/rack-sets`

**Опис:** Get all rack sets with pagination  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Query Parameters

```
page?: number        // Сторінка (default: 1)
limit?: number       // Ліміт (default: 10)
search?: string      // Пошук по name/object_name
mySets?: boolean     // Тільки свої комплекти
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    rackSets: Array<{
      id: number;
      userId: number;
      name: string;
      objectName?: string;
      description?: string;
      racks?: Array<{
        rackConfigId: number;
        quantity: number;
        config?: object;
        components?: Array<{
          name: string;
          amount: number;
          price: number;
          total: number;
        }>;
        prices?: object;
        totalCost?: number;
      }>;
      totalCostSnapshot?: number;
      createdAt: string;
      updatedAt?: string;
      deletedAt?: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }
}
```

---

### GET `/api/rack-sets/:id`

**Опис:** Get rack set by ID  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    rackSet: {
      id: number;
      userId: number;
      name: string;
      objectName?: string;
      description?: string;
      racks?: Array<{
        rackConfigId: number;
        quantity: number;
        config?: object;
        components?: Array<{
          name: string;
          amount: number;
          price: number;
          total: number;
        }>;
        prices?: object;
        totalCost?: number;
      }>;
      totalCostSnapshot?: number;
      createdAt: string;
      updatedAt?: string;
      deletedAt?: string;
    };
  };
}
```

---

### GET `/api/rack-sets/:id/revisions`

**Опис:** Get rack set revisions  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    revisions: Array<{
      id: number;
      rackSetId: number;
      comment?: string;
      totalCostSnapshot: number;
      createdAt: string;
    }>;
  }
}
```

---

### POST `/api/rack-sets`

**Опис:** Create new rack set  
**Доступ:** Private (Authenticated users)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (CreateRackSetDto)

```typescript
{
  name: string;                    // Назва комплекту
  objectName?: string;             // Об'єкт
  description?: string;            // Опис
  racks?: Array<{                  // Стелажі
    rackConfigId: number;
    quantity: number;
    config?: object;
    components?: Array<{
      name: string;
      amount: number;
      price: number;
      total: number;
    }>;
    prices?: object;
    totalCost?: number;
  }>;
  rackItems?: Array<{              // Альтернативний формат
    rackConfigId: number;
    quantity: number;
    spans?: Array<{
      item: string;
      quantity: number;
    }>;
  }>;
}
```

#### Response (201 Created)

```typescript
{
  success: true;
  data: {
    id: number;
    userId: number;
    name: string;
    objectName?: string;
    description?: string;
    racks?: Array<{
      rackConfigId: number;
      quantity: number;
      config?: object;
      components?: Array<{
        name: string;
        amount: number;
        price: number;
        total: number;
      }>;
      prices?: object;
      totalCost?: number;
    }>;
    totalCostSnapshot?: number;
    createdAt: string;
  };
}
```

---

### PATCH `/api/rack-sets/:id`

**Опис:** Update rack set  
**Доступ:** Private (Owner or Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (UpdateRackSetDto)

```typescript
{
  name?: string;                   // Нова назва
  objectName?: string;             // Новий об'єкт
  description?: string;            // Новий опис
  racks?: Array<{                  // Нові стелажі
    rackConfigId: number;
    quantity: number;
    config?: object;
    components?: Array<{
      name: string;
      amount: number;
      price: number;
      total: number;
    }>;
    prices?: object;
    totalCost?: number;
  }>;
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    userId: number;
    name: string;
    objectName?: string;
    description?: string;
    racks?: Array<{
      rackConfigId: number;
      quantity: number;
      config?: object;
      components?: Array<{
        name: string;
        amount: number;
        price: number;
        total: number;
      }>;
      prices?: object;
      totalCost?: number;
    }>;
    totalCostSnapshot?: number;
    updatedAt: string;
  };
}
```

---

### DELETE `/api/rack-sets/:id`

**Опис:** Delete rack set (soft delete)  
**Доступ:** Private (Owner or Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Rack set deleted successfully"
  }
}
```

---

### GET `/api/rack-sets/deleted`

**Опис:** Get deleted rack sets  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    rackSets: Array<{
      id: number;
      userId: number;
      name: string;
      objectName?: string;
      description?: string;
      racks?: Array<{
        rackConfigId: number;
        quantity: number;
        config?: object;
        components?: Array<{
          name: string;
          amount: number;
          price: number;
          total: number;
        }>;
        prices?: object;
        totalCost?: number;
      }>;
      totalCostSnapshot?: number;
      createdAt: string;
      updatedAt?: string;
      deletedAt: string;
    }>;
  }
}
```

---

### POST `/api/rack-sets/:id/restore`

**Опис:** Restore deleted rack set  
**Доступ:** Private (Owner or Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Rack set restored successfully"
  }
}
```

---

### POST `/api/rack-sets/export`

**Опис:** Export new rack set to Excel  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body

```typescript
{
  rackItems: Array<{
    rackConfigId: number;
    quantity: number;
    spans?: Array<{
      item: string;
      quantity: number;
    }>;
  }>;
  includePrices: boolean; // Чи включати ціни
}
```

#### Response (200 OK)

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="YYYYMM_комплект стелажів_об'єкт_назва.xlsx"

[Binary Excel data]
```

---

### GET `/api/rack-sets/:id/export`

**Опис:** Export rack set to Excel  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Query Parameters

```
includePrices: boolean  // Чи включати ціни
```

#### Response (200 OK)

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="YYYYMM_комплект стелажів_об'єкт_назва.xlsx"

[Binary Excel data]
```

---

## Calculations Module

### GET `/api/calculations`

**Опис:** Get user calculations with pagination  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Query Parameters

```
page?: number       // Сторінка (default: 1)
limit?: number      // Ліміт (default: 10)
type?: string       // "rack" | "battery"
search?: string     // Пошук
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    calculations: Array<{
      id: number;
      userId: number;
      type: string; // "rack" | "battery"
      inputData: object;
      resultData: object;
      createdAt: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }
}
```

---

### POST `/api/calculations`

**Опис:** Save user calculation  
**Доступ:** Private

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (CreateCalculationDto)

```typescript
{
  type: string; // "rack" | "battery"
  inputData: object; // Вхідні дані
  resultData: object; // Результат
}
```

#### Response (201 Created)

```typescript
{
  success: true;
  data: {
    id: number;
    userId: number;
    type: string;
    inputData: object;
    resultData: object;
    createdAt: string;
  }
}
```

---

### DELETE `/api/calculations/:id`

**Опис:** Delete calculation  
**Доступ:** Private (Owner)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    message: string; // "Calculation deleted successfully"
  }
}
```

---

## Battery Module

### POST `/api/battery/calculate`

**Опис:** Calculate rack for batteries  
**Доступ:** Public

#### Request Body (BatteryCalculationDto)

```typescript
{
  batteryDimensions: {
    length: number;   // Довжина батареї (мм)
    width: number;    // Ширина батареї (мм)
    height: number;   // Висота батареї (мм)
    gap?: number;     // Зазор між батареями (мм)
  };
  weight: number;     // Вага батареї (кг)
  quantity: number;   // Кількість батарей
  config?: {
    format?: string;
    floors?: number;
    rows?: number;
    supportType?: string;
  };
}
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    variants: Array<{
      rackConfigId: number;
      config: {
        length: number;
        width: number;
        height: number;
        gap?: number;
      };
      components: Array<{
        name: string;
        amount: number;
        price: number;
        total: number;
      }>;
      prices: {
        rack: Array<{ id: number; name: string; price: number }>;
        battery: Array<{ id: number; name: string; price: number }>;
      };
      totalCost: number;
      requiredLength: number;  // Необхідна довжина лінії
    }>;
    message?: string;  // Повідомлення якщо немає варіантів
  };
}
```

---

### GET `/api/battery/list`

**Опис:** Get list of batteries  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    batteries: Array<{
      id: number;
      model: string;
      name: string;
      dimensions: {
        length: number;
        width: number;
        height: number;
        weight: number;
      };
      capacity?: string;
    }>;
    total: number;
  }
}
```

---

### GET `/api/battery/:model`

**Опис:** Get battery by model  
**Доступ:** Public

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    model: string;
    name: string;
    dimensions: {
      length: number;
      width: number;
      height: number;
      weight: number;
    };
    capacity?: string;
  };
}
```

---

## Export Module

### POST `/api/export/rack-sets`

**Опис:** Export rack sets to Excel  
**Доступ:** Private (Manager/Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (ExportRackSetsDto)

```typescript
{
  rackSetIds: number[];  // IDs комплектів
  includePrices: boolean; // Чи включати ціни
}
```

#### Response (200 OK)

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="rack_sets_export_YYYYMMDD.xlsx"

[Binary Excel data]
```

---

### POST `/api/export/prices`

**Опис:** Export prices to Excel  
**Доступ:** Private (Manager/Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (ExportPricesDto)

```typescript
{
  priceIds: number[];  // IDs прайсів
}
```

#### Response (200 OK)

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="prices_export_YYYYMMDD.xlsx"

[Binary Excel data]
```

---

### POST `/api/export/calculations`

**Опис:** Export calculations to Excel  
**Доступ:** Private (Manager/Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Request Body (ExportCalculationsDto)

```typescript
{
  calculationIds: number[];  // IDs розрахунків
}
```

#### Response (200 OK)

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="calculations_export_YYYYMMDD.xlsx"

[Binary Excel data]
```

---

## Audit Module

### GET `/api/audit`

**Опис:** Get audit logs with pagination  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Query Parameters

```
page?: number           // Сторінка (default: 1)
limit?: number          // Ліміт (default: 20)
action?: string         // Фільтр по дії
entity?: string         // Фільтр по сутності
userId?: number         // Фільтр по користувачу
startDate?: string      // Початкова дата (ISO)
endDate?: string        // Кінцева дата (ISO)
sortBy?: string         // Сортування (default: createdAt)
order?: asc|desc        // Порядок
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    auditLogs: Array<{
      id: number;
      userId: number;
      userEmail: string;
      action: string; // "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | ...
      entity: string; // "User" | "Role" | "Price" | ...
      entityId: number;
      changes?: {
        before?: object;
        after?: object;
      };
      ipAddress?: string;
      userAgent?: string;
      createdAt: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }
}
```

---

### GET `/api/audit/stats`

**Опис:** Get audit statistics  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Query Parameters

```
startDate?: string  // Початкова дата
endDate?: string    // Кінцева дата
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    totalLogs: number;
    logsByAction: {
      CREATE: number;
      UPDATE: number;
      DELETE: number;
      LOGIN: number;
      // ...
    }
    logsByEntity: {
      User: number;
      Role: number;
      Price: number;
      // ...
    }
    topUsers: Array<{
      userId: number;
      userEmail: string;
      count: number;
    }>;
  }
}
```

---

### GET `/api/audit/:id`

**Опис:** Get audit log by ID  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    id: number;
    userId: number;
    userEmail: string;
    action: string;
    entity: string;
    entityId: number;
    changes?: {
      before?: object;
      after?: object;
    };
    ipAddress?: string;
    userAgent?: string;
    metadata?: object;
    createdAt: string;
  };
}
```

---

### DELETE `/api/audit/cleanup`

**Опис:** Cleanup old audit logs  
**Доступ:** Private (Admin)

#### Headers

```
Authorization: Bearer <accessToken>
```

#### Query Parameters

```
olderThanDays: number  // Видалити старіше N днів
```

#### Response (200 OK)

```typescript
{
  success: true;
  data: {
    deletedCount: number; // Кількість видалених записів
  }
}
```

---

## 📊 Діаграма доступу до API

### Public Endpoints (без авторизації)

```
GET  /api/prices
GET  /api/prices/categories
GET  /api/prices/export-excel
GET  /api/price-components
GET  /api/price-components/categories
GET  /api/price-components/:id
GET  /api/prices/rack-components
GET  /api/prices/history/:id

GET  /api/rack-configurations
GET  /api/rack-configurations/types
GET  /api/rack-configurations/:id

POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-email

POST /api/battery/calculate
GET  /api/battery/configurations
GET  /api/battery/examples
```

### Private Endpoints (потрібна авторизація)

```
GET  /api/users/me
PATCH /api/users/me
POST /api/users/:id/change-password
POST /api/auth/logout
POST /api/auth/logout-all

GET  /api/rack-sets
GET  /api/rack-sets/:id
GET  /api/rack-sets/:id/revisions
POST /api/rack-sets
PATCH /api/rack-sets/:id
DELETE /api/rack-sets/:id
GET  /api/rack-sets/deleted
POST /api/rack-sets/:id/restore
POST /api/rack-sets/export
GET  /api/rack-sets/:id/export

GET  /api/calculations
POST /api/calculations
DELETE /api/calculations/:id
```

### Admin Only Endpoints

```
GET  /api/users
GET  /api/users/stats
POST /api/users
PATCH /api/users/:id (admin або owner)
DELETE /api/users/:id
POST /api/users/:id/restore

GET  /api/roles
GET  /api/roles/:id
POST /api/roles
PATCH /api/roles/:id
DELETE /api/roles/:id
POST /api/roles/:id/permissions
POST /api/roles/:id/permissions/:permissionId
DELETE /api/roles/:id/permissions/:permissionId

GET  /api/permissions
GET  /api/permissions/:id
POST /api/permissions
PATCH /api/permissions/:id
DELETE /api/permissions/:id

GET   /api/prices/history
POST  /api/prices
PATCH /api/prices/current
PATCH /api/prices/:id
POST  /api/prices/parse-excel
POST  /api/prices/upload-excel
GET   /api/prices/history/:id/restore
PATCH /api/price-components/:id
DELETE /api/price-components/:id

POST /api/rack-configurations
PATCH /api/rack-configurations/:id
DELETE /api/rack-configurations/:id

POST /api/export/rack-sets
POST /api/export/prices
POST /api/export/calculations

GET  /api/audit
GET  /api/audit/stats
GET  /api/audit/:id
DELETE /api/audit/cleanup
```

---

## 🎯 Система дозволів (Permissions)

### Ресурси

- `users` - управління користувачами
- `roles` - управління ролями
- `prices` - управління прайсами
- `rack_sets` - управління комплектами
- `export` - експорт даних
- `audit` - журнал аудиту
- `all` - універсальний дозвіл

### Дії

- `create` - створення
- `read` - читання
- `update` - оновлення
- `delete` - видалення
- `all` - універсальна дія

### Ролі за замовчуванням

| Роль      | Дозволи                                                                |
| --------- | ---------------------------------------------------------------------- |
| **ADMIN** | `all:all` - повні права на все                                         |
| MANAGER   | `prices:read`, `rack_sets:read`, `export:all`                          |
| USER      | `users:read (self)`, `rack_sets:all (self)`, `calculations:all (self)` |

---

## 📝 Примітки

### Формат дат

Всі дати повертаються у форматі ISO 8601:

```
"2026-03-18T14:30:00.000Z"
```

### Пагінація

Всі списки з великою кількістю записів підтримують пагінацію:

```typescript
{
  pagination: {
    total: number; // Всього записів
    page: number; // Поточна сторінка
    limit: number; // Записів на сторінку
    totalPages: number; // Всього сторінок
  }
}
```

### Soft Delete

Наступні сутності підтримують м'яке видалення:

- Users
- RackSets

Видалені записи мають поле `deletedAt` з датою видалення.

### Експорт в Excel

Всі експорти повертають бінарні дані Excel файлу з відповідним `Content-Type`.

---

**Документація актуальна на:** 18 березня 2026  
**Версія API:** 1.0  
**Статус:** Production Ready
