# 📘 План міграції на TypeScript

**Дата створення:** 15 березня 2026  
**Статус:** Планування  
**Гілка:** `feature/change-db-to-mongodb`

---

## 🎯 Огляд

Цей документ описує міграцію серверної частини з **JavaScript** на **TypeScript**.

**Переваги TypeScript:**

- ✅ Повна типізація коду
- ✅ Автодоповнення в IDE
- ✅ Менше багів на етапі розробки
- ✅ Краща підтримка коду
- ✅ Рефакторинг без болю

---

## 🏗️ Архітектура

### Шари (Layers)

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Request                         │
│                 { email, password }                     │
└─────────────────────────────────────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │   VALIDATION PIPE      │
              │   (class-validator)    │
              └────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │   ROUTES               │
              │   auth.routes.ts       │
              └────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │   CONTROLLER           │
              │   auth.controller.ts   │
              │   Input: LoginDto      │
              └────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │   SERVICE              │
              │   auth.service.ts      │
              │   Input/Output: Types  │
              └────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │   REPOSITORY           │
              │   auth.repository.ts   │
              │   Access to DB         │
              └────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │   DATABASE             │
              │   MongoDB (Mongoose)   │
              └────────────────────────┘
```

### Відповідальність шарів

| Шар            | Відповідальність                   | Приклад              |
| -------------- | ---------------------------------- | -------------------- |
| **Routes**     | Маршрутизація, middleware          | `auth.routes.ts`     |
| **Controller** | Обробка HTTP, валідація, відповіді | `auth.controller.ts` |
| **Service**    | Бізнес-логіка, координація         | `auth.service.ts`    |
| **Repository** | Доступ до БД, CRUD операції        | `auth.repository.ts` |
| **DTO**        | Типи для передачі даних            | `login.dto.ts`       |

---

## 🔄 Етапи міграції

### Етап 0: Налаштування TypeScript (1-2 дні)

#### 0.1 Встановлення залежностей

```bash
cd server
npm install typescript ts-node tsconfig-paths
npm install @types/node @types/express @types/cors @types/compression
npm install class-validator class-transformer
npm uninstall better-sqlite3
```

**Залежності:**

| Пакет               | Версія  | Призначення                         |
| ------------------- | ------- | ----------------------------------- |
| `typescript`        | ^5.3.0  | Компілятор TypeScript               |
| `ts-node`           | ^10.9.0 | Виконання TypeScript без компіляції |
| `tsconfig-paths`    | ^4.2.0  | Path aliases для імпортів           |
| `@types/node`       | ^20.0.0 | Типи для Node.js                    |
| `@types/express`    | ^4.17.0 | Типи для Express                    |
| `@types/cors`       | ^2.8.0  | Типи для CORS                       |
| `class-validator`   | ^0.14.0 | Валідація DTO                       |
| `class-transformer` | ^0.5.0  | Трансформація DTO                   |

#### 0.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false,
    "baseUrl": "./src",
    "paths": {
      "@modules/*": ["modules/*"],
      "@database/*": ["database/*"],
      "@common/*": ["common/*"],
      "@config/*": ["config/*"],
      "@shared/*": ["../../shared/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"],
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
}
```

#### 0.3 tsconfig.build.json (для продакшену)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "declaration": true,
    "declarationMap": true
  },
  "exclude": ["**/*.test.ts", "**/*.spec.ts"]
}
```

#### 0.4 Оновлення package.json

```json
{
  "scripts": {
    "dev:server": "ts-node --esm --experimental-specifier-resolution=node src/index.ts",
    "build:server": "tsc -p tsconfig.build.json",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts"
  }
}
```

---

### Етап 1: Base Repository (1-2 дні)

#### 1.1 Base Repository

```typescript
// database/repositories/base.repository.ts
import { Model, Document, FilterQuery, UpdateQuery, QueryOptions, Types } from 'mongoose';

export interface BaseEntity extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  deleted?: boolean;
  deletedAt?: Date | null;
}

export class BaseRepository<T extends BaseEntity> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findAll(filter?: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    const query = this.model.find(filter);
    if (options?.populate) query.populate(options.populate);
    if (options?.sort) query.sort(options.sort);
    if (options?.limit) query.limit(options.limit);
    return query.exec();
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = new this.model(data);
    return entity.save();
  }

  async update(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async softDelete(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() } as any, { new: true }).exec();
  }

  async restore(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, { deleted: false, deletedAt: null } as any, { new: true }).exec();
  }
}
```

---

### Етап 2: DTO та Типи (2-3 дні)

#### 2.1 Auth DTOs

```typescript
// modules/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

// modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

// modules/auth/dto/auth-response.dto.ts
export class AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export class UserPublicDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  permissions: string[];
  createdAt: Date;
}

export class AuthResponseDto {
  user: UserPublicDto;
  tokens: AuthTokensDto;
}

// modules/auth/dto/refresh-token.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
```

#### 2.2 Auth Types (Service & Repository)

```typescript
// modules/auth/auth.types.ts
import { Types } from 'mongoose';

// === Repository Layer Input Types ===
export interface FindUserByEmailInput {
  email: string;
  includeRole?: boolean;
  includePermissions?: boolean;
  includePassword?: boolean;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  roleId?: string | Types.ObjectId;
  firstName?: string;
  lastName?: string;
}

export interface CreateRefreshTokenInput {
  userId: string | Types.ObjectId;
  token: string;
  expiresAt: Date;
}

// === Service Layer Input/Output Types ===
export interface LoginServiceInput {
  email: string;
  password: string;
}

export interface RegisterServiceInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface RefreshTokenServiceInput {
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
  tokens: TokenPair;
}

// === Error Types ===
export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID',
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
```

#### 2.3 Common Types

```typescript
// common/types/api.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// common/types/common.types.ts
export type SortOrder = 'asc' | 'desc';

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface SortInput {
  sortBy: string;
  sortOrder: SortOrder;
}

export interface QueryInput extends PaginationInput, SortInput {
  [key: string]: any;
}
```

---

### Етап 3: Створення модулів (8-10 днів)

#### 3.1 Auth Module (приклад)

**auth.controller.ts:**

```typescript
// modules/auth/auth.controller.ts
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

**auth.service.ts:**

```typescript
// modules/auth/auth.service.ts
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { AuthResult, TokenPair, AuthError } from './auth.types';
import { JwtService } from '../../common/utils/jwt.service';
import * as bcrypt from 'bcrypt';

export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.authRepository.findByEmail({
      email: dto.email,
      includePassword: true,
      includeRole: true,
      includePermissions: true,
    });

    if (!user) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const tokens = await this.jwtService.generateTokenPair({
      userId: user._id.toHexString(),
      email: user.email,
    });

    return {
      user: {
        id: user._id.toHexString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (user.roleId as any)?.name || 'user',
        permissions: (user.roleId as any)?.permissions?.map((p: any) => p.name) || [],
      },
      tokens,
    };
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existingUser = await this.authRepository.findByEmail({
      email: dto.email,
    });

    if (existingUser) {
      throw new AuthError('Email already registered', 'USER_EXISTS');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.authRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    const tokens = await this.jwtService.generateTokenPair({
      userId: user._id.toHexString(),
      email: user.email,
    });

    return {
      user: {
        id: user._id.toHexString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'user',
        permissions: [],
      },
      tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthResult> {
    const payload = await this.jwtService.verifyRefreshToken(dto.refreshToken);

    const refreshTokenDoc = await this.authRepository.findRefreshToken(dto.refreshToken);

    if (!refreshTokenDoc || refreshTokenDoc.expiresAt < new Date()) {
      throw new AuthError('Invalid or expired refresh token', 'TOKEN_EXPIRED');
    }

    const user = await this.authRepository.findByEmail({
      email: payload.email,
      includeRole: true,
      includePermissions: true,
    });

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    const tokens = await this.jwtService.generateTokenPair({
      userId: user._id.toHexString(),
      email: user.email,
    });

    await this.authRepository.deleteRefreshToken(dto.refreshToken);
    await this.authRepository.createRefreshToken({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: user._id.toHexString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (user.roleId as any)?.name || 'user',
        permissions: (user.roleId as any)?.permissions?.map((p: any) => p.name) || [],
      },
      tokens,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(refreshToken);
  }
}
```

---

### Етап 4: Common Utils (1-2 дні)

#### 4.1 Async Handler

```typescript
// common/utils/async-handler.ts
import { Request, Response, NextFunction } from 'express';

export type AsyncHandlerType = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncHandlerType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

#### 4.2 JWT Service

```typescript
// common/utils/jwt.service.ts
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.config';

export interface JwtPayload {
  userId: string;
  email: string;
  roleId?: string;
}

export class JwtService {
  async generateTokenPair(payload: JwtPayload): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConfig.accessTokenExpiresIn,
    };
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessTokenExpiresIn,
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshTokenExpiresIn,
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return jwt.verify(token, jwtConfig.secret) as JwtPayload;
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
  }
}
```

#### 4.3 Validation Middleware

```typescript
// common/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';

export const validateRequest = (DtoClass: new () => any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(DtoClass, req.body);
      await validateOrReject(dto, { whitelist: true, forbidNonWhitelisted: true });
      req.body = dto;
      next();
    } catch (errors) {
      const formattedErrors = this.formatErrors(errors);
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: formattedErrors,
        },
      });
    }
  };
};

export class ValidationMiddleware {
  private static formatErrors(errors: ValidationError[]): any {
    return errors.map((error) => ({
      property: error.property,
      constraints: error.constraints,
      children: error.children?.map((child) => this.formatErrors([child])),
    }));
  }
}
```

---

## 📊 Порівняння: До і Після

### До (JavaScript)

```javascript
// controllers/authController.js
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  // ... логіка
};
```

### Після (TypeScript + DTO)

```typescript
// modules/auth/auth.controller.ts
login = asyncHandler(async (req: Request, res: Response) => {
  const dto: LoginDto = req.body; // Типізовано!
  const result = await this.authService.login(dto);
  res.json({ success: true, data: result });
});
```

### Переваги

| Перевага       | Опис                                |
| -------------- | ----------------------------------- |
| **TypeScript** | Автодоповнення, перевірка типів     |
| **DTO**        | Чіткий контракт, валідація на вході |
| **Типізація**  | Повна типізація між шарами          |

---

## ✅ Чеклист готовності

### Налаштування

- [ ] Встановлено TypeScript та залежності
- [ ] Створено `tsconfig.json`
- [ ] Оновлено `package.json` scripts
- [ ] Налаштовано path aliases

### Database Layer

- [ ] Створено `BaseRepository`
- [ ] Створено MongoDB connection
- [ ] Створено 12 Mongoose схем

### DTO & Types

- [ ] Створено DTO для Auth модуля
- [ ] Створено DTO для Users модуля
- [ ] Створено типи для Service layer
- [ ] Створено типи для Repository layer

### Модулі

- [ ] Auth module (controller, service, repository, routes)
- [ ] Users module
- [ ] Roles module
- [ ] Prices module
- [ ] RackConfigurations module
- [ ] RackSets module
- [ ] Calculations module
- [ ] Battery module
- [ ] Export module
- [ ] Audit module

### Тестування

- [ ] Typecheck (`tsc --noEmit`)
- [ ] Unit тести для сервісів
- [ ] Integration тести для API
- [ ] Ручне тестування

---

## 🔗 Пов'язані документи

- [FEATURE_BASED_STRUCTURE.md](./FEATURE_BASED_STRUCTURE.md) — структура проекту за модулями
- [MONGODB_MIGRATION_PLAN.md](./MONGODB_MIGRATION_PLAN.md) — план міграції на MongoDB

---

**Затверджено:** 15 березня 2026  
**Виконавець:** Алиса  
**Статус:** Готовий до реалізації
