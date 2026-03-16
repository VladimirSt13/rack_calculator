# 🍄 План міграції на MongoDB

**Дата створення:** 15 березня 2026  
**Статус:** Планування  
**Гілка:** `feature/change-db-to-mongodb`

---

## 🎯 Огляд

Міграція з **SQLite (better-sqlite3)** на **MongoDB (Mongoose)** збереже поточну функціональність:

- REST API на Express
- Система авторизації з ролями
- Обчислення стелажів та акумуляторів
- Експорт в Excel
- Журнал аудиту
- 12 моделей даних

---

## 📊 Поточна структура БД (SQLite)

### Таблиці (15)

| Таблиця               | Призначення             | Ключові поля                                           |
| --------------------- | ----------------------- | ------------------------------------------------------ |
| `users`               | Користувачі             | id, email, password_hash, role_id, created_at          |
| `roles`               | Ролі                    | id, name, created_at                                   |
| `permissions`         | Дозволи                 | id, name, description                                  |
| `role_permissions`    | Зв'язок ролей/дозволів  | role_id, permission_id                                 |
| `prices`              | Прайс-листи             | id, data (JSON), updated_at                            |
| `price_components`    | Компоненти прайсу       | id, name, category, data (JSON)                        |
| `refresh_tokens`      | Refresh токени          | id, user_id, token, expires_at                         |
| `email_verifications` | Підтвердження email     | id, user_id, token, expires_at                         |
| `password_resets`     | Скидання пароля         | id, user_id, token, expires_at                         |
| `rack_sets`           | Комплекти стелажів      | id, user_id, name, revision_id, created_at             |
| `rack_set_revisions`  | Історія змін комплектів | id, rack_set_id, revision_number, racks (JSON)         |
| `rack_configurations` | Конфігурації стелажів   | id, name, type, components (JSON)                      |
| `rack_items`          | Елементи комплектів     | id, rack_set_id, rack_id, configuration_id             |
| `audit_log`           | Журнал аудиту           | id, user_id, action, entity_type, entity_id, timestamp |
| `calculations`        | Збережені розрахунки    | id, user_id, name, data (JSON), type                   |

### Міграції (17)

```
001_add_roles_to_users.js
002_create_refresh_tokens.js
003_create_email_verifications.js
004_create_rack_sets.js
005_create_rack_set_revisions.js
006_create_audit_log.js
007_create_password_resets.js
008_update_role_constraint.js
009_create_roles_permissions.js
010_add_audit_indexes.js
011_create_rack_configurations.js
012_remove_racks_column.js
013_rename_rack_items_new_to_rack_items.js
014_add_braces_to_rack_configurations.js
015_add_soft_delete_and_spans_hash.js
016_cleanup_deprecated_fields.js
017_add_category_to_prices.js
```

---

## 🔄 Етапи міграції

### Етап 1: Підготовка (2-3 дні)

#### 1.1 Встановлення залежностей

```bash
cd server
npm install mongoose mongodb
npm uninstall better-sqlite3
```

**Залежності:**

- `mongoose` ^8.0.0 - ODM для MongoDB
- `mongodb` ^6.0.0 - офіційний драйвер

#### 1.2 Налаштування оточення

**.env:**

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/rack_calculator
MONGODB_DB_NAME=rack_calculator

# Старий DB (для міграції даних)
SQLITE_DB_PATH=./data/rack_calculator.db

# Існуючі налаштування
JWT_SECRET=...
JWT_REFRESH_SECRET=...
```

---

### Етап 2: Створення MongoDB схем (3-4 дні)

#### 2.1 Список схем для створення

| Модель              | Файл                                          | Складність | Особливості                             |
| ------------------- | --------------------------------------------- | ---------- | --------------------------------------- |
| `User`              | `database/models/user.model.ts`               | 🟢 Низька  | Soft delete, passwordHash select: false |
| `Role`              | `database/models/role.model.ts`               | 🟢 Низька  | Populate permissions                    |
| `Permission`        | `database/models/permission.model.ts`         | 🟢 Низька  | -                                       |
| `Price`             | `database/models/price.model.ts`              | 🟡 Середня | JSON data, category                     |
| `AuditLog`          | `database/models/audit-log.model.ts`          | 🟡 Середня | Індекси для фільтрів                    |
| `RefreshToken`      | `database/models/refresh-token.model.ts`      | 🟢 Низька  | TTL індекс, expiresAt                   |
| `EmailVerification` | `database/models/email-verification.model.ts` | 🟢 Низька  | TTL індекс, expiresAt                   |
| `PasswordReset`     | `database/models/password-reset.model.ts`     | 🟢 Низька  | TTL індекс, expiresAt                   |
| `RackSet`           | `database/models/rack-set.model.ts`           | 🟠 Висока  | Soft delete, populate user              |
| `RackSetRevision`   | `database/models/rack-set-revision.model.ts`  | 🟡 Середня | JSON racks, revision number             |
| `RackConfiguration` | `database/models/rack-configuration.model.ts` | 🟡 Середня | JSON components                         |
| `Calculation`       | `database/models/calculation.model.ts`        | 🟡 Середня | JSON data, type enum                    |

#### 2.2 Приклад схеми (User)

```typescript
// database/models/user.model.ts
import mongoose, { Document, Types } from 'mongoose';

export interface IUser {
  _id?: Types.ObjectId;
  email: string;
  passwordHash: string;
  roleId?: Types.ObjectId | null;
  emailVerified: boolean;
  verificationToken?: string | null;
  createdAt: Date;
  deleted?: boolean;
  deletedAt?: Date | null;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Віртуальне поле для id
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Методи екземпляра
userSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

userSchema.methods.restore = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

// Статичні методи
userSchema.statics.cleanupDeleted = async function (days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.deleteMany({
    deleted: true,
    deletedAt: { $lte: cutoffDate },
  });
  return result.deletedCount;
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
```

#### 2.3 TTL індекси для автоматичного видалення

```typescript
// refresh-token.model.ts
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// email-verification.model.ts
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// password-reset.model.ts
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

### Етап 3: Database Connection (1-2 дні)

#### 3.1 MongoDB Connection

```typescript
// database/index.ts
import mongoose from 'mongoose';
import { databaseConfig } from '../config/database.config';

let isConnected = false;

export const initDatabase = async (): Promise<void> => {
  if (isConnected) return;

  try {
    await mongoose.connect(databaseConfig.uri, {
      dbName: databaseConfig.dbName,
    });

    isConnected = true;
    console.log('[Database] MongoDB connected:', mongoose.connection.name);

    mongoose.connection.on('error', (error) => {
      console.error('[Database] Connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected');
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await closeDatabase();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB disconnected');
  }
};
```

---

### Етап 4: Міграція даних (2-3 дні)

#### 4.1 Скрипт міграції даних

```typescript
// scripts/migrate-data.ts
import sqlite3 from 'better-sqlite3';
import mongoose from 'mongoose';
import { User } from '../src/database/models/user.model';
import { Role } from '../src/database/models/role.model';
// ... інші моделі

const SQLITE_PATH = './data/rack_calculator.db';
const MONGODB_URI = 'mongodb://localhost:27017/rack_calculator';

const migrateData = async () => {
  // Підключення до SQLite
  const sqliteDb = sqlite3(SQLITE_PATH);

  // Підключення до MongoDB
  await mongoose.connect(MONGODB_URI);

  try {
    // Міграція користувачів
    console.log('Migrating users...');
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const user of users) {
      await User.create({
        email: user.email,
        passwordHash: user.password_hash,
        roleId: user.role_id,
        emailVerified: user.email_verified || false,
        createdAt: user.created_at,
      });
    }

    // Міграція ролей
    console.log('Migrating roles...');
    const roles = sqliteDb.prepare('SELECT * FROM roles').all();
    for (const role of roles) {
      await Role.create({
        name: role.name,
        createdAt: role.created_at,
      });
    }

    // ... інші таблиці

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    sqliteDb.close();
    await mongoose.disconnect();
  }
};

migrateData();
```

#### 4.2 Послідовність міграції

1. `roles` → `Role`
2. `permissions` → `Permission`
3. `users` → `User`
4. `role_permissions` → (зв'язок в Role)
5. `prices` → `Price`
6. `price_components` → `PriceComponent`
7. `refresh_tokens` → `RefreshToken`
8. `email_verifications` → `EmailVerification`
9. `password_resets` → `PasswordReset`
10. `rack_configurations` → `RackConfiguration`
11. `rack_sets` → `RackSet`
12. `rack_set_revisions` → `RackSetRevision`
13. `rack_items` → `RackItem`
14. `audit_log` → `AuditLog`
15. `calculations` → `Calculation`

---

### Етап 5: Тестування (2-3 дні)

#### 5.1 Перевірка цілісності даних

- [ ] Кількість записів у SQLite = кількість документів у MongoDB
- [ ] Зв'язки між документами працюють (populate)
- [ ] Індекси створені правильно
- [ ] TTL індекси працюють

#### 5.2 Тестування функціональності

- [ ] Авторизація працює з новою БД
- [ ] CRUD операції для користувачів
- [ ] CRUD операції для комплектів стелажів
- [ ] Експорт в Excel працює
- [ ] Аудит лог записується

---

### Етап 6: Деплой (1-2 дні)

#### 6.1 MongoDB Atlas (Production)

```env
# Production .env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/rack_calculator
MONGODB_DB_NAME=rack_calculator
```

#### 6.2 Docker (опціонально)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  app:
    build: .
    ports:
      - '5000:5000'
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/rack_calculator
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

---

## 📅 Орієнтовні терміни

| Етап  | Опис                   | Термін  | Пріоритет   |
| ----- | ---------------------- | ------- | ----------- |
| **1** | Підготовка             | 2-3 дні | 🔴 Високий  |
| **2** | Створення схем MongoDB | 3-4 дні | 🔴 Високий  |
| **3** | Database Connection    | 1-2 дні | 🔴 Високий  |
| **4** | Міграція даних         | 2-3 дні | 🔴 Високий  |
| **5** | Тестування             | 2-3 дні | 🔴 Високий  |
| **6** | Деплой                 | 1-2 дні | 🟠 Середній |

**Загальний термін:** **11-17 днів** (2-3 тижні)

---

## ⚠️ Ризики та проблеми

### Ризик 1: Втрата даних при міграції

**Мітігація:**

- Зробити повний бекап SQLite БД
- Створити тестову копію даних
- Провести міграцію на тестовому оточенні
- Перевірити цілісність даних після міграції

### Ризик 2: Несумісність JSON полів

**Мітігація:**

- MongoDB нативно підтримує JSON (BSON)
- Перевірити серіалізацію/десеріалізацію
- Тестувати на реальних даних

### Ризик 3: Soft delete логіка

**Мітігація:**

- Уважно перенести логіку soft delete з SQLite
- Додати індекси на поле `deleted`
- Перевірити всі запити з фільтрацією

### Ризик 4: Продуктивність

**Мітігація:**

- Створити індекси на часто використовуваних полях
- Використовувати `.lean()` для великих вибірок
- Моніторити продуктивність після деплою

---

## ✅ Чеклист готовності

### Підготовка

- [ ] Встановлено MongoDB локально
- [ ] Створено тестову БД
- [ ] Встановлено `mongoose`
- [ ] Оновлено `.env`

### Розробка

- [ ] Створено 12 Mongoose схем
- [ ] Створено MongoDB connection
- [ ] Налаштовано TTL індекси

### Міграція даних

- [ ] Написано скрипт міграції
- [ ] Проведено міграцію на тестових даних
- [ ] Перевірено цілісність даних
- [ ] Створено бекап SQLite БД

### Тестування

- [ ] Перевірено цілісність даних
- [ ] Тестування функціональності
- [ ] Ручне тестування завершено

### Деплой

- [ ] MongoDB Atlas налаштовано
- [ ] Змінні оточення оновлено
- [ ] Деплой на production
- [ ] Моніторинг продуктивності

---

## 📚 Корисні ресурси

### Документація

- [Mongoose Docs](https://mongoosejs.com/docs/)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [MongoDB vs SQLite](https://www.mongodb.com/resources/basics/databases/sql-vs-nosql)

### Міграція

- [MongoDB Data Import](https://www.mongodb.com/docs/database-tools/mongoimport/)
- [Mongoose Migrations](https://mongoosejs.com/docs/guides.html)

### Best Practices

- [Mongoose Best Practices](https://mongoosejs.com/docs/guide.html)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/data-modeling/)

---

## 🔗 Пов'язані документи

- [TYPESCRIPT_REFACTORING_PLAN.md](./TYPESCRIPT_REFACTORING_PLAN.md) — план міграції на TypeScript
- [FEATURE_BASED_STRUCTURE.md](./FEATURE_BASED_STRUCTURE.md) — структура проекту за модулями
- [MONGODB_MIGRATION_PLAN.md](./MONGODB_MIGRATION_PLAN.md) — цей файл

---

**Затверджено:** 15 березня 2026  
**Виконавець:** Алиса  
**Статус:** Готовий до реалізації
