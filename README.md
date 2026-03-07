# Rack Calculator v2.0

Калькулятор стелажів та підбору акумуляторів для компанії "Акку-енерго"

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

### Server

- [ROLES_AND_PERMISSIONS.md](./server/docs/ROLES_AND_PERMISSIONS.md) - Ролі та дозволи
- [MIGRATIONS_GUIDE.md](./server/docs/MIGRATIONS_GUIDE.md) - Міграції БД
- [PASSWORD_RESET.md](./server/docs/PASSWORD_RESET.md) - Відновлення пароля
- [ROLES_AND_ACCESS.md](./server/docs/ROLES_AND_ACCESS.md) - Доступ за ролями

### Client

- [ROUTES.md](./client/docs/ROUTES.md) - Маршрути
- [STAGE_3_COMPLETE.md](./client/docs/STAGE_3_COMPLETE.md) - Авторизація

### Загальна

- [MODERNIZATION_PLAN.md](./MODERNIZATION_PLAN.md) - План модернізації
- [CONVENTIONS.md](./CONVENTIONS.md) - Конвенції проєкту

## 🛠️ Корисні команди

```bash
# Server
npm run migrate          # Запуск міграцій
npm run migrate:status   # Статус міграцій
npm run seed:admin       # Створити адмінів

# Client
npm run build            # Збірка
npm run typecheck        # Перевірка типів
```

## 📄 Ліцензія

MIT
