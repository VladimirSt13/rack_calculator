# 📁 Feature-Based Структура Проекту

**Дата створення:** 15 березня 2026  
**Статус:** Планування  
**Гілка:** `feature/change-db-to-mongodb`

---

## 🎯 Огляд

Цей документ описує **Feature-Based** структуру проекту — організацію коду за функціональними модулями (features), а не за типами файлів.

---

## 📊 Порівняння підходів

### Layer-Based (поточний) ❌

```
server/
├── controllers/
│   ├── auth.controller.js
│   ├── users.controller.js
│   └── ...
├── services/
│   ├── auth.service.js
│   ├── users.service.js
│   └── ...
├── models/
│   ├── User.js
│   ├── Role.js
│   └── ...
└── routes/
    ├── auth.routes.js
    ├── users.routes.js
    └── ...
```

**Проблеми:**
- ❌ Файли одного модуля розкидані по різних папках
- ❌ Важко зрозуміти залежності між модулями
- ❌ Складно видаляти/переносити модулі
- ❌ Code review ускладнено

---

### Feature-Based (новий) ✅

```
server/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.types.ts
│   │   ├── dto/
│   │   └── index.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── users.routes.ts
│   │   ├── dto/
│   │   └── index.ts
│   └── ...
```

**Переваги:**
- ✅ Всі файли модуля в одному місці
- ✅ Легко знайти потрібне
- ✅ Легко видаляти/переносити модулі
- ✅ Краща когезія
- ✅ Зручно для code review

---

## 📁 Повна структура проекту

```
server/
├── src/
│   │
│   ├── modules/                        # 🎯 Feature-based модулі
│   │   │
│   │   ├── auth/                       # 🔐 Авторизація
│   │   │   ├── auth.controller.ts      # Обробка HTTP запитів
│   │   │   ├── auth.service.ts         # Бізнес-логіка
│   │   │   ├── auth.repository.ts      # Доступ до БД
│   │   │   ├── auth.routes.ts          # Маршрутизація
│   │   │   ├── auth.types.ts           # Типи модуля
│   │   │   ├── auth.validation.ts      # Валідація схем
│   │   │   ├── auth.constants.ts       # Константы
│   │   │   ├── dto/                    # Data Transfer Objects
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   ├── auth-response.dto.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts                # Публічний API модуля
│   │   │
│   │   ├── users/                      # 👥 Користувачі
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── users.types.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   ├── user-response.dto.ts
│   │   │   │   ├── user-query.dto.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── roles/                      # 🎭 Ролі та дозволи
│   │   │   ├── roles.controller.ts
│   │   │   ├── roles.service.ts
│   │   │   ├── roles.repository.ts
│   │   │   ├── roles.routes.ts
│   │   │   ├── roles.types.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-role.dto.ts
│   │   │   │   ├── update-role.dto.ts
│   │   │   │   ├── assign-permission.dto.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── prices/                     # 💰 Прайс-листи
│   │   │   ├── prices.controller.ts
│   │   │   ├── prices.service.ts
│   │   │   ├── prices.repository.ts
│   │   │   ├── prices.routes.ts
│   │   │   ├── prices.types.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-price.dto.ts
│   │   │   │   ├── update-price.dto.ts
│   │   │   │   ├── price-response.dto.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── rack-sets/                  # 📦 Комплекти стелажів
│   │   │   ├── rack-sets.controller.ts
│   │   │   ├── rack-sets.service.ts
│   │   │   ├── rack-sets.repository.ts
│   │   │   ├── rack-sets.routes.ts
│   │   │   ├── rack-sets.types.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-rack-set.dto.ts
│   │   │   │   ├── update-rack-set.dto.ts
│   │   │   │   ├── rack-set-response.dto.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── rack-configurations/        # 🔧 Конфігурації стелажів
│   │   │   ├── rack-configurations.controller.ts
│   │   │   ├── rack-configurations.service.ts
│   │   │   ├── rack-configurations.repository.ts
│   │   │   ├── rack-configurations.routes.ts
│   │   │   ├── rack-configurations.types.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-rack-configuration.dto.ts
│   │   │   │   ├── update-rack-configuration.dto.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── calculations/               # 🧮 Розрахунки
│   │   │   ├── calculations.controller.ts
│   │   │   ├── calculations.service.ts
│   │   │   ├── calculations.repository.ts
│   │   │   ├── calculations.routes.ts
│   │   │   ├── calculations.types.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-calculation.dto.ts
│   │   │   │   ├── calculation-response.dto.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── battery/                    # 🔋 Акумулятори
│   │   │   ├── battery.controller.ts
│   │   │   ├── battery.service.ts
│   │   │   ├── battery.repository.ts
│   │   │   ├── battery.routes.ts
│   │   │   ├── battery.types.ts
│   │   │   ├── dto/
│   │   │   │   ├── battery-calculation.dto.ts
│   │   │   │   ├── battery-response.dto.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── export/                     # 📊 Експорт Excel
│   │   │   ├── export.controller.ts
│   │   │   ├── export.service.ts
│   │   │   ├── export.routes.ts
│   │   │   ├── export.types.ts
│   │   │   ├── dto/
│   │   │   │   ├── export-request.dto.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   └── audit/                      # 📝 Аудит
│   │       ├── audit.controller.ts
│   │       ├── audit.service.ts
│   │       ├── audit.repository.ts
│   │       ├── audit.routes.ts
│   │       ├── audit.types.ts
│   │       ├── dto/
│   │       │   ├── audit-query.dto.ts
│   │       │   ├── audit-response.dto.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── database/                       # 🗄️ Робота з БД
│   │   ├── index.ts                    # MongoDB connection
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   └── index.ts
│   │   ├── models/                     # Mongoose схеми
│   │   │   ├── user.model.ts
│   │   │   ├── role.model.ts
│   │   │   ├── permission.model.ts
│   │   │   ├── price.model.ts
│   │   │   ├── rack-set.model.ts
│   │   │   ├── rack-set-revision.model.ts
│   │   │   ├── rack-configuration.model.ts
│   │   │   ├── refresh-token.model.ts
│   │   │   ├── email-verification.model.ts
│   │   │   ├── password-reset.model.ts
│   │   │   ├── audit-log.model.ts
│   │   │   ├── calculation.model.ts
│   │   │   └── index.ts
│   │   └── repositories/               # Репозиторії
│   │       ├── base.repository.ts
│   │       ├── user.repository.ts
│   │       ├── role.repository.ts
│   │       ├── price.repository.ts
│   │       ├── rack-set.repository.ts
│   │       └── index.ts
│   │
│   ├── common/                         # 📦 Спільне
│   │   ├── types/
│   │   │   ├── api.types.ts            # API Response types
│   │   │   ├── common.types.ts         # Загальні типи
│   │   │   ├── pagination.types.ts     # Пагінація
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts      # JWT перевірка
│   │   │   ├── role.middleware.ts      # Перевірка ролей
│   │   │   ├── error.middleware.ts     # Обробка помилок
│   │   │   ├── validation.middleware.ts # Валідація DTO
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── logger.ts               # Логер
│   │   │   ├── api-response.ts         # Helper для відповідей
│   │   │   ├── async-handler.ts        # Wrapper для async
│   │   │   ├── jwt.service.ts          # JWT сервіс
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── roles.ts                # Ролі
│   │   │   ├── permissions.ts          # Дозволи
│   │   │   ├── error-codes.ts          # Коди помилок
│   │   │   └── index.ts
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts     # Публічні роути
│   │   │   ├── roles.decorator.ts      # Ролі декоратори
│   │   │   └── index.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── index.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── index.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   └── index.ts
│   │   └── pipes/
│   │       ├── validation.pipe.ts
│   │       ├── parse-int.pipe.ts
│   │       └── index.ts
│   │
│   ├── config/                         # ⚙️ Конфігурація
│   │   ├── app.config.ts               # Налаштування додатку
│   │   ├── database.config.ts          # Налаштування БД
│   │   ├── jwt.config.ts               # JWT налаштування
│   │   ├── cors.config.ts              # CORS налаштування
│   │   └── index.ts
│   │
│   ├── app.ts                          # Express app
│   └── index.ts                        # Точка входу
│
├── shared/                             # 🔄 Спільне з клієнтом
│   ├── types/
│   │   ├── rack.types.ts
│   │   ├── battery.types.ts
│   │   ├── calculator.types.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── rack-calculator.ts
│   │   ├── battery-rack-builder.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── rack.constants.ts
│   │   └── index.ts
│   └── dto/
│       ├── rack-calculation.dto.ts
│       ├── battery-calculation.dto.ts
│       └── index.ts
│
├── scripts/                            # 🛠️ Скрипти
│   ├── migrate-data.ts                 # Міграція даних
│   ├── seed-admin.ts                   # Створення адміна
│   └── ...
│
├── tests/                              # 🧪 Тести
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

---

## 📦 Опис модулів

### Auth Module

**Призначення:** Авторизація та аутентифікація користувачів

**Файли:**
| Файл | Призначення |
|------|-------------|
| `auth.controller.ts` | Обробка HTTP запитів (login, register, logout, refresh) |
| `auth.service.ts` | Бізнес-логіка авторизації |
| `auth.repository.ts` | Доступ до БД (користувачі, токени) |
| `auth.routes.ts` | Маршрути (`/api/auth/*`) |
| `auth.types.ts` | Типи для сервісу та репозиторію |
| `dto/` | DTO для запитів та відповідей |

**API Endpoints:**
- `POST /api/auth/login` — вхід
- `POST /api/auth/register` — реєстрація
- `POST /api/auth/refresh` — оновлення токену
- `POST /api/auth/logout` — вихід
- `POST /api/auth/forgot-password` — відновлення пароля
- `POST /api/auth/reset-password` — скидання пароля

---

### Users Module

**Призначення:** Управління користувачами (CRUD)

**Файли:**
| Файл | Призначення |
|------|-------------|
| `users.controller.ts` | Обробка HTTP запитів |
| `users.service.ts` | Бізнес-логіка |
| `users.repository.ts` | Доступ до БД |
| `users.routes.ts` | Маршрути (`/api/users/*`) |
| `users.types.ts` | Типи |
| `dto/` | DTO |

**API Endpoints:**
- `GET /api/users` — список користувачів
- `GET /api/users/:id` — користувач за ID
- `POST /api/users` — створити користувача
- `PATCH /api/users/:id` — оновити користувача
- `DELETE /api/users/:id` — видалити користувача

---

### Roles Module

**Призначення:** Управління ролями та дозволами

**API Endpoints:**
- `GET /api/roles` — список ролей
- `POST /api/roles` — створити роль
- `PATCH /api/roles/:id` — оновити роль
- `DELETE /api/roles/:id` — видалити роль
- `POST /api/roles/:id/permissions` — дозволити дозвіл
- `DELETE /api/roles/:id/permissions` — видалити дозвіл

---

### Prices Module

**Призначення:** Управління прайс-листами

**API Endpoints:**
- `GET /api/prices` — отримати поточний прайс
- `GET /api/prices/history` — історія змін
- `POST /api/prices` — створити новий прайс
- `PATCH /api/prices/:id` — оновити прайс

---

### RackSets Module

**Призначення:** Управління комплектами стелажів

**API Endpoints:**
- `GET /api/rack-sets` — список комплектів
- `GET /api/rack-sets/:id` — комплект за ID
- `POST /api/rack-sets` — створити комплект
- `PATCH /api/rack-sets/:id` — оновити комплект
- `DELETE /api/rack-sets/:id` — видалити комплект (soft delete)
- `POST /api/rack-sets/:id/restore` — відновити комплект
- `GET /api/rack-sets/deleted` — список видалених

---

### RackConfigurations Module

**Призначення:** Конфігурації стелажів (типові конфігурації)

**API Endpoints:**
- `GET /api/rack-configurations` — список конфігурацій
- `POST /api/rack-configurations` — створити конфігурацію
- `PATCH /api/rack-configurations/:id` — оновити конфігурацію
- `DELETE /api/rack-configurations/:id` — видалити конфігурацію

---

### Calculations Module

**Призначення:** Збережені розрахунки користувачів

**API Endpoints:**
- `GET /api/calculations` — список розрахунків користувача
- `POST /api/calculations` — зберегти розрахунок
- `DELETE /api/calculations/:id` — видалити розрахунок

---

### Battery Module

**Призначення:** Розрахунок стелажів для акумуляторів

**API Endpoints:**
- `POST /api/battery/calculate` — розрахувати стелаж для батареї
- `GET /api/battery/batteries` — список батарей

---

### Export Module

**Призначення:** Експорт даних в Excel

**API Endpoints:**
- `POST /api/export/rack-sets` — експорт комплекту
- `POST /api/export/prices` — експорт прайсу

---

### Audit Module

**Призначення:** Журнал аудиту дій користувачів

**API Endpoints:**
- `GET /api/audit` — список записів аудиту
- `DELETE /api/audit/cleanup` — очистка старих записів

---

## 📄 Приклад структури модуля

### Auth Module (детально)

```
modules/auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.repository.ts
├── auth.routes.ts
├── auth.types.ts
├── auth.constants.ts
├── auth.validation.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   ├── refresh-token.dto.ts
│   ├── auth-response.dto.ts
│   └── index.ts
└── index.ts
```

#### auth.controller.ts

```typescript
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { asyncHandler } from '../../common/utils/async-handler';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = asyncHandler(async (req: Request, res: Response) => {
    const dto: LoginDto = req.body;
    const result = await this.authService.login(dto);
    res.json({ success: true, data: result });
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const dto: RegisterDto = req.body;
    const result = await this.authService.register(dto);
    res.status(201).json({ success: true, data: result });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const dto: RefreshTokenDto = req.body;
    const result = await this.authService.refreshToken(dto);
    res.json({ success: true, data: result });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    await this.authService.logout(refreshToken);
    res.json({ success: true, message: 'Logged out successfully' });
  });
}
```

#### auth.service.ts

```typescript
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { AuthResult, TokenPair } from './auth.types';
import { JwtService } from '../../common/utils/jwt.service';
import * as bcrypt from 'bcrypt';

export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResult> {
    // ... бізнес-логіка
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    // ... бізнес-логіка
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthResult> {
    // ... бізнес-логіка
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(refreshToken);
  }
}
```

#### auth.repository.ts

```typescript
import { BaseRepository } from '../../database/repositories/base.repository';
import { User, IUserDocument } from '../../database/models/user.model';
import { Model } from 'mongoose';
import { FindUserByEmailInput, CreateUserInput } from './auth.types';

export class AuthRepository extends BaseRepository<User> {
  constructor(private userModel: Model<IUserDocument>) {
    super(userModel);
  }

  async findByEmail(input: FindUserByEmailInput): Promise<User | null> {
    // ... доступ до БД
  }

  async create(input: CreateUserInput): Promise<User> {
    // ... доступ до БД
  }
}
```

#### auth.routes.ts

```typescript
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { User } from '../../database/models/user.model';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { authenticate } from '../../common/middleware/auth.middleware';

export const authRoutes = Router();

const authRepository = new AuthRepository(User);
const authService = new AuthService(authRepository, new JwtService());
const authController = new AuthController(authService);

authRoutes.post('/login', validateRequest(LoginDto), authController.login);
authRoutes.post('/register', validateRequest(RegisterDto), authController.register);
authRoutes.post('/refresh', validateRequest(RefreshTokenDto), authController.refreshToken);
authRoutes.post('/logout', authenticate, authController.logout);
```

#### dto/index.ts

```typescript
export { LoginDto } from './login.dto';
export { RegisterDto } from './register.dto';
export { RefreshTokenDto } from './refresh-token.dto';
export { AuthResponseDto, AuthTokensDto, UserPublicDto } from './auth-response.dto';
```

#### index.ts (публічний API модуля)

```typescript
export { AuthController } from './auth.controller';
export { AuthService } from './auth.service';
export { AuthRepository } from './auth.repository';
export { authRoutes } from './auth.routes';
export * from './dto';
export * from './auth.types';
```

---

## 🎯 Принципи організації

### 1. Один модуль = одна папка

Всі файли, що відносяться до одного модуля, повинні бути в одній папці.

### 2. Інкапсуляція

Модулі не повинні мати прямих залежностей між собою. Використовуйте спільні сервіси через `common/`.

### 3. Публічний API

Кожен модуль експортує тільки необхідне через `index.ts`.

### 4. Спільне в common/

Все спільне (middleware, utils, types) має бути в `common/`.

### 5. Спільне з клієнтом в shared/

Типи, утиліти та константи, що використовуються і на клієнті, і на сервері.

---

## ✅ Чеклист міграції на Feature-Based

- [ ] Створити папку `modules/`
- [ ] Перемістити Auth модуль
- [ ] Перемістити Users модуль
- [ ] Перемістити Roles модуль
- [ ] Перемістити Prices модуль
- [ ] Перемістити RackSets модуль
- [ ] Перемістити RackConfigurations модуль
- [ ] Перемістити Calculations модуль
- [ ] Перемістити Battery модуль
- [ ] Перемістити Export модуль
- [ ] Перемістити Audit модуль
- [ ] Створити `database/` з моделями та репозиторіями
- [ ] Створити `common/` зі спільними утилітами
- [ ] Оновити імпорти в файлах
- [ ] Перевірити що все компілюється

---

## 🔗 Пов'язані документи

- [TYPESCRIPT_REFACTORING_PLAN.md](./TYPESCRIPT_REFACTORING_PLAN.md) — план міграції на TypeScript
- [MONGODB_MIGRATION_PLAN.md](./MONGODB_MIGRATION_PLAN.md) — план міграції на MongoDB

---

**Затверджено:** 15 березня 2026  
**Виконавець:** Алиса  
**Статус:** Готовий до реалізації
