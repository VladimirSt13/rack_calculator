# 📋 План розробки: Серверна частина

**Дата оновлення:** 17 березня 2026  
**Версія:** 3.0 (MongoDB + TypeScript)  
**Статус:** ✅ **ЗАВЕРШЕНО**  
**Архітектура:** Feature-Based + Repository Pattern

---

## 🎯 Огляд

Серверна частина Rack Calculator — це повний рефакторинг з:

1. ✅ **Міграція БД:** SQLite → MongoDB Atlas
2. ✅ **Міграція мови:** JavaScript → TypeScript
3. ✅ **Зміна архітектури:** Layer-Based → Feature-Based + Repository Pattern
4. ✅ **Система ролей:** RBAC з повними правами для адміна

---

## 🔐 Система ролей та дозволів

### Ролі

| Роль      | Опис                    | Права                           |
| --------- | ----------------------- | ------------------------------- |
| **ADMIN** | Системний адміністратор | 🔴 **Повні права на все**       |
| MANAGER   | Менеджер                | Ціни, комплекти, експорт        |
| USER      | Звичайний користувач    | Перегляд, розрахунки, комплекти |

### Дозволи (Permissions)

**Ресурси:**

- `users` — управління користувачами
- `roles` — управління ролями
- `prices` — управління прайсами
- `rack_sets` — управління комплектами
- `export` — експорт даних
- `audit` — журнал аудиту
- `all` — універсальний дозвіл

**Дії:**

- `create` — створення
- `read` — читання
- `update` — оновлення
- `delete` — видалення
- `all` — універсальна дія

### Адмін має повні права

**Адмін може:**

- ✅ Створювати/редагувати/видаляти ролі
- ✅ Створювати/редагувати/видаляти дозволи
- ✅ Призначати дозволи ролям
- ✅ Доступ до всіх API endpoint'ів

```typescript
// authorizeRole middleware
if (userRole === 'admin') {
  next(); // Пропускає будь-яку перевірку
  return;
}

// authorizePermission middleware
if (req.user.roleName === 'admin') {
  next(); // Пропускає будь-яку перевірку дозволів
  return;
}
```

### Ініціалізація ролей

```bash
npm run seed:admin
```

**Створює:**

- 3 ролі: ADMIN, MANAGER, USER
- 19 дозволів: USERS*\*, ROLES*_, PRICES\__, RACK*SETS*_, EXPORT\__, AUDIT\_\*, ALL
- Адмін-користувач: `admin@accu-energo.com.ua` / `Admin123456!`
- Менеджер: `manager@accu-energo.com.ua` / `Manager123!`
- Користувач: `user@accu-energo.com.ua` / `User123!`

### API для управління ролями (тільки адмін)

| Метод  | Endpoint                         | Опис                   |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/api/roles`                     | Отримати всі ролі      |
| GET    | `/api/roles/:id`                 | Отримати роль за ID    |
| POST   | `/api/roles`                     | **Створити роль**      |
| PATCH  | `/api/roles/:id`                 | **Оновити роль**       |
| DELETE | `/api/roles/:id`                 | **Видалити роль**      |
| POST   | `/api/roles/:id/permissions`     | **Призначити дозволи** |
| POST   | `/api/roles/:id/permissions/:id` | **Додати дозвіл**      |
| DELETE | `/api/roles/:id/permissions/:id` | **Видалити дозвіл**    |
| GET    | `/api/permissions`               | Отримати всі дозволи   |
| GET    | `/api/permissions/:id`           | Отримати дозвіл за ID  |
| POST   | `/api/permissions`               | **Створити дозвіл**    |
| PATCH  | `/api/permissions/:id`           | **Оновити дозвіл**     |
| DELETE | `/api/permissions/:id`           | **Видалити дозвіл**    |

---

## 🏗️ Архітектура

### Було (Legacy — JavaScript + SQLite)

```
server/
├── controllers/    # 12 контролерів
├── services/       # 11 сервісів
├── models/         # 12 моделей SQLite
├── routes/         # 40+ endpoint'ів
├── middleware/     # auth.js, authorizeRole.js
├── helpers/        # audit.js, email.js
└── db/             # SQLite + 16 міграцій
```

**Проблеми:**

- ❌ JavaScript без типізації
- ❌ SQLite — обмежена масштабованість
- ❌ змішування логіки (controllers + services + models)
- ❌ важко тестувати

### Стало (New — TypeScript + MongoDB)

```
server/src/
├── modules/                    # 10 feature-модулів
│   ├── auth/                   # 🔐 Авторизація
│   ├── users/                  # 👥 Користувачі
│   ├── roles/                  # 🎭 Ролі та дозволи
│   ├── prices/                 # 💰 Прайс-листи
│   ├── rack-configurations/    # 🔧 Конфігурації
│   ├── rack-sets/              # 📦 Комплекти
│   ├── calculations/           # 🧮 Розрахунки
│   ├── battery/                # 🔋 Акумулятори
│   ├── export/                 # 📊 Експорт
│   └── audit/                  # 📝 Аудит
│
├── database/                   # 🗄️ MongoDB
│   ├── index.ts                # Connection + graceful shutdown
│   ├── models/                 # 13 Mongoose схем
│   └── repositories/           # BaseRepository + специфічні
│
├── common/                     # 📦 Спільне
│   ├── types/                  # Загальні типи
│   ├── middleware/             # Auth, Validation, Error
│   └── utils/                  # Logger, ApiResponder, JWT
│
├── config/                     # ⚙️ Конфігурація
│   ├── app.config.ts
│   ├── database.config.ts
│   └── jwt.config.ts
│
├── app.ts                      # Express app
└── index.ts                    # Entry point
```

**Переваги:**

- ✅ Повна типізація TypeScript
- ✅ MongoDB — масштабованість + JSON нативно
- ✅ Feature-based — кожен модуль ізольований
- ✅ Repository Pattern — легко тестувати

---

## ✅ ЗАВЕРШЕНІ ЕТАПИ (REFORM_PLAN)

### Етап 0: Налаштування TypeScript ✅

- [x] Встановлено TypeScript, tsx, типи
- [x] Створено `tsconfig.json` та `tsconfig.build.json`
- [x] Оновлено `package.json` scripts
- [x] Встановлено mongoose, dotenv

### Етап 1: Структура папок ✅

- [x] Створено `modules/` для feature-based структури
- [x] Створено `database/` для MongoDB
- [x] Створено `common/` для спільних утиліт
- [x] Створено `config/` для конфігурації

### Етап 2: Base Repository + MongoDB Connection ✅

- [x] Створено `BaseRepository<T>` з CRUD методами
- [x] MongoDB connection з graceful shutdown
- [x] Конфігурація БД (`database.config.ts`)

### Етап 3: MongoDB схеми (13 моделей) ✅

| Модель              | Опис                                    |
| ------------------- | --------------------------------------- |
| `User`              | Користувачі (soft delete, verification) |
| `Role`              | Ролі з permissions                      |
| `Permission`        | Дозволи (resource + action)             |
| `Price`             | Прайс-листи (JSON data)                 |
| `PriceComponent`    | Компоненти прайсу                       |
| `RackConfiguration` | Конфігурації стелажів (JSON)            |
| `RackSet`           | Комплекти стелажів (soft delete)        |
| `RackSetRevision`   | Історія змін комплектів                 |
| `Calculation`       | Розрахунки користувачів                 |
| `AuditLog`          | Журнал аудиту                           |
| `RefreshToken`      | Refresh токени (TTL index)              |
| `EmailVerification` | Підтвердження email (TTL index)         |
| `PasswordReset`     | Скидання пароля (TTL index)             |

### Етап 4: DTO та типи ✅

- [x] Auth DTOs (Login, Register, Refresh, Response)
- [x] Users DTOs (Create, Update, Response, Query)
- [x] Roles DTOs (Create, Update, Permissions)
- [x] Prices DTOs (Create, Update, Components)
- [x] RackConfigurations DTOs
- [x] RackSets DTOs
- [x] Calculations DTOs
- [x] Battery DTOs
- [x] Export DTOs
- [x] Audit DTOs

### Етап 5-14: Модулі (10 модулів) ✅

#### ✅ Auth Module

| Компонент  | Файли                                         |
| ---------- | --------------------------------------------- |
| Controller | `auth.controller.ts`                          |
| Service    | `auth.service.ts`                             |
| Repository | `auth.repository.ts`                          |
| Routes     | `auth.routes.ts`                              |
| DTOs       | `dto/auth.dto.ts`, `dto/auth-response.dto.ts` |
| Types      | `auth.types.ts`                               |

**Функціонал:**

- Login, Register, Refresh
- Forgot/Reset Password
- Verify Email
- JWT tokens, bcrypt

#### ✅ Users Module

| Компонент  | Файли                 |
| ---------- | --------------------- |
| Controller | `users.controller.ts` |
| Service    | `users.service.ts`    |
| Repository | `users.repository.ts` |
| Routes     | `users.routes.ts`     |
| DTOs       | `dto/users.dto.ts`    |
| Types      | `users.types.ts`      |

**Функціонал:**

- CRUD operations
- Pagination & filtering
- Password change
- Soft delete & restore

#### ✅ Roles Module

| Компонент  | Файли                 |
| ---------- | --------------------- |
| Controller | `roles.controller.ts` |
| Service    | `roles.service.ts`    |
| Repository | `roles.repository.ts` |
| Routes     | `roles.routes.ts`     |
| DTOs       | `dto/roles.dto.ts`    |
| Types      | `roles.types.ts`      |

**Функціонал:**

- CRUD for roles
- CRUD for permissions
- Assign permissions to roles
- System roles protection

#### ✅ Prices Module

| Компонент  | Файли                  |
| ---------- | ---------------------- |
| Controller | `prices.controller.ts` |
| Service    | `prices.service.ts`    |
| Repository | `prices.repository.ts` |
| Routes     | `prices.routes.ts`     |
| DTOs       | `dto/prices.dto.ts`    |
| Types      | `prices.types.ts`      |

**Функціонал:**

- Price lists management
- Price components
- Categories support
- JSON data storage

#### ✅ RackConfigurations Module

| Компонент  | Файли                               |
| ---------- | ----------------------------------- |
| Controller | `rack-configurations.controller.ts` |
| Service    | `rack-configurations.service.ts`    |
| Repository | `rack-configurations.repository.ts` |
| Routes     | `rack-configurations.routes.ts`     |
| DTOs       | `dto/rack-configurations.dto.ts`    |
| Types      | `rack-configurations.types.ts`      |

**Функціонал:**

- Rack configurations CRUD
- Components support
- Type filtering

#### ✅ RackSets Module

| Компонент  | Файли                     |
| ---------- | ------------------------- |
| Controller | `rack-sets.controller.ts` |
| Service    | `rack-sets.service.ts`    |
| Repository | `rack-sets.repository.ts` |
| Routes     | `rack-sets.routes.ts`     |
| DTOs       | `dto/rack-sets.dto.ts`    |
| Types      | `rack-sets.types.ts`      |

**Функціонал:**

- Rack sets CRUD
- Revisions system (історія змін)
- Soft delete & restore
- Owner checks

#### ✅ Calculations Module

| Компонент  | Файли                        |
| ---------- | ---------------------------- |
| Controller | `calculations.controller.ts` |
| Service    | `calculations.service.ts`    |
| Repository | `calculations.repository.ts` |
| Routes     | `calculations.routes.ts`     |
| DTOs       | `dto/calculations.dto.ts`    |
| Types      | `calculations.types.ts`      |

**Функціонал:**

- Save user calculations
- Types: rack & battery
- Pagination & filtering
- Owner access control

#### ✅ Battery Module

| Компонент  | Файли                   |
| ---------- | ----------------------- |
| Controller | `battery.controller.ts` |
| Service    | `battery.service.ts`    |
| Repository | `battery.repository.ts` |
| Routes     | `battery.routes.ts`     |
| DTOs       | `dto/battery.dto.ts`    |
| Types      | `battery.types.ts`      |

**Функціонал:**

- Battery rack calculations
- Optimal configuration algorithm
- Components calculation
- Battery database (example)

#### ✅ Export Module

| Компонент  | Файли                  |
| ---------- | ---------------------- |
| Controller | `export.controller.ts` |
| Service    | `export.service.ts`    |
| Repository | —                      |
| Routes     | `export.routes.ts`     |
| DTOs       | `dto/export.dto.ts`    |
| Types      | `export.types.ts`      |

**Функціонал:**

- Excel export (xlsx)
- Rack sets export
- Prices export
- Calculations export
- Styling & formatting

#### ✅ Audit Module

| Компонент  | Файли                 |
| ---------- | --------------------- |
| Controller | `audit.controller.ts` |
| Service    | `audit.service.ts`    |
| Repository | `audit.repository.ts` |
| Routes     | `audit.routes.ts`     |
| DTOs       | `dto/audit.dto.ts`    |
| Types      | `audit.types.ts`      |

**Функціонал:**

- Activity logging
- Filtering by action, entity, user, date
- Statistics & aggregation
- Automatic cleanup (cron)
- IP & User-Agent tracking

### Етап 15: Інтеграція та деплой ✅

- [x] Створено `app.ts` з підключенням всіх модулів
- [x] Створено `index.ts` (entry point)
- [x] Створено `error.middleware.ts`
- [x] TypeScript компілюється без помилок
- [x] Всі зміни завантажено на GitHub

---

## 📊 Статистика проекту

### Файли

| Категорія           | Кількість |
| ------------------- | --------- |
| **Всього файлів**   | 105+      |
| **Моделей MongoDB** | 13        |
| **Модулів**         | 10        |
| **Repository**      | 13        |
| **Service**         | 10        |
| **Controller**      | 10        |
| **Routes**          | 10        |
| **DTO**             | 30+       |
| **Types**           | 15+       |

### Рядки коду

| Категорія          | Рядки   |
| ------------------ | ------- |
| **TypeScript код** | ~8000+  |
| **Документація**   | ~2000+  |
| **Всього**         | ~10000+ |

### API Endpoints

| Модуль             | Endpoints |
| ------------------ | --------- |
| Auth               | 8         |
| Users              | 10        |
| Roles              | 12        |
| Prices             | 8         |
| RackConfigurations | 8         |
| RackSets           | 8         |
| Calculations       | 6         |
| Battery            | 3         |
| Export             | 3         |
| Audit              | 6         |
| **Всього**         | **72+**   |

---

## 🔄 Legacy → New: Порівняння

### Auth

| Legacy                          | New                                      |
| ------------------------------- | ---------------------------------------- |
| `controllers/authController.js` | `modules/auth/auth.controller.ts`        |
| `services/authService.js`       | `modules/auth/auth.service.ts`           |
| `models/AuthModel.js`           | `database/models/refresh-token.model.ts` |
| —                               | `modules/auth/auth.repository.ts`        |

### Users

| Legacy                           | New                                 |
| -------------------------------- | ----------------------------------- |
| `controllers/usersController.js` | `modules/users/users.controller.ts` |
| `services/usersService.js`       | `modules/users/users.service.ts`    |
| `models/User.js`                 | `database/models/user.model.ts`     |
| —                                | `modules/users/users.repository.ts` |

### Roles

| Legacy                           | New                                 |
| -------------------------------- | ----------------------------------- |
| `controllers/rolesController.js` | `modules/roles/roles.controller.ts` |
| `services/rolesService.js`       | `modules/roles/roles.service.ts`    |
| `models/Role.js`                 | `database/models/role.model.ts`     |
| —                                | `modules/roles/roles.repository.ts` |

### Prices

| Legacy                           | New                                   |
| -------------------------------- | ------------------------------------- |
| `controllers/priceController.js` | `modules/prices/prices.controller.ts` |
| `services/priceService.js`       | `modules/prices/prices.service.ts`    |
| `models/Price.js`                | `database/models/price.model.ts`      |
| —                                | `modules/prices/prices.repository.ts` |

### RackConfigurations

| Legacy                                       | New                                                             |
| -------------------------------------------- | --------------------------------------------------------------- |
| `controllers/rackConfigurationController.js` | `modules/rack-configurations/rack-configurations.controller.ts` |
| `services/rackConfigurationService.js`       | `modules/rack-configurations/rack-configurations.service.ts`    |
| `models/RackConfiguration.js`                | `database/models/rack-configuration.model.ts`                   |
| —                                            | `modules/rack-configurations/rack-configurations.repository.ts` |

### RackSets

| Legacy                             | New                                         |
| ---------------------------------- | ------------------------------------------- |
| `controllers/rackSetController.js` | `modules/rack-sets/rack-sets.controller.ts` |
| `services/rackSetService.js`       | `modules/rack-sets/rack-sets.service.ts`    |
| `models/RackSet.js`                | `database/models/rack-set.model.ts`         |
| —                                  | `modules/rack-sets/rack-sets.repository.ts` |

### Calculations

| Legacy                                  | New                                               |
| --------------------------------------- | ------------------------------------------------- |
| `controllers/calculationsController.js` | `modules/calculations/calculations.controller.ts` |
| `services/calculationsService.js`       | `modules/calculations/calculations.service.ts`    |
| —                                       | `database/models/calculation.model.ts`            |
| —                                       | `modules/calculations/calculations.repository.ts` |

### Battery

| Legacy                             | New                                           |
| ---------------------------------- | --------------------------------------------- |
| `controllers/batteryController.js` | `modules/battery/battery.controller.ts`       |
| `services/batteryService.js`       | `modules/battery/battery.service.ts`          |
| —                                  | `database/models/rack-configuration.model.ts` |
| —                                  | `modules/battery/battery.repository.ts`       |

### Export

| Legacy                            | New                                   |
| --------------------------------- | ------------------------------------- |
| `controllers/exportController.js` | `modules/export/export.controller.ts` |
| `services/exportService.js`       | `modules/export/export.service.ts`    |
| —                                 | —                                     |

### Audit

| Legacy                           | New                                  |
| -------------------------------- | ------------------------------------ |
| `controllers/auditController.js` | `modules/audit/audit.controller.ts`  |
| `services/auditService.js`       | `modules/audit/audit.service.ts`     |
| `models/AuditLog.js`             | `database/models/audit-log.model.ts` |
| —                                | `modules/audit/audit.repository.ts`  |

---

## 📦 Встановлення та запуск

### Вимоги

- Node.js >= 18.0.0
- MongoDB Atlas >= 7.0
- npm >= 9.0.0

### Встановлення

```bash
# Встановлення всіх залежностей
npm run install:all

# Запуск дев-режиму (client + server)
npm run dev
```

### Конфігурація

```bash
# Скопіювати .env.example
cp server/.env.example server/.env

# Відредагувати змінні оточення
# MONGODB_URI, JWT_SECRET, тощо
```

### Команди

```bash
# Розробка
npm run dev:server          # Запуск сервера
npm run typecheck           # Перевірка типів

# Build
npm run build:server        # Компіляція TypeScript
npm run start               # Запуск продакшен версії

# Утиліти
npm run lint                # Linting
npm run format              # Format code
npm run clean               # Clean dist
```

---

## 🎯 Досягнуті результати

### TypeScript ✅

- [x] Повна типізація всього коду
- [x] Автодоповнення в IDE
- [x] Менше багів на етапі розробки
- [x] Краща підтримка коду

### MongoDB ✅

- [x] Гнучка схема
- [x] Краща масштабованість
- [x] Нативна підтримка JSON
- [x] TTL індекси для автоматичного видалення

### Repository Pattern ✅

- [x] Ізоляція роботи з БД
- [x] Легше тестувати
- [x] Можливість замінити БД
- [x] Generic CRUD методи

### Feature-Based ✅

- [x] Краща організація коду
- [x] Легша навігація
- [x] Простіший code review
- [x] Модульність

---

## 📁 Структура проекту

```
server/
├── src/
│   ├── modules/                    # Feature-based модулі
│   │   ├── auth/                   # 🔐 Авторизація
│   │   ├── users/                  # 👥 Користувачі
│   │   ├── roles/                  # 🎭 Ролі та дозволи
│   │   ├── prices/                 # 💰 Прайс-листи
│   │   ├── rack-configurations/    # 🔧 Конфігурації
│   │   ├── rack-sets/              # 📦 Комплекти
│   │   ├── calculations/           # 🧮 Розрахунки
│   │   ├── battery/                # 🔋 Акумулятори
│   │   ├── export/                 # 📊 Експорт
│   │   └── audit/                  # 📝 Аудит
│   │
│   ├── database/                   # 🗄️ Робота з БД
│   │   ├── index.ts                # MongoDB connection
│   │   ├── models/                 # 13 Mongoose схем
│   │   └── repositories/           # Base + специфічні
│   │
│   ├── common/                     # 📦 Спільне
│   │   ├── types/                  # Загальні типи
│   │   ├── middleware/             # Auth, Validation, Error
│   │   └── utils/                  # Logger, ApiResponder, JWT
│   │
│   ├── config/                     # ⚙️ Конфігурація
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   │
│   ├── app.ts                      # Express app
│   └── index.ts                    # Entry point
│
├── legacy/                         # 📜 Старий JavaScript код
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── helpers/
│   ├── db/
│   ├── core/
│   └── README.md
│
├── .env.example
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

---

## 🔗 Корисні ресурси

### Документація

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Express Docs](https://expressjs.com/)

### Best Practices

- [Repository Pattern](https://www.dotnettricks.com/learn/repository-pattern)
- [Mongoose Best Practices](https://mongoosejs.com/docs/guide.html)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/data-modeling/)

---

## 📞 Контакти

**Виконавець:** Алиса  
**GitHub:** [VladimirSt13/rack_calculator](https://github.com/VladimirSt13/rack_calculator)  
**Гілка:** `feature/change-db-to-mongodb`

---

**Останнє оновлення:** 17 березня 2026  
**Статус:** ✅ **ЗАВЕРШЕНО**  
**Прогрес:** 16/16 етапів (100%)
