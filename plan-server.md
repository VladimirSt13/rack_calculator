# 📋 План розробки: Серверна частина

**Дата оновлення:** 10 березня 2026
**Версія:** 4.0
**Статус:** Phase 1 & 2 ✅ Завершено, Phase 3 🔄 В роботі (Critical Bug Fixes)

---

## 🎯 Огляд

Серверна частина Rack Calculator включає:
- REST API на Express
- SQLite базу даних
- Систему авторизації з ролями
- Обчислення стелажів та акумуляторів
- Експорт в Excel
- Журнал аудиту
- Swagger документація
- **Шар моделей даних** (12 моделей)

---

## ✅ ЗАВЕРШЕНІ ЕТАПИ (Phase 1 & 2)

### ✅ Phase 1: Базова функціональність

#### ✅ Етап 1: Міграції БД + ролі + refresh tokens
- [x] 16 міграцій виконано
- [x] Додати поля `email_verified`, `verification_token` до users
- [x] Створити таблицю `refresh_tokens`
- [x] Створити таблицю `email_verifications`
- [x] Створити таблицю `rack_configurations`
- [x] Оновити модель users
- [x] Додати поле `braces` (міграція 014)
- [x] **Міграція 015**: add_soft_delete_and_spans_hash (soft delete + індекс)
- [x] **Міграція 016**: cleanup_deprecated_fields (видалення застарілих полів)

#### ✅ Етап 2: Авторизація на сервері
- [x] Реєстрація з перевіркою домену @accu-energo.com.ua
- [x] Додати генерацію verification token
- [x] Endpoint `/verify-email`
- [x] Endpoint створення користувача адміном
- [x] Refresh token логіка
- [x] Endpoint `/auth/refresh`
- [x] Endpoint `/auth/revoke`
- [x] Middleware `authorizeRole`
- [x] Middleware `filterPrices`
- [x] Відновлення пароля (forgot/reset/change)

#### ✅ Етап 4: Обчислення на сервері
- [x] RackController (calculateRack)
- [x] BatteryController (findBestRackForBattery)
- [x] batteryRackBuilder.js (алгоритм з legacy)
- [x] Фільтрація цін за permissions

#### ✅ Етап 5: Ролі та дозволи
- [x] 3 типи цін: базова, без ізоляторів, нульова
- [x] Ролі: admin, manager, user
- [x] API для управління ролями
- [x] Зберігання permissions в БД
- [x] RolesController

#### ✅ Етап 6: Адмін-панель (базова)
- [x] CRUD користувачів
- [x] Управління ролями та price_types

---

### ✅ Phase 2: Збереження комплектів та аудит

#### ✅ Етап 7: Збереження комплектів
- [x] Створити таблиці rack_sets, rack_set_revisions
- [x] RackSetController (CRUD)
- [x] Нормалізація БД (міграції 012, 013, 014)

#### ✅ Етап 8: Експорт в Excel
- [x] Встановити exceljs
- [x] ExportController (експорт комплектів)
- [x] Опція "Додати ціни в експорт" (чекбокс)
- [x] Український формат чисел (кома)
- [x] Деталізація комплектації по стелажах
- [x] Підтримка адміністраторів

#### ✅ Етап 9: Аудит
- [x] Audit log таблиця (міграція 006)
- [x] Audit helper (server/src/helpers/audit.js)
- [x] Audit routes (server/src/routes/audit.js)
- [x] Фільтрація за діями, сутностями, датами
- [x] API очищення старих записів
- [x] Скрипт audit:cleanup
- [x] Індекси для оптимізації (міграція 010)
- [x] Cron-планувальник (node-cron)
- [x] Документація (AUDIT_MANAGEMENT.md)

#### ✅ Етап 10: Swagger API Documentation
- [x] Встановити swagger-jsdoc, swagger-ui-express
- [x] Swagger специфікація для всіх API endpoint
- [x] UI документація на /api-docs
- [x] JSDoc коментарі для контролерів
- [x] Документація для Auth, Rack, Battery API

#### ✅ Етап 12: Cron для очистки токенів
- [x] Cron для cleanup застарілих refresh токенів
- [x] Налаштування в .env (TOKEN_CLEANUP_ENABLED, TOKEN_CLEANUP_SCHEDULE, TOKEN_CLEANUP_DAYS)
- [x] Скрипт token:cleanup

---

### ✅ Phase 2.5: Моделі даних (Рефакторинг)

#### ✅ Етап 13: Створення шару моделей
**Створені моделі:**
- [x] `BaseModel` - базовий клас з загальними методами
- [x] `User` - користувачі
- [x] `Role` - ролі
- [x] `Permission` - дозволи
- [x] `Price` - прайс-листи
- [x] `AuditLog` - журнал аудиту
- [x] `RefreshToken` - refresh токени
- [x] `EmailVerification` - підтвердження email
- [x] `PasswordReset` - скидання пароля
- [x] `RackSet` - комплекти стелажів
- [x] `RackConfiguration` - конфігурації стелажів
- [x] `RackSetRevision` - історія змін
- [x] `index.js` - експорт всіх моделей

**Переваги:**
- Інкапсуляція логіки роботи з БД
- Безпека (toSafeObject приховує чутливі дані)
- Тестованість (моделі можна тестувати окремо)
- Повторне використання (спільна логіка в BaseModel)

---

## 🔧 ВИПРАВЛЕННЯ (Bug Fixes)

### ✅ Виправлення експорту комплектів (8 березня 2026)
**Проблема:** При експорті комплекту стелажів в Excel не потрапляли стеллажі.

**Виправлення:**
- [x] `rackSetController.js`: збереження повних даних в `racks`
- [x] `pricingService.js`: використання існуючих даних
- [x] `exportController.js`: підтримка адміністраторів

**Документація:** [docs/EXPORT_FIX.md](./docs/EXPORT_FIX.md)

---

### ✅ Виправлення розрахунку "Без ізоляторів" (9 березня 2026)
**Проблема:** Ціна "Без ізоляторів" = `totalCost * 0.9` (знижка 10%).

**Виправлення:**
- [x] `pricingService.js`: `calculateTotalWithoutIsolators(components)`
- [x] Тепер: базова мінус вартість ізоляторів

---

### ✅ Виправлення Battery Page (9 березня 2026)
**Проблеми:**
- [x] Не передавався `gap` на сервер
- [x] Показував `totalLength` замість `requiredLength`
- [x] Неправильна формула довжини (віднімання замість додавання)

**Виправлення:**
- [x] Додано `gap` в `batteryDimensions`
- [x] Додано `requiredLength` в response
- [x] Формула: `(count × length) + (count-1) × gap`

**Документація:** [docs/BATTERY_PAGE_AUDIT.md](./docs/BATTERY_PAGE_AUDIT.md)

---

### ✅ Нормалізація БД (9 березня 2026)
- [x] Міграція 012: видалення поля `racks`
- [x] Міграція 013: перейменування `rack_items_new` → `rack_items`
- [x] Міграція 014: додавання поля `braces`

**Документація:** [docs/DB_NORMALIZATION_AUDIT.md](./docs/DB_NORMALIZATION_AUDIT.md)

---

## 🚨 КРИТИЧНІ БАГИ (Priority 1)

### 🔴 Проблема 1: Неправильний розрахунок ізоляторів (подвоєння)
**Опис:** Кількість ізоляторів розраховується неправильно - в два рази більше ніж потрібно.

**Причина:** Ймовірно, ізолятори рахуються і для кожного поверху, і для кожного ряду одночасно.

**Завдання:**
- [ ] Знайти місце подвоєння в `shared/rackCalculator.ts`
- [ ] Виправити формулу розрахунку
- [ ] Додати тести для перевірки
- [ ] Перевірити на реальних даних

**Пріоритет:** 🔴 Критичний

---

### 🔴 Проблема 2: Battery Page - неправильний комплект та експорт
**Опис:**
- При додаванні стелажа з Battery Page в комплект додається не те
- Комплектація стелажа неправильна
- Експорт комплекту некоректний

**Завдання:**
- [ ] Перевірити структуру даних `batteryDimensions` та `rackConfig`
- [ ] Перевірити передачу даних в `rackSetController.js`
- [ ] Перевірити експорт в `exportController.js`
- [ ] Виправити всі невідповідності

**Пріоритет:** 🔴 Критичний

---

### 🔴 Проблема 3: Різні форми експорту для адміна та менеджера
**Опис:** Потрібно перевірити, щоб експорт враховував дозволи користувача (ціни).

**Завдання:**
- [ ] Перевірити `exportController.js` - чи враховує ролі
- [ ] Перевірити ціни в експорті для manager (тільки нульова)
- [ ] Перевірити ціни в експорті для admin (всі типи)
- [ ] Виправити невідповідності

**Пріоритет:** 🔴 Високий

---

## 📊 МЕТРИКИ ПРОЄКТУ

### Поточний статус
| Показник | Значення |
|----------|----------|
| **Завершено етапів** | 13/13 (Phase 1 & 2) |
| **Всього міграцій** | 16 |
| **API endpoints** | 40+ |
| **Користувачів** | 5 |
| **Комплектів** | 18+ конфігурацій |
| **Аудит записів** | 149+ |
| **Моделей даних** | 12 |
| **Контролерів** | 12 |
| **Сервісів** | 11 |
| **Middleware** | 2 |
| **Таблиць БД** | 15 |

### Цілі Phase 3
| Показник | Ціль |
|----------|------|
| **Критичні баги** | 0 (1 не підтвердився) |
| **Завершено етапів** | 14/14 |
| **Test coverage** | > 60% |
| **Documentation** | 100% |

---

## 🏗️ Архітектура

### Контролери (12)

| Контролер | Призначення |
|-----------|-------------|
| `auditController.js` | Журнал аудиту |
| `authController.js` | Авторизація (login, register, refresh, password reset) |
| `batteryController.js` | Розрахунок стелажів для акумуляторів |
| `calculationsController.js` | Збереження розрахунків |
| `exportController.js` | Експорт в Excel |
| `priceComponentsController.js` | Компоненти прайсу |
| `priceController.js` | Управління прайсами |
| `rackConfigurationController.js` | Конфігурації стелажів |
| `rackController.js` | Розрахунок стелажів |
| `rackSetController.js` | Комплекти стелажів (CRUD) |
| `rolesController.js` | Ролі та дозволи |
| `usersController.js` | Користувачі (CRUD) |

### Моделі (12)

1. `BaseModel` - базовий клас
2. `User` - користувачі
3. `Role` - ролі
4. `Permission` - дозволи
5. `Price` - прайс-листи
6. `AuditLog` - журнал аудиту
7. `RefreshToken` - refresh токени
8. `EmailVerification` - підтвердження email
9. `PasswordReset` - скидання пароля
10. `RackSet` - комплекти стелажів
11. `RackConfiguration` - конфігурації стелажів
12. `RackSetRevision` - історія змін комплектів

### Middleware (2)

| Middleware | Призначення |
|------------|-------------|
| `auth.js` | Перевірка JWT токену (`authenticate`, `optionalAuth`) |
| `authorizeRole.js` | Перевірка ролі (`authorizeRole`, `authorizePermission`) |

### Сервіси (11)

| Сервіс | Призначення |
|--------|-------------|
| `auditCleanupService.js` | Cron для очистки аудиту |
| `auditService.js` | Логіка аудиту |
| `batteryService.js` | Логіка акумуляторів |
| `calculationsService.js` | Розрахунки |
| `exportService.js` | Експорт в Excel |
| `priceComponentsService.js` | Компоненти прайсу |
| `priceService.js` | Управління прайсами |
| `pricingService.js` | Розрахунок цін з фільтрацією |
| `rackConfigurationService.js` | Конфігурації стелажів |
| `rackService.js` | Логіка стелажів |
| `rolesService.js` | Ролі та дозволи |

---

## 📋 ПОТОЧНИЙ ПЛАН (Phase 3)

### 🔴 Priority 1: Critical Bug Fixes (Week 1)

#### Етап 14: Виправлення критичних багів

**14.1 Подвоєння ізоляторів** (✅ Не підтвердилось)
- [x] Перевірено `shared/rackCalculator.ts` (рядки 239-263)
- [x] Формула правильна: `(2 + (прольоти - 1)) × 2`
- [x] Ізолятори тільки для 1-поверхових стелажів
- [x] `rows` не множиться (опори спільні)
- [ ] **Можлива причина:** Проблема на клієнті або була виправлена раніше

**14.2 Battery Page експорт** (⚠️ Частково виправлено)
- [x] `rackSetController.js` - зберігає `rack_items` правильно
- [x] `exportService.js` - розраховує дані заново з `rack_configurations`
- [ ] **Потрібна перевірка:** Тестування на реальних даних
- [ ] **Файли:** `server/src/controllers/rackSetController.js`, `server/src/services/exportService.js`

**14.3 Експорт для admin/manager** (✅ Виправлено)
- [x] `filterPriceArrayByPermissions` працює коректно (рядки 107-133)
- [x] Admin отримує всі 3 типи цін
- [x] Manager отримує тільки "нульова"
- [x] `exportController.js` враховує дозволи користувача
- [ ] **Файл:** `server/src/services/pricingService.js`

---

### 🟠 Priority 2: Core Functionality (Week 2-3)

#### Етап 15: Soft Delete та відновлення комплектів
**Опис:** Замість повного видалення - позначення як видалене з можливістю відновлення.

**Статус:** ✅ **ВИКОНАНО**

**Реалізація:**
- [x] Міграція 015: `add_soft_delete_and_spans_hash.js` (рядки 17-36)
- [x] Міграція 016: `cleanup_deprecated_fields.js` (рядки 53-88)
- [x] Модель `RackSet.js`:
  - [x] Метод `softDelete()` (рядки 147-156)
  - [x] Метод `restore()` (рядки 158-167)
  - [x] Метод `cleanupDeleted(days)` (рядки 221-232)
- [x] Контролер `rackSetController.js`:
  - [x] `deleteRackSet` - м'яке видалення (рядок 237)
  - [x] `restoreRackSet` - відновлення (рядок 267)
  - [x] `getDeletedRackSets` - отримати видалені (рядок 109)
- [ ] **Клієнт:** Потрібно додати UI для перегляду/відновлення (див. `plan-client.md` Етап 14)

**Пріоритет:** ✅ Завершено

---

#### Етап 16: Cron для очищення видалених об'єктів
**Опис:** Автоматичне видалення записів з прапором `deleted` старіше 30 днів.

**Статус:** ❌ **НЕ ВИКОНАНО**

**Що є:**
- [x] Метод `RackSet.cleanupDeleted(days)` в моделі (рядки 221-232)
- [x] Endpoint `POST /api/rack-sets/cleanup` в контролері (рядки 378-390)
- [ ] **НЕМАЄ** cron-задачі для автоматичного очищення

**Завдання:**
- [ ] Створити `server/src/services/rackSetCleanupService.js` (аналогічно `auditCleanupService.js`)
- [ ] Додати ініціалізацію в `server/src/index.js`:
  ```javascript
  import { initRackSetCleanup } from './services/rackSetCleanupService.js';
  initRackSetCleanup();
  ```
- [ ] Додати команду `npm run cleanup:deleted`
- [ ] Налаштування в `.env`:
  ```env
  DELETED_CLEANUP_ENABLED=true
  DELETED_CLEANUP_SCHEDULE=0 4 * * 0  # Щонеділі о 04:00
  DELETED_CLEANUP_DAYS=30
  ```
- [ ] Документація

**Пріоритет:** 🟠 Високий

---

### 🟢 Priority 4: Polish & Maintenance (Week 6+)

#### Етап 24: Тестування
**Опис:** Покриття тестами критичної функціональності.

**Завдання:**
- [ ] Unit тести для `rackCalculator.ts`
- [ ] Unit тести для `pricingService.js`
- [ ] Unit тести для `batteryRackBuilder.js`
- [ ] Integration тести для API endpoint'ів

**Пріоритет:** 🟢 Низький

---

#### Етап 25: Документація
**Опис:** Оновлення та створення нової документації.

**Завдання:**
- [ ] Оновити `README.md`
- [ ] Створити `CHANGELOG.md`
- [ ] Оновити API документацію (Swagger)
- [ ] Створити серверну документацію

**Пріоритет:** 🟢 Низький

---

## 📊 МЕТРИКИ ПРОЄКТУ

### Поточний статус
| Показник | Значення |
|----------|----------|
| **Завершено етапів** | 13/13 (Phase 1 & 2) |
| **Всього міграцій** | 16 |
| **API endpoints** | 40+ |
| **Користувачів** | 5 |
| **Комплектів** | 18+ конфігурацій |
| **Аудит записів** | 149+ |
| **Моделей даних** | 12 |

### Цілі Phase 3
| Показник | Ціль |
|----------|------|
| **Критичні баги** | 0 |
| **Завершено етапів** | 14/14 |
| **Test coverage** | > 60% |
| **Documentation** | 100% |

---

## 📅 Орієнтовні терміни

| Phase | Етапи | Термін | Статус |
|-------|-------|--------|--------|
| **Phase 1** | 1-6 | 7-28 лютого 2026 | ✅ Завершено |
| **Phase 2** | 7-12 | 1-9 березня 2026 | ✅ Завершено |
| **Phase 2.5** | 13 | 9 березня 2026 | ✅ Завершено |
| **Phase 3** | 14-25 | 10 березня - 15 квітня 2026 | 🔄 В роботі |
| **Phase 4** | 26+ | Травень 2026+ | ⏳ Заплановано |

---

## 🎯 Пріоритети

### Високий пріоритет (Priority 1-2)
1. ✅ **Подвоєння ізоляторів** - не підтвердилось (формула правильна)
2. ⚠️ **Battery Page експорт** - частково виправлено (потрібна перевірка)
3. ✅ **Експорт для admin/manager** - виправлено (фільтрація працює)
4. ✅ **Soft Delete та відновлення** - виконано
5. 🟠 **Cron для очищення видалених** - не виконано (створити rackSetCleanupService.js)

### Низький пріоритет (Priority 4)
6. 🟢 **Тестування** - 0% coverage (потрібно створити тести)
7. 🟢 **Документація** - оновити після виправлень

---

## 🛠️ Корисні команди

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

**Cron налаштування** (в `.env`):
```env
# Audit Cleanup
AUDIT_CLEANUP_ENABLED=true
AUDIT_CLEANUP_SCHEDULE=0 2 * * 0  # Кожну неділю о 02:00
AUDIT_CLEANUP_DAYS=90

# Token Cleanup
TOKEN_CLEANUP_ENABLED=true
TOKEN_CLEANUP_SCHEDULE=0 3 * * 0  # Кожну неділю о 03:00
TOKEN_CLEANUP_DAYS=30

# Deleted Cleanup (NEW)
DELETED_CLEANUP_ENABLED=true
DELETED_CLEANUP_SCHEDULE=0 4 * * 0  # Кожну неділю о 04:00
DELETED_CLEANUP_DAYS=30
```

---

## 📚 Документація

### Server Docs
- [ROLES_AND_PERMISSIONS.md](./server/docs/ROLES_AND_PERMISSIONS.md)
- [PRICING.md](./server/docs/PRICING.md)
- [MIGRATIONS_GUIDE.md](./server/docs/MIGRATIONS_GUIDE.md)
- [PASSWORD_RESET.md](./server/docs/PASSWORD_RESET.md)
- [AUDIT_MANAGEMENT.md](./server/docs/AUDIT_MANAGEMENT.md)
- [TOKEN_CLEANUP.md](./server/docs/TOKEN_CLEANUP.md)

### Загальна документація
- [docs/CONVENTIONS.md](./docs/CONVENTIONS.md)
- [docs/EXPORT_FIX.md](./docs/EXPORT_FIX.md)
- [docs/DB_NORMALIZATION_AUDIT.md](./docs/DB_NORMALIZATION_AUDIT.md)
- [docs/BATTERY_PAGE_AUDIT.md](./docs/BATTERY_PAGE_AUDIT.md)
- [docs/CLIENT_AUDIT_2026_03_11.md](./docs/CLIENT_AUDIT_2026_03_11.md)
- [docs/SERVER_AUDIT_2026_03_11.md](./docs/SERVER_AUDIT_2026_03_11.md)

---

**Затверджено:** 11 березня 2026  
**Версія:** 5.0  
**Статус:** Phase 3 🔄 В роботі (Priority-based)
