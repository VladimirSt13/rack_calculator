# 📡 Client API Documentation

**Дата оновлення:** 18 березня 2026  
**Версія:** 1.0  
**Статус:** Актуально

---

## 📋 Зміст

1. [Auth API](#auth-api)
2. [Users API](#users-api)
3. [Roles API](#roles-api)
4. [Price API](#price-api)
5. [Rack API](#rack-api)
6. [RackSets API](#racksets-api)
7. [Battery API](#battery-api)
8. [Audit API](#audit-api)

---

## Auth API

**Файл:** `client/src/features/auth/authApi.ts`

### register()

**Опис:** Реєстрація нового користувача

**Signature:**

```typescript
register(email: string, password: string): Promise<User>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| email | string | Email користувача |
| password | string | Пароль (мін. 8 символів) |

**Response:**

```typescript
{
  id: number;
  email: string;
  nickname: string | null;
  roleName: string;
  isVerified: boolean;
}
```

**Example:**

```typescript
await authApi.register('user@example.com', 'Password123!');
```

---

### login()

**Опис:** Вхід користувача (створення сесії)

**Signature:**

```typescript
login(email: string, password: string): Promise<LoginResponse>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| email | string | Email користувача |
| password | string | Пароль |

**Response:**

```typescript
{
  user: {
    id: number;
    email: string;
    nickname: string | null;
    roleName: string;
    isVerified: boolean;
  }
  accessToken: string;
  refreshToken: string;
}
```

**Example:**

```typescript
const { user, accessToken, refreshToken } = await authApi.login('user@example.com', 'Password123!');
```

---

### logout()

**Опис:** Вихід користувача (видалення сесії)

**Signature:**

```typescript
logout(): Promise<void>
```

**Example:**

```typescript
await authApi.logout();
```

---

### logoutAll()

**Опис:** Вихід з усіх пристроїв (видалення сесії)

**Signature:**

```typescript
logoutAll(): Promise<void>
```

**Example:**

```typescript
await authApi.logoutAll();
```

---

### me()

**Опис:** Отримати поточного користувача

**Signature:**

```typescript
me(): Promise<User>
```

**Response:**

```typescript
{
  id: number;
  email: string;
  nickname: string | null;
  roleName: string;
  isVerified: boolean;
  priceTypes?: number[];
  createdAt: string;
  updatedAt: string;
}
```

**Example:**

```typescript
const user = await authApi.me();
```

---

### verifyEmail()

**Опис:** Підтвердження email

**Signature:**

```typescript
verifyEmail(token: string): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| token | string | Токен з email |

**Example:**

```typescript
await authApi.verifyEmail('abc123token');
```

---

### resendVerification()

**Опис:** Повторна відправка підтвердження email

**Signature:**

```typescript
resendVerification(email: string): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| email | string | Email для підтвердження |

**Example:**

```typescript
await authApi.resendVerification('user@example.com');
```

---

### forgotPassword()

**Опис:** Запит на скидання пароля

**Signature:**

```typescript
forgotPassword(email: string): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| email | string | Email користувача |

**Example:**

```typescript
await authApi.forgotPassword('user@example.com');
```

---

### resetPassword()

**Опис:** Скидання пароля з токеном

**Signature:**

```typescript
resetPassword(token: string, newPassword: string): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| token | string | Токен з email |
| newPassword | string | Новий пароль |

**Example:**

```typescript
await authApi.resetPassword('resetToken123', 'NewPassword123!');
```

---

### changePassword()

**Опис:** Зміна пароля (для авторизованого)

**Signature:**

```typescript
changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| userId | number | ID користувача |
| currentPassword | string | Поточний пароль |
| newPassword | string | Новий пароль |

**Example:**

```typescript
await authApi.changePassword(123, 'OldPass123!', 'NewPass123!');
```

---

### refreshToken()

**Опис:** Оновлення JWT токена

**Signature:**

```typescript
refreshToken(refreshToken: string): Promise<RefreshResponse>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| refreshToken | string | Refresh токен |

**Response:**

```typescript
{
  accessToken: string;
  refreshToken: string;
}
```

**Example:**

```typescript
const { accessToken, refreshToken } = await authApi.refreshToken(oldRefreshToken);
```

---

## Users API

**Файл:** `client/src/features/users/usersApi.ts`

### getAll()

**Опис:** Отримати список користувачів з пагінацією

**Signature:**

```typescript
getAll(params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<UsersResponse>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| params.role | string? | Фільтр по ролі |
| params.search | string? | Пошук по email/nickname |
| params.page | number? | Сторінка (default: 1) |
| params.limit | number? | Ліміт (default: 10) |

**Response:**

```typescript
{
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**User Type:**

```typescript
{
  id: number;
  email: string;
  role: "admin" | "manager" | "user";
  permissions?: {
    price_types: string[];
  };
  emailVerified: boolean;
  createdAt: string;
}
```

**Example:**

```typescript
const { users, pagination } = await usersApi.getAll({ page: 1, limit: 20, role: 'manager' });
```

---

### getById()

**Опис:** Отримати користувача за ID

**Signature:**

```typescript
getById(id: number): Promise<User>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID користувача |

**Response:**

```typescript
User;
```

**Example:**

```typescript
const user = await usersApi.getById(123);
```

---

### create()

**Опис:** Створити нового користувача

**Signature:**

```typescript
create(userData: {
  email: string;
  password: string;
  role?: string;
  permissions?: object;
  price_types?: string[];
}): Promise<User>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| userData.email | string | Email |
| userData.password | string | Пароль |
| userData.role | string? | Роль |
| userData.permissions | object? | Дозволи |
| userData.price_types | string[]? | Типи цін |

**Response:**

```typescript
User;
```

**Example:**

```typescript
const newUser = await usersApi.create({
  email: 'newuser@example.com',
  password: 'Password123!',
  role: 'manager',
  price_types: ['retail', 'wholesale'],
});
```

---

### update()

**Опис:** Оновити користувача

**Signature:**

```typescript
update(id: number, userData: {
  email?: string;
  role?: string;
  permissions?: object;
  price_types?: string[];
  password?: string;
}): Promise<User>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID користувача |
| userData.email | string? | Новий email |
| userData.role | string? | Нова роль |
| userData.permissions | object? | Нові дозволи |
| userData.price_types | string[]? | Нові типи цін |
| userData.password | string? | Новий пароль |

**Response:**

```typescript
User;
```

**Example:**

```typescript
const updatedUser = await usersApi.update(123, {
  role: 'admin',
  price_types: ['retail', 'wholesale', 'dealer'],
});
```

---

### delete()

**Опис:** Видалити користувача

**Signature:**

```typescript
delete(id: number): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID користувача |

**Example:**

```typescript
await usersApi.delete(123);
```

---

### getAudit()

**Опис:** Отримати історію аудиту користувача

**Signature:**

```typescript
getAudit(id: number, limit?: number): Promise<AuditLog[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID користувача |
| limit | number? | Ліміт записів (default: 50) |

**Response:**

```typescript
AuditLog[]
```

**Example:**

```typescript
const auditLogs = await usersApi.getAudit(123, 100);
```

---

## Roles API

**Файл:** `client/src/features/users/rolesApi.ts`

### getAll()

**Опис:** Отримати всі ролі

**Signature:**

```typescript
getAll(): Promise<Role[]>
```

**Response:**

```typescript
Role[]
```

**Role Type:**

```typescript
{
  id: number;
  name: string;
  label: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  permissions?: Array<{
    id: number;
    resource: string;
    action: string;
    description?: string;
  }>;
}
```

**Example:**

```typescript
const roles = await rolesApi.getAll();
```

---

### getById()

**Опис:** Отримати роль за ID

**Signature:**

```typescript
getById(id: number): Promise<Role>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID ролі |

**Response:**

```typescript
Role;
```

**Example:**

```typescript
const role = await rolesApi.getById(1);
```

---

### create()

**Опис:** Створити нову роль

**Signature:**

```typescript
create(roleData: CreateRoleDto): Promise<Role>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| roleData | CreateRoleDto | Дані ролі |

**CreateRoleDto:**

```typescript
{
  name: string;
  description?: string;
  permissions?: number[];
}
```

**Response:**

```typescript
Role;
```

**Example:**

```typescript
const newRole = await rolesApi.create({
  name: 'MANAGER',
  description: 'Менеджер',
  permissions: [1, 2, 3],
});
```

---

### update()

**Опис:** Оновити роль

**Signature:**

```typescript
update(id: number, roleData: UpdateRoleDto): Promise<Role>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID ролі |
| roleData | UpdateRoleDto | Нові дані ролі |

**UpdateRoleDto:**

```typescript
{
  name?: string;
  description?: string;
  permissions?: number[];
}
```

**Response:**

```typescript
Role;
```

**Example:**

```typescript
const updatedRole = await rolesApi.update(1, { name: 'SENIOR_MANAGER' });
```

---

### delete()

**Опис:** Видалити роль

**Signature:**

```typescript
delete(id: number): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID ролі |

**Example:**

```typescript
await rolesApi.delete(1);
```

---

### assignPermissions()

**Опис:** Призначити дозволи ролі

**Signature:**

```typescript
assignPermissions(roleId: number, permissionIds: number[]): Promise<Role>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| roleId | number | ID ролі |
| permissionIds | number[] | Масив ID дозволів |

**Response:**

```typescript
Role;
```

**Example:**

```typescript
const updatedRole = await rolesApi.assignPermissions(1, [1, 2, 3, 4, 5]);
```

---

### addPermission()

**Опис:** Додати один дозвіл до ролі

**Signature:**

```typescript
addPermission(roleId: number, permissionId: number): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| roleId | number | ID ролі |
| permissionId | number | ID дозволу |

**Example:**

```typescript
await rolesApi.addPermission(1, 5);
```

---

### removePermission()

**Опис:** Видалити дозвіл з ролі

**Signature:**

```typescript
removePermission(roleId: number, permissionId: number): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| roleId | number | ID ролі |
| permissionId | number | ID дозволу |

**Example:**

```typescript
await rolesApi.removePermission(1, 3);
```

---

### getAllPermissions()

**Опис:** Отримати всі дозволи

**Signature:**

```typescript
getAllPermissions(): Promise<Permission[]>
```

**Response:**

```typescript
Permission[]
```

**Permission Type:**

```typescript
{
  id: number;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Example:**

```typescript
const permissions = await rolesApi.getAllPermissions();
```

---

### getPermissionById()

**Опис:** Отримати дозвіл за ID

**Signature:**

```typescript
getPermissionById(id: number): Promise<Permission>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID дозволу |

**Response:**

```typescript
Permission;
```

**Example:**

```typescript
const permission = await rolesApi.getPermissionById(1);
```

---

### createPermission()

**Опис:** Створити новий дозвіл

**Signature:**

```typescript
createPermission(permissionData: CreatePermissionDto): Promise<Permission>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| permissionData | CreatePermissionDto | Дані дозволу |

**CreatePermissionDto:**

```typescript
{
  resource: string;
  action: string;
  description?: string;
}
```

**Response:**

```typescript
Permission;
```

**Example:**

```typescript
const newPermission = await rolesApi.createPermission({
  resource: 'reports',
  action: 'read',
});
```

---

### updatePermission()

**Опис:** Оновити дозвіл

**Signature:**

```typescript
updatePermission(id: number, permissionData: UpdatePermissionDto): Promise<Permission>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID дозволу |
| permissionData | UpdatePermissionDto | Нові дані дозволу |

**UpdatePermissionDto:**

```typescript
{
  resource?: string;
  action?: string;
  description?: string;
}
```

**Response:**

```typescript
Permission;
```

**Example:**

```typescript
const updatedPermission = await rolesApi.updatePermission(1, {
  description: 'Оновлений опис',
});
```

---

### deletePermission()

**Опис:** Видалити дозвіл

**Signature:**

```typescript
deletePermission(id: number): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID дозволу |

**Example:**

```typescript
await rolesApi.deletePermission(1);
```

---

### getPriceTypes()

**Опис:** Отримати типи цін ролі (legacy, для сумісності)

**Signature:**

```typescript
getPriceTypes(roleName: string): Promise<string[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| roleName | string | Назва ролі |

**Response:**

```typescript
string[]
```

**Example:**

```typescript
const priceTypes = await rolesApi.getPriceTypes('manager');
```

---

### updatePriceTypes()

**Опис:** Оновити типи цін ролі (legacy, для сумісності)

**Signature:**

```typescript
updatePriceTypes(roleName: string, priceTypes: string[]): Promise<Role>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| roleName | string | Назва ролі |
| priceTypes | string[] | Масив типів цін |

**Response:**

```typescript
Role;
```

**Example:**

```typescript
const updatedRole = await rolesApi.updatePriceTypes('manager', ['retail', 'wholesale', 'dealer']);
```

---

### create()

**Опис:** Створити нову роль

**Signature:**

```typescript
create(roleData: {
  name: string;
  label: string;
  description?: string;
  permissions?: string[];
  price_types?: string[];
}): Promise<Role>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| roleData.name | string | Назва ролі |
| roleData.label | string | Відображувана назва |
| roleData.description | string? | Опис |
| roleData.permissions | string[]? | Дозволи |
| roleData.price_types | string[]? | Типи цін |

**Response:**

```typescript
Role;
```

**Example:**

```typescript
const newRole = await rolesApi.create({
  name: 'supervisor',
  label: 'Супервізор',
  description: 'Між менеджером та адміном',
  permissions: ['prices:read', 'users:read'],
  price_types: ['retail', 'wholesale'],
});
```

---

## Price API

**Файл:** `client/src/features/price/priceApi.ts`

### getCurrent()

**Опис:** Отримати поточний прайс

**Signature:**

```typescript
getCurrent(): Promise<PriceData | null>
```

**Response:**

```typescript
PriceData;
```

**PriceData Type:**

```typescript
{
  supports: Record<string, SupportPriceItem>;
  spans: Record<string, SimplePriceItem>;
  vertical_supports: Record<string, SimplePriceItem>;
  diagonal_brace: Record<string, SimplePriceItem>;
  isolator: Record<string, SimplePriceItem>;
}
```

**Example:**

```typescript
const priceData = await priceApi.getCurrent();
```

---

### getHistory()

**Опис:** Отримати історію змін прайсу

**Signature:**

```typescript
getHistory(): Promise<PriceVersion[]>
```

**Response:**

```typescript
PriceVersion[]
```

**PriceVersion Type:**

```typescript
{
  id: number;
  created_at: string;
  created_by: string;
  items_count: number;
}
```

**Example:**

```typescript
const versions = await priceApi.getHistory();
```

---

### uploadExcel()

**Опис:** Завантажити новий прайс з Excel файлу

**Signature:**

```typescript
uploadExcel(file: File, onProgress?: (progress: number) => void): Promise<PriceUploadResponse>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| file | File | Excel файл (.xlsx) |
| onProgress | function? | Callback для прогресу (0-100) |

**Response:**

```typescript
PriceUploadResponse;
```

**Example:**

```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

await priceApi.uploadExcel(file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});
```

---

### getVersion()

**Опис:** Отримати конкретну версію прайсу

**Signature:**

```typescript
getVersion(versionId: number): Promise<PriceData>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| versionId | number | ID версії |

**Response:**

```typescript
PriceData;
```

**Example:**

```typescript
const oldPrice = await priceApi.getVersion(42);
```

---

### restoreVersion()

**Опис:** Відновити попередню версію прайсу (rollback)

**Signature:**

```typescript
restoreVersion(versionId: number): Promise<PriceData>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| versionId | number | ID версії для відновлення |

**Response:**

```typescript
PriceData;
```

**Example:**

```typescript
const restoredPrice = await priceApi.restoreVersion(42);
```

---

### updatePrice()

**Опис:** Оновити ціну в прайсі

**Signature:**

```typescript
updatePrice(priceData: PriceData): Promise<PriceData>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| priceData | PriceData | Нові дані прайсу |

**Response:**

```typescript
PriceData;
```

**Example:**

```typescript
const updatedPrice = await priceApi.updatePrice({
  ...currentPrice,
  spans: {
    ...currentPrice.spans,
    beam_2500: { name: 'Балка 2500мм', price: 1500 },
  },
});
```

---

### downloadExcel()

**Опис:** Скачати поточний прайс у форматі Excel

**Signature:**

```typescript
downloadExcel(): Promise<void>
```

**Example:**

```typescript
await priceApi.downloadExcel();
// Файл автоматично завантажується в браузер
```

---

## Rack API

**Файл:** `client/src/features/rack/rackApi.ts`

### calculate()

**Опис:** Розрахунок стелажа (старий API, для сумісності)

**Signature:**

```typescript
calculate(config: RackCalculationRequest): Promise<RackCalculationResponse>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| config | RackCalculationRequest | Конфігурація стелажа |

**RackCalculationRequest:**

```typescript
{
  floors: number;
  rows: number;
  beamsPerRow: number;
  length: number;
  width: number;
  height: number;
  supports?: string;
  verticalSupports?: string;
  spans?: Array<{ item: string; quantity: number }>;
}
```

**Response:**

```typescript
RackCalculationResponse;
```

**Example:**

```typescript
const result = await rackApi.calculate({
  floors: 5,
  rows: 2,
  beamsPerRow: 3,
  length: 3000,
  width: 1000,
  height: 2000,
  supports: '80x60',
  spans: [{ item: 'beam_2500', quantity: 6 }],
});
```

---

### findOrCreateConfiguration()

**Опис:** Знайти або створити конфігурацію стелажа (новий API)

**Signature:**

```typescript
findOrCreateConfiguration(config: {
  floors: number;
  rows: number;
  beamsPerRow: number;
  supports?: string;
  verticalSupports?: string;
  spans?: Array<{ item: string; quantity: number }>;
}): Promise<RackConfigurationResponse>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| config.floors | number | Кількість рівнів |
| config.rows | number | Кількість рядів |
| config.beamsPerRow | number | Кількість балок в ряду |
| config.supports | string? | Тип опор |
| config.verticalSupports | string? | Тип вертикальних опор |
| config.spans | Array? | Прольоти |

**Response:**

```typescript
{
  rackConfigId: number;
  name: string;
  config: RackConfig;
  components: Component[];
  prices: PriceData;
  totalCost: number;
}
```

**Example:**

```typescript
const config = await rackApi.findOrCreateConfiguration({
  floors: 5,
  rows: 2,
  beamsPerRow: 3,
  supports: '80x60',
  spans: [{ item: 'beam_2500', quantity: 6 }],
});
```

---

### calculateBatch()

**Опис:** Масовий розрахунок стелажів

**Signature:**

```typescript
calculateBatch(racks: RackCalculationRequest[]): Promise<RackCalculationResponse[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| racks | RackCalculationRequest[] | Масив конфігурацій |

**Response:**

```typescript
RackCalculationResponse[]
```

**Example:**

```typescript
const results = await rackApi.calculateBatch([
  { floors: 5, rows: 2, beamsPerRow: 3, length: 3000, width: 1000, height: 2000 },
  { floors: 4, rows: 1, beamsPerRow: 2, length: 2000, width: 800, height: 1500 },
]);
```

---

### calculatePricesForConfiguration()

**Опис:** Розрахувати ціни для конфігурації за ID

**Signature:**

```typescript
calculatePricesForConfiguration(rackConfigId: number, quantity?: number): Promise<PriceCalculationResponse>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| rackConfigId | number | ID конфігурації |
| quantity | number? | Кількість (default: 1) |

**Response:**

```typescript
{
  components: Component[];
  prices: PriceData;
  totalCost: number;
}
```

**Example:**

```typescript
const prices = await rackApi.calculatePricesForConfiguration(123, 5);
```

---

## RackSets API

**Файл:** `client/src/features/rack/rackSetsApi.ts`

### getAll()

**Опис:** Отримати список комплектів стелажів

**Signature:**

```typescript
getAll(): Promise<{ rackSets: RackSet[] }>
```

**Response:**

```typescript
{
  rackSets: RackSet[]
}
```

**RackSet Type:**

```typescript
{
  id: number;
  user_id: number;
  name: string;
  object_name?: string;
  description?: string;
  racks?: RackSetItem[];
  total_cost?: number;
  total_cost_snapshot?: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}
```

**Example:**

```typescript
const { rackSets } = await rackSetsApi.getAll();
```

---

### getById()

**Опис:** Отримати конкретний комплект з деталями

**Signature:**

```typescript
getById(id: number): Promise<{ rackSet: RackSet }>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID комплекту |

**Response:**

```typescript
{
  rackSet: RackSet;
}
```

**Example:**

```typescript
const { rackSet } = await rackSetsApi.getById(123);
```

---

### create()

**Опис:** Створити новий комплект стелажів

**Signature:**

```typescript
create(rackSetData: {
  name: string;
  object_name?: string;
  description?: string;
  racks?: RackSetItem[];
  rack_items?: RackItem[];
}): Promise<RackSet>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| rackSetData.name | string | Назва комплекту |
| rackSetData.object_name | string? | Об'єкт |
| rackSetData.description | string? | Опис |
| rackSetData.racks | RackSetItem[]? | Стелажі |
| rackSetData.rack_items | RackItem[]? | Елементи комплекту |

**RackItem Type:**

```typescript
{
  rackConfigId: number;
  quantity: number;
  spans?: Array<{ item: string; quantity: number }>;
}
```

**Response:**

```typescript
RackSet;
```

**Example:**

```typescript
const newSet = await rackSetsApi.create({
  name: 'Комплект для складу',
  object_name: 'Склад №1',
  description: 'Стелажі для зберігання батарей',
  rack_items: [
    { rackConfigId: 1, quantity: 10 },
    { rackConfigId: 2, quantity: 5 },
  ],
});
```

---

### update()

**Опис:** Оновити існуючий комплект

**Signature:**

```typescript
update(id: number, rackSetData: {
  name?: string;
  object_name?: string;
  description?: string;
  racks?: RackSetItem[];
}): Promise<RackSet>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID комплекту |
| rackSetData.name | string? | Нова назва |
| rackSetData.object_name | string? | Новий об'єкт |
| rackSetData.description | string? | Новий опис |
| rackSetData.racks | RackSetItem[]? | Нові стелажі |

**Response:**

```typescript
RackSet;
```

**Example:**

```typescript
const updatedSet = await rackSetsApi.update(123, {
  name: 'Оновлений комплект',
  racks: [...]
});
```

---

### delete()

**Опис:** Видалити комплект стелажів (Soft Delete)

**Signature:**

```typescript
delete(id: number): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID комплекту |

**Example:**

```typescript
await rackSetsApi.delete(123);
```

---

### getDeleted()

**Опис:** Отримати видалені комплекти стелажів

**Signature:**

```typescript
getDeleted(): Promise<{ rackSets: RackSet[] }>
```

**Response:**

```typescript
{
  rackSets: RackSet[]  // Тільки видалені комплекти
}
```

**Example:**

```typescript
const { rackSets } = await rackSetsApi.getDeleted();
```

---

### restore()

**Опис:** Відновити видалений комплект стелажів

**Signature:**

```typescript
restore(id: number): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID комплекту для відновлення |

**Example:**

```typescript
await rackSetsApi.restore(123);
```

---

### createRevision()

**Опис:** Створити ревізію комплекту

**Signature:**

```typescript
createRevision(id: number, comment?: string): Promise<RackSetRevision>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID комплекту |
| comment | string? | Коментар до ревізії |

**Response:**

```typescript
RackSetRevision;
```

**RackSetRevision Type:**

```typescript
{
  id: number;
  rack_set_id: number;
  comment?: string;
  total_cost_snapshot: number;
  created_at: string;
}
```

**Example:**

```typescript
const revision = await rackSetsApi.createRevision(123, 'Оновлення після зміни цін');
```

---

### getRevisions()

**Опис:** Отримати історію ревізій

**Signature:**

```typescript
getRevisions(id: number): Promise<{ revisions: RackSetRevision[] }>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID комплекту |

**Response:**

```typescript
{
  revisions: RackSetRevision[]
}
```

**Example:**

```typescript
const { revisions } = await rackSetsApi.getRevisions(123);
```

---

### export()

**Опис:** Експорт комплекту в Excel

**Signature:**

```typescript
export(id: number, includePrices?: boolean): Promise<ArrayBuffer>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | number | ID комплекту |
| includePrices | boolean? | Чи включати ціни (default: false) |

**Response:**

```typescript
ArrayBuffer; // Binary Excel data
```

**Example:**

```typescript
const excelData = await rackSetsApi.export(123, true);
downloadRackSetExport(excelData, rackSet, true);
```

---

### exportNew()

**Опис:** Експорт нового комплекту (ще не збереженого)

**Signature:**

```typescript
exportNew(rack_items: RackItem[], includePrices?: boolean): Promise<ArrayBuffer>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| rack_items | RackItem[] | Елементи комплекту |
| includePrices | boolean? | Чи включати ціни (default: false) |

**Response:**

```typescript
ArrayBuffer; // Binary Excel data
```

**Example:**

```typescript
const excelData = await rackSetsApi.exportNew(
  [
    { rackConfigId: 1, quantity: 10 },
    { rackConfigId: 2, quantity: 5 },
  ],
  true,
);
```

---

### Helper Functions

#### getExportFilename()

**Опис:** Сформувати назву файлу для експорту

**Signature:**

```typescript
getExportFilename(
  rackSet: { name: string; object_name?: string; description?: string },
  includePrices?: boolean
): string
```

**Example:**

```typescript
const filename = getExportFilename(rackSet, true);
// "202603_комплект стелажів_Склад №1_Основний_з цінами.xlsx"
```

---

#### downloadRackSetExport()

**Опис:** Завантажити Excel файл в браузері

**Signature:**

```typescript
downloadRackSetExport(
  data: ArrayBuffer,
  rackSet: { name: string; object_name?: string; description?: string },
  includePrices?: boolean
): void
```

**Example:**

```typescript
const excelData = await rackSetsApi.export(123, true);
downloadRackSetExport(excelData, rackSet, true);
```

---

## Battery API

**Файл:** `client/src/features/battery/batteryApi.ts`

### calculate()

**Опис:** Розрахунок стелажа по батареї

**Signature:**

```typescript
calculate(
  batteryDimensions: BatteryDimensions,
  weight: number,
  quantity: number,
  config?: { format?: string; floors?: number; rows?: number; supportType?: string }
): Promise<BatteryCalculationResult>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| batteryDimensions | BatteryDimensions | Розміри батареї |
| weight | number | Вага батареї (кг) |
| quantity | number | Кількість батарей |
| config | object? | Додаткова конфігурація |

**BatteryDimensions:**

```typescript
{
  length: number;   // Довжина (мм)
  width: number;    // Ширина (мм)
  height: number;   // Висота (мм)
  gap?: number;     // Зазор (мм)
}
```

**Response:**

```typescript
BatteryCalculationResult;
```

**BatteryCalculationResult:**

```typescript
{
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
    requiredLength: number;
  }>;
  message?: string;
}
```

**Example:**

```typescript
const result = await batteryApi.calculate({ length: 200, width: 100, height: 300, gap: 10 }, 15, 100, {
  floors: 5,
  rows: 2,
  supportType: '80x60',
});
```

---

### getBatteries()

**Опис:** Отримати список акумуляторів

**Signature:**

```typescript
getBatteries(): Promise<BatteryInfo[]>
```

**Response:**

```typescript
BatteryInfo[]
```

**BatteryInfo:**

```typescript
{
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
}
```

**Example:**

```typescript
const batteries = await batteryApi.getBatteries();
```

---

### getBatteryByModel()

**Опис:** Отримати акумулятор за моделлю

**Signature:**

```typescript
getBatteryByModel(model: string): Promise<BatteryInfo | null>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| model | string | Модель батареї |

**Response:**

```typescript
BatteryInfo | null;
```

**Example:**

```typescript
const battery = await batteryApi.getBatteryByModel('LiFePO4-18650');
```

---

### findBest()

**Опис:** Підбір найкращого варіанту стелажа (legacy, для сумісності)

**Signature:**

```typescript
findBest(
  batteryDimensions: BatteryDimensions,
  weight: number,
  quantity: number,
  config?: { floors?: number; rows?: number; supportType?: string }
): Promise<BatteryCalculationResult>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| batteryDimensions | BatteryDimensions | Розміри батареї |
| weight | number | Вага батареї (кг) |
| quantity | number | Кількість батарей |
| config | object? | Додаткова конфігурація |

**Response:**

```typescript
BatteryCalculationResult;
```

**Example:**

```typescript
const bestVariant = await batteryApi.findBest({ length: 200, width: 100, height: 300, gap: 10 }, 15, 100, {
  floors: 5,
  rows: 2,
  supportType: '80x60',
});
```

---

## Audit API

**Файл:** `client/src/features/audit/auditApi.ts`

### getRecent()

**Опис:** Отримати останні записи аудиту (для адміна)

**Signature:**

```typescript
getRecent(limit?: number): Promise<AuditLog[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| limit | number? | Ліміт записів (default: 100) |

**Response:**

```typescript
AuditLog[]
```

**AuditLog Type:**

```typescript
{
  id: number;
  user_id: number;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
```

**Example:**

```typescript
const recentLogs = await auditApi.getRecent(50);
```

---

### getByEntity()

**Опис:** Отримати історію аудиту для сутності

**Signature:**

```typescript
getByEntity(entityType: string, entityId: number, limit?: number): Promise<AuditLog[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| entityType | string | Тип сутності (User, Role, Price, ...) |
| entityId | number | ID сутності |
| limit | number? | Ліміт записів (default: 50) |

**Response:**

```typescript
AuditLog[]
```

**Example:**

```typescript
const userAudit = await auditApi.getByEntity('User', 123, 100);
```

---

### getByUser()

**Опис:** Отримати історію аудиту користувача

**Signature:**

```typescript
getByUser(userId: number, limit?: number): Promise<AuditLog[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| userId | number | ID користувача |
| limit | number? | Ліміт записів (default: 50) |

**Response:**

```typescript
AuditLog[]
```

**Example:**

```typescript
const logs = await auditApi.getByUser(123);
```

---

### getAll()

**Опис:** Отримати аудит з фільтрами

**Signature:**

```typescript
getAll(filters?: AuditFilters): Promise<AuditResponse>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| filters | AuditFilters? | Фільтри |

**AuditFilters:**

```typescript
{
  userId?: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
```

**Response:**

```typescript
{
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Example:**

```typescript
const { logs, pagination } = await auditApi.getAll({
  action: 'CREATE',
  entityType: 'User',
  page: 1,
  limit: 20,
});
```

---

### getStatistics()

**Опис:** Отримати статистику аудиту

**Signature:**

```typescript
getStatistics(): Promise<AuditStatistics>
```

**Response:**

```typescript
AuditStatistics;
```

**AuditStatistics Type:**

```typescript
{
  total: number;
  last7days: number;
  last30days: number;
  databaseSize: number;
  topActions: {
    action: string;
    count: number;
  }
  [];
  byDate: {
    date: string;
    count: number;
  }
  [];
}
```

**Example:**

```typescript
const stats = await auditApi.getStatistics();
console.log(`Total logs: ${stats.total}`);
```

---

### cleanup()

**Опис:** Очистити записи старіше вказаного періоду

**Signature:**

```typescript
cleanup(days: number): Promise<AuditCleanupResponse>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| days | number | Видалити записи старіше N днів |

**Response:**

```typescript
{
  message: string;
  deletedCount: number;
}
```

**Example:**

```typescript
const result = await auditApi.cleanup(90);
console.log(`Deleted ${result.deletedCount} logs older than 90 days`);
```

---

## 📊 Типи даних

### Common Types

**File:** `client/src/shared/types/api.types.ts`

```typescript
// Battery Dimensions
interface BatteryDimensions {
  length: number;
  width: number;
  height: number;
  gap?: number;
}

// Battery Calculation Request
interface BatteryCalculationRequest {
  batteryDimensions: BatteryDimensions;
  weight: number;
  quantity: number;
  config?: {
    format?: string;
  };
}

// Battery Find Best Response
interface BatteryFindBestResponse {
  success: boolean;
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
      requiredLength: number;
    }>;
    message?: string;
  };
}

// Rack Calculation Request
interface RackCalculationRequest {
  floors: number;
  rows: number;
  beamsPerRow: number;
  length: number;
  width: number;
  height: number;
  supports?: string;
  verticalSupports?: string;
  spans?: Array<{
    item: string;
    quantity: number;
  }>;
}

// Rack Calculation Response
interface RackCalculationResponse {
  success: boolean;
  data: {
    config: {
      floors: number;
      rows: number;
      beamsPerRow: number;
      length: number;
      width: number;
      height: number;
    };
    components: Array<{
      name: string;
      amount: number;
      price: number;
      total: number;
    }>;
    totalCost: number;
  };
}
```

---

## 🎯 Приклади використання

### Auth Flow

```typescript
import { authApi } from '@/features/auth/authApi';

// Registration
try {
  await authApi.register('user@example.com', 'Password123!');
  toast.success('Registration successful! Check your email.');
} catch (error) {
  toast.error('Registration failed');
}

// Login
try {
  const { user, accessToken, refreshToken } = await authApi.login('user@example.com', 'Password123!');
  authStore.setState({ user, accessToken, refreshToken });
  navigate('/dashboard');
} catch (error) {
  toast.error('Invalid credentials');
}

// Logout
const handleLogout = async () => {
  await authApi.logout();
  authStore.clear();
  navigate('/login');
};
```

---

### Price Management

```typescript
import { priceApi } from '@/features/price/priceApi';

// Get current price
const priceData = await priceApi.getCurrent();

// Upload new price from Excel
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput?.files?.[0];

if (file) {
  await priceApi.uploadExcel(file, (progress) => {
    setUploadProgress(progress);
  });
  toast.success('Price uploaded successfully');
}

// Download current price
await priceApi.downloadExcel();
```

---

### Rack Set Management

```typescript
import { rackSetsApi, downloadRackSetExport } from '@/features/rack/rackSetsApi';

// Create new rack set
const newSet = await rackSetsApi.create({
  name: 'Складський комплект',
  object_name: 'Склад №1',
  rack_items: [
    { rackConfigId: 1, quantity: 10 },
    { rackConfigId: 2, quantity: 5 },
  ],
});

// Export to Excel
const excelData = await rackSetsApi.export(newSet.id, true);
downloadRackSetExport(excelData, newSet, true);

// Soft delete
await rackSetsApi.delete(newSet.id);

// Get deleted sets
const { rackSets: deletedSets } = await rackSetsApi.getDeleted();

// Restore
await rackSetsApi.restore(newSet.id);
```

---

### Audit Log

```typescript
import { auditApi } from '@/features/audit/auditApi';

// Get filtered audit logs
const { logs, pagination } = await auditApi.getAll({
  action: 'CREATE',
  entityType: 'User',
  dateFrom: '2026-03-01',
  page: 1,
  limit: 20,
});

// Get statistics
const stats = await auditApi.getStatistics();
console.log(`Total: ${stats.total}, Last 7 days: ${stats.last7days}`);

// Cleanup old logs
const result = await auditApi.cleanup(90);
console.log(`Deleted ${result.deleted} records`);
```

---

## 📝 Примітки

### Axios Instance

Всі API використовують спільний axios instance з:

- Base URL з `.env`
- Автоматичним додаванням JWT токена
- Interceptors для refresh token
- Обробкою помилок

### Error Handling

```typescript
try {
  await api.post('/endpoint', data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
    } else if (error.response?.status === 404) {
      // Not found
    } else {
      // Server error
    }
  }
}
```

### TypeScript Types

Всі типи імпортовані з `@/shared/types/api.types.ts` або визначені в кожному API файлі.

---

**Документація актуальна на:** 18 березня 2026  
**Версія Client API:** 1.0  
**Статус:** Production Ready
