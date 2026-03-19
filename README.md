на# Rack Calculator v3.1

Калькулятор стелажів та підбору акумуляторів для компанії "Акку-енерго"

**Дата оновлення:** 17 березня 2026  
**Статус:** ✅ MongoDB + TypeScript + RBAC  
**[📊 Поточний статус](./plan-server.md)**

## 🏗️ Архітектура

### Monorepo структура

```
rack_calculator/
├── client/          # React додаток (Vite + TypeScript)
├── server/          # Express API (MongoDB + TypeScript)
├── shared/          # Спільна бізнес-логіка
└── package.json     # Root workspace
```

### Технології

**Frontend (client/):**

- React 18 + TypeScript
- React Router DOM 6
- TanStack Query 5
- Zustand 4 + persist middleware
- React Hook Form 7 + Zod
- Axios (з auto refresh token)
- TailwindCSS + Radix UI

**Backend (server/):**

- Express 4 + TypeScript
- MongoDB Atlas (Mongoose)
- JWT + Refresh Tokens (TTL)
- bcryptjs
- Helmet + Rate Limit
- **Roles & Permissions (RBAC)**
- **13 моделей MongoDB**
- **Repository Pattern**
- **Feature-Based Architecture**

## 🚀 Швидкий старт

### Вимоги

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas (або локальний MongoDB >= 7.0)

### Встановлення

```bash
# Встановити всі залежності
npm run install:all
```

### Розробка

```bash
# Запустити client + server одночасно
npm run dev

# Або окремо
npm run dev:client   # http://localhost:3000
npm run dev:server   # http://localhost:3001
```

### Збірка

```bash
# Зібрати всі воркспейси
npm run build
```

## 📁 Структура проєкту

### Client

```
client/
├── src/
│   ├── app/           # App.tsx, routing
│   ├── pages/         # LoginPage, DashboardPage, RackPage, BatteryPage
│   ├── features/      # auth/, rack/, battery/, audit/
│   ├── shared/        # UI компоненти
│   ├── core/          # Constants (routes, roles)
│   ├── hooks/         # Custom hooks
│   └── lib/           # Axios instance
└── docs/              # Клієнтська документація
```

### Server

```
server/
├── src/
│   ├── modules/       # Feature-based: auth/, users/, roles/, prices/
│   ├── database/      # MongoDB + Models + Repositories
│   ├── common/        # Middleware, Utils, Types
│   ├── config/        # App, Database, JWT config
│   ├── app.ts         # Express app
│   └── index.ts       # Entry point
├── legacy/            # Старий JavaScript код
├── docs/              # Серверна документація
└── scripts/           # seed-admin, migrations
```

## 🔌 API Endpoints

### Auth

| Method | Endpoint                    | Description           | Auth |
| ------ | --------------------------- | --------------------- | ---- |
| POST   | `/api/auth/register`        | Реєстрація            | ❌   |
| POST   | `/api/auth/login`           | Вхід                  | ❌   |
| POST   | `/api/auth/logout`          | Вихід                 | ✅   |
| POST   | `/api/auth/refresh`         | Refresh token         | ❌   |
| POST   | `/api/auth/verify-email`    | Підтвердження email   | ❌   |
| POST   | `/api/auth/forgot-password` | Запит скидання пароля | ❌   |
| POST   | `/api/auth/reset-password`  | Скидання пароля       | ❌   |
| GET    | `/api/users/me`             | Поточний користувач   | ✅   |

### Roles (Admin Only)

| Method | Endpoint                         | Description        |
| ------ | -------------------------------- | ------------------ |
| GET    | `/api/roles`                     | Список ролей       |
| GET    | `/api/roles/:id`                 | Роль за ID         |
| POST   | `/api/roles`                     | Створити роль      |
| PATCH  | `/api/roles/:id`                 | Оновити роль       |
| DELETE | `/api/roles/:id`                 | Видалити роль      |
| POST   | `/api/roles/:id/permissions`     | Призначити дозволи |
| POST   | `/api/roles/:id/permissions/:id` | Додати дозвіл      |
| DELETE | `/api/roles/:id/permissions/:id` | Видалити дозвіл    |
| GET    | `/api/permissions`               | Всі дозволи        |
| POST   | `/api/permissions`               | Створити дозвіл    |

### Rack Calculations

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| POST   | `/api/rack/calculate`       | Розрахунок стелажа |
| POST   | `/api/rack/calculate-batch` | Масовий розрахунок |

### Battery Calculations

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| POST   | `/api/battery/calculate` | Розрахунок по батареї |
| POST   | `/api/battery/find-best` | Підбір варіанту       |

## 🔐 Ролі та доступ

### Ролі

| Роль      | Опис                    | Права                     |
| --------- | ----------------------- | ------------------------- |
| **ADMIN** | Системний адміністратор | 🔴 **Повні права на все** |
| MANAGER   | Менеджер                | Ціни, комплекти, експорт  |
| USER      | Користувач              | Базовий доступ            |

### Адмін має повні права

- ✅ Створювати/редагувати/видаляти ролі
- ✅ Створювати/редагувати/видаляти дозволи
- ✅ Призначати дозволи ролям
- ✅ Доступ до всіх API endpoint'ів (автоматично проходить перевірки)

### Система дозволів (RBAC)

Клієнт перевіряє **дозволи** (permissions), а не ролі. Це правильний підхід RBAC.

**Приклад використання:**

```typescript
import { useAuthStore } from '@/features/auth/authStore';

const { hasPermission, isAdmin } = useAuthStore();

// Перевірка дозволу
if (hasPermission('USERS_CREATE')) {
  // Користувач може створювати користувачів
}

// Адмін має всі дозволи автоматично
if (isAdmin()) {
  // Повний доступ
}

// ProtectedRoute з дозволами
<ProtectedRoute requiredPermissions={['USERS_READ', 'USERS_UPDATE']}>
  <UserManagement />
</ProtectedRoute>
```

**Детальна документація:** [client/docs/RBAC_PERMISSIONS.md](./client/docs/RBAC_PERMISSIONS.md)

### Ініціалізація адміна

```bash
npm run seed:admin
```

**Створює:**

- 3 ролі: ADMIN, MANAGER, USER
- 19 дозволів: USERS*\*, ROLES*\_, PRICES\__, RACK*SETS*_, EXPORT\_\_, AUDIT\_\*, ALL
- Адмін з повними правами

### Тестові користувачі

| Email                      | Пароль       | Роль      |
| -------------------------- | ------------ | --------- |
| admin@accu-energo.com.ua   | Admin123456! | **ADMIN** |
| manager@accu-energo.com.ua | Manager123!  | MANAGER   |
| user@accu-energo.com.ua    | User123!     | USER      |

> ⚠️ **Змініть паролі після першого входу!**

## 📚 Документація

### Основна

- [plan-server.md](./plan-server.md) - **📊 План розробки: Сервер (актуальний)**
- [plan-client.md](./plan-client.md) - План розробки: Клієнт

### Server

- [ROLES_AND_PERMISSIONS.md](./server/docs/ROLES_AND_PERMISSIONS.md) - Ролі та дозволи (RBAC)
- [RBAC_SYSTEM.md](./server/docs/RBAC_SYSTEM.md) - **Повний гайд по системі дозволів**
- [PRICING.md](./server/docs/PRICING.md) - Система цін

### Client

- [ROUTES.md](./client/docs/ROUTES.md) - Маршрути
- [COMPONENTS.md](./client/COMPONENTS.md) - Компоненти
- [DESIGN_SYSTEM.md](./client/DESIGN_SYSTEM.md) - Дизайн система
- **[RBAC_PERMISSIONS.md](./client/docs/RBAC_PERMISSIONS.md) - Система дозволів (RBAC)**

### Загальна

- [CONVENTIONS.md](./docs/CONVENTIONS.md) - Конвенції проєкту
- [docs/BATTERY_PAGE_AUDIT.md](./docs/BATTERY_PAGE_AUDIT.md) - Аудит Battery сторінки
- **[docs/battery-algorithm.md](./docs/battery-algorithm.md) - Алгоритм підбору стелажів**

## 🛠️ Корисні команди

### Server

```bash
# Розробка
npm run dev:server          # Запуск сервера
npm run typecheck           # Перевірка типів

# Build
npm run build:server        # Компіляція TypeScript
npm run start               # Запуск продакшен

# Адмін
npm run seed:admin          # Створити адміна з повними правами

# Утиліти
npm run lint                # Linting
npm run format              # Format code
npm run clean               # Clean dist
```

### Client

```bash
npm run build              # Збірка
npm run typecheck          # Перевірка типів
```

### Разом

```bash
npm run dev                # Обидва одночасно
npm run install:all        # Встановити все
```

## 📄 Ліцензія

MIT
