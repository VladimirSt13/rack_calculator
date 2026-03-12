# Rack Calculator v2.0

Калькулятор стелажів та підбору акумуляторів для компанії "Акку-енерго"

**Дата оновлення:** 11 березня 2026
**Статус:** Phase 3 ✅ Етапи 13-18 завершено
**[📊 Поточний статус](./STATUS.md)**

## 🏗️ Архітектура

### Monorepo структура

```
rack_calculator/
├── client/          # React додаток (Vite + TypeScript)
├── server/          # Express API (SQLite)
├── shared/          # Спільна бізнес-логіка
├── legacy/          # Vanilla JS проєкт (тимчасово)
└── package.json     # Root workspace
```

### Технології

**Frontend (client/):**
- React 18 + TypeScript
- React Router DOM 6
- TanStack Query 5
- Zustand 4
- React Hook Form 7 + Zod
- Axios
- TailwindCSS + Radix UI

**Backend (server/):**
- Express 4
- SQLite (better-sqlite3)
- JWT + Refresh Tokens
- bcryptjs
- Helmet + Rate Limit
- **Roles & Permissions (БД)**
- **12 моделей даних**
- **16 міграцій БД**

## 🚀 Швидкий старт

### Вимоги

- Node.js >= 18.0.0
- npm >= 9.0.0

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
│   ├── pages/         # LoginPage, RegisterPage, RackPage, BatteryPage
│   ├── features/      # auth/, rack/, battery/
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
│   ├── controllers/   # auth, rack, battery, price, roles
│   ├── routes/        # API routes
│   ├── middleware/    # auth, authorizeRole
│   ├── helpers/       # roles, audit, email
│   ├── db/            # SQLite + migrations
│   └── core/          # Constants
├── data/              # SQLite database
├── docs/              # Серверна документація
└── scripts/           # migrate, seed-admin
```

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Реєстрація | ❌ |
| POST | `/api/auth/login` | Вхід | ❌ |
| POST | `/api/auth/logout` | Вихід | ✅ |
| POST | `/api/auth/refresh` | Refresh token | ❌ |
| POST | `/api/auth/verify-email` | Підтвердження email | ❌ |
| GET | `/api/auth/me` | Поточний користувач | ✅ |

### Roles (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | Список ролей |
| PUT | `/api/roles/:name/permissions` | Оновити дозволи |
| PUT | `/api/roles/:name/price-types` | Оновити типи цін |
| POST | `/api/roles` | Створити роль |

### Rack Calculations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rack/calculate` | Розрахунок стелажа |
| POST | `/api/rack/calculate-batch` | Масовий розрахунок |

### Battery Calculations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/battery/calculate` | Розрахунок по батареї |
| POST | `/api/battery/find-best` | Підбір варіанту |

## 🔐 Ролі та доступ

### Ролі

| Роль | Доступ | Ціни |
|------|--------|------|
| **admin** | Всі сторінки | Всі |
| **manager** | Тільки Акумулятор | Тільки нульова |
| **user** | Access Denied | Немає доступу |

### Тестові користувачі

| Email | Пароль | Роль |
|-------|--------|------|
| admin@vs.com | P@ssw0rd13 | admin |
| manager@test.com | 123456 | manager |
| user@test.com | 123456 | user |

## 📚 Документація

### Поточний статус
- [STATUS.md](./STATUS.md) - **📊 Поточний статус проекту**

### Плани розробки
- [plan-server.md](./plan-server.md) - План розробки: Серверна частина
- [plan-client.md](./plan-client.md) - План розробки: Клієнтська частина

### Server
- [ROLES_AND_PERMISSIONS.md](./server/docs/ROLES_AND_PERMISSIONS.md) - Ролі та дозволи
- [PRICING.md](./server/docs/PRICING.md) - Система цін
- [MIGRATIONS_GUIDE.md](./server/docs/MIGRATIONS_GUIDE.md) - Міграції БД
- [PASSWORD_RESET.md](./server/docs/PASSWORD_RESET.md) - Відновлення пароля
- [AUDIT_MANAGEMENT.md](./server/docs/AUDIT_MANAGEMENT.md) - Журнал аудиту

### Client
- [ROUTES.md](./client/docs/ROUTES.md) - Маршрути
- [STAGE_3_COMPLETE.md](./client/docs/STAGE_3_COMPLETE.md) - Авторизація
- [COMPONENTS.md](./client/COMPONENTS.md) - Компоненти
- [DESIGN_SYSTEM.md](./client/DESIGN_SYSTEM.md) - Дизайн система

### Загальна
- [CONVENTIONS.md](./docs/CONVENTIONS.md) - Конвенції проєкту
- [docs/AUDIT_REPORT.md](./docs/AUDIT_REPORT.md) - Аудит відповідності конвенціям
- [docs/CLIENT_AUDIT.md](./docs/CLIENT_AUDIT.md) - Аналіз клієнта
- [docs/EXPORT_FIX.md](./docs/EXPORT_FIX.md) - Виправлення експорту
- [docs/DB_NORMALIZATION_AUDIT.md](./docs/DB_NORMALIZATION_AUDIT.md) - Нормалізація БД
- [docs/BATTERY_PAGE_AUDIT.md](./docs/BATTERY_PAGE_AUDIT.md) - Аудит Battery сторінки
- **[docs/battery-algorithm.md](./docs/battery-algorithm.md) - Алгоритм підбору стелажей для акумуляторів**

## 🛠️ Корисні команди

### Server

```bash
# Міграції
npm run migrate          # Запуск міграцій
npm run migrate:status   # Статус міграцій
npm run migrate:rollback # Відкат міграції

# Адмін
npm run seed:admin       # Створити адмінів

# Cleanup скрипти
npm run audit:cleanup    # Очистити аудит (90 днів)
npm run audit:cleanup 30 # Очистити аудит (30 днів)
npm run token:cleanup    # Очистити застарілі токени (30 днів)
npm run cleanup:deleted  # Очистити видалені об'єкти (30 днів)
```

### Client

```bash
npm run build            # Збірка
npm run typecheck        # Перевірка типів
```

### Разом

```bash
npm run dev              # Обидва одночасно
npm run install:all      # Встановити все
```

## 📄 Ліцензія

MIT
