# Rack Calculator v2.0

Калькулятор стелажів та підбору акумуляторів для компанії "Акку-енерго"

## 🏗️ Архітектура

### Monorepo структура

```
rack_calculator/
├── client/          # React додаток (Vite)
├── server/          # Express API (SQLite)
├── shared/          # Спільна бізнес-логіка
├── legacy/          # Vanilla JS проєкт (тимчасово)
└── package.json     # Root workspace
```

### Технології

**Frontend (client/):**
- React 18
- React Router DOM 6
- TanStack Query 5
- Zustand 4
- React Hook Form 7 + Zod
- Axios
- Lucide React

**Backend (server/):**
- Express 4
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- bcryptjs
- Helmet + rate-limit

## 🚀 Швидкий старт

### Вимоги

- Node.js >= 18.0.0
- npm >= 9.0.0

### Встановлення

```bash
# Встановити всі залежності
npm install

# Або для кожного воркспейсу окремо
npm install --workspaces
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

# Або окремо
npm run build:client
npm run build:server
```

### Тестування

```bash
npm test
```

## 📁 Структура проєкту

### Client

```
client/
├── src/
│   ├── app/           # App.jsx, providers
│   ├── pages/         # RackPage.jsx, BatteryPage.jsx
│   ├── features/      # rack/, battery/
│   ├── shared/        # UI компоненти
│   ├── core/          # Бізнес-логіка
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Axios instance
│   └── main.jsx
├── index.html
└── package.json
```

### Server

```
server/
├── src/
│   ├── routes/        # API routes
│   ├── controllers/   # Controllers
│   ├── db/            # SQLite + migrations
│   ├── middleware/    # Auth, error handlers
│   └── index.js
├── data/              # SQLite database
├── backups/           # Резервні копії
└── .env
```

### Shared

```
shared/
└── rackCalculator.js  # Спільна бізнес-логіка
```

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Реєстрація |
| POST | `/api/auth/login` | Вхід |
| POST | `/api/auth/logout` | Вихід |
| GET | `/api/auth/me` | Поточний користувач |

### Price

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/price` | Отримати прайс |
| PUT | `/api/price` | Оновити прайс (auth) |
| POST | `/api/price/upload` | Завантажити з файлу (auth) |

### Calculations (auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calculations` | Список розрахунків |
| POST | `/api/calculations` | Зберегти розрахунок |
| GET | `/api/calculations/:id` | Отримати розрахунок |
| DELETE | `/api/calculations/:id` | Видалити розрахунок |

## 🔐 Безпека

### Змінні оточення (server/.env)

```bash
NODE_ENV=development
PORT=3001
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

### Middleware

- **Helmet** - security headers
- **CORS** - обмеження домену
- **Rate Limit** - 100 запитів / 15 хв
- **JWT** - авторизація токенів

## 📝 Конвенції

### Іменування

| Тип | Конвенція | Приклад |
|-----|-----------|---------|
| Файли | `kebab-case.jsx` | `rack-page.jsx` |
| Компоненти | `PascalCase.jsx` | `RackForm.jsx` |
| Функції | `camelCase` | `calculateRack` |
| Константи | `UPPER_SNAKE_CASE` | `API_BASE_URL` |

## 🧪 Міграція з Legacy

Поточний Vanilla JS проєкт знаходиться в `legacy/`. Поступова міграція:

1. ✅ Бізнес-логіка перенесена в `shared/rackCalculator.js`
2. ⏳ Rack Page → `client/src/pages/RackPage.jsx`
3. ⏳ Battery Page → `client/src/pages/BatteryPage.jsx`

## 📚 Корисні посилання

- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

## 📄 Ліцензія

MIT
