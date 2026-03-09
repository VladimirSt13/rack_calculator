# 📊 Проект: Rack Calculator v2.0 - Статус

**Останнє оновлення:** 9 березня 2026
**Статус:** Phase 1 завершено, Phase 2 завершено на 100%, Battery Page реалізовано

---

## ✅ Виконані етапи (Phase 1)

### ✅ Етап 1: Міграції БД
- 14 міграцій створено та виконано
- Refresh tokens, email verification
- Roles & permissions в БД
- Rack configurations (нормалізація)
- Braces field для розкосів

### ✅ Етап 2: Авторизація (Server)
- Реєстрація з перевіркою домену @accu-energo.com.ua
- Login/Logout з refresh tokens
- Email verification
- Password reset (forgot/reset/change)

### ✅ Етап 3: Авторизація (Client)
- 7 сторінок авторизації
- Auth store (Zustand)
- Protected routes
- Auto refresh tokens

### ✅ Етап 4: Обчислення на сервері
- Rack controller
- Battery controller (повний алгоритм з legacy)
- Фільтрація цін за ролями

### ✅ Етап 5: Ролі та дозволи
- 3 типи цін: базова, без ізоляторів, нульова
- Ролі: admin, manager, user
- API для управління ролями
- Зберігання permissions в БД
- Компоненти без цін для user/manager

### ✅ Етап 6: Адмін-панель (базова)
- AdminDashboard
- UserManagement (CRUD користувачів)
- UserForm (з вибором price_types)
- ProtectedRoute для адміна

---

## ✅ Поточний етап (Phase 2) - ЗАВЕРШЕНО

### ✅ Етап 7: Збереження комплектів
- [x] Створити таблиці rack_sets, rack_set_revisions
- [x] RackSetController
- [x] RackSetModal (з експортом)
- [x] Сторінка RackSetsList

### ✅ Етап 8: Експорт в Excel - ЗАВЕРШЕНО
- [x] Встановити exceljs
- [x] Експорт комплектів на одну сторінку
- [x] Опція "Додати ціни в експорт" (чекбокс)
- [x] Український формат чисел (кома)
- [x] Деталізація комплектації по стелажах
- [x] Межі, заливка, перенесення рядків
- [x] Адаптивна модалка (max-w-5xl)

### ✅ Етап 9: Аудит - ЗАВЕРШЕНО
- [x] Audit log таблиця
- [x] Audit helper (server/src/helpers/audit.js)
- [x] Audit routes (server/src/routes/audit.js)
- [x] Audit API (client/src/features/audit/auditApi.ts)
- [x] AuditLogPage (client/src/pages/admin/AuditLogPage.tsx)
- [x] Інтеграція в адмін-панель
- [x] Фільтрація за діями, сутностями, датами
- [x] Пагінація
- [x] Перегляд змін (було/стало)
- [x] Статистика журналу аудиту
- [x] API очищення старих записів
- [x] Скрипт audit:cleanup
- [x] Індекси для оптимізації (міграція 010)
- [x] Cron-планувальник (node-cron)
- [x] Документація (AUDIT_MANAGEMENT.md)

### ✅ Етап 10: Swagger API Documentation - ЗАВЕРШЕНО
- [x] Встановити swagger-jsdoc, swagger-ui-express
- [x] Swagger специфікація для всіх API endpoint
- [x] UI документація на /api-docs
- [x] JSDoc коментарі для контролерів
- [x] Документація для Auth, Rack, Battery API

### ✅ Етап 11: User Menu та Профіль - ЗАВЕРШЕНО
- [x] Іконка профілю в Header
- [x] Відображення нікнейму користувача
- [x] Випадаюче меню (Загальні налаштування, Профіль, Адмін-панель, Збережені комплекти, Вихід)
- [x] ProfilePage
- [x] ProfileApi

### ✅ Етап 12: Cron для очистки токенів - ЗАВЕРШЕНО
- [x] Додати cron для cleanup застарілих refresh токенів
- [x] Налаштування в .env (TOKEN_CLEANUP_ENABLED, TOKEN_CLEANUP_SCHEDULE, TOKEN_CLEANUP_DAYS)
- [x] Скрипт token:cleanup
- [x] Документація

---

## ✅ Battery Page - ЗАВЕРШЕНО (9 березня 2026)

### ✅ Алгоритм розрахунку (з legacy)
- [x] Розрахунок batteriesPerRow: quantity / (rows × floors)
- [x] Розрахунок requiredLength: (count × length) + (count-1) × gap
- [x] Генерація комбінацій прольотів (calcRackSpans)
- [x] Перевірка ваги акумуляторів (checkSpanWeight)
- [x] Оптимізація варіантів (optimizeRacks)
- [x] Вибір TOP-5 за критеріями: балки, прольоти, симетрія, ціна

### ✅ Збереження в БД
- [x] Таблиця rack_configurations (floors, rows, beams_per_row, supports, spans, braces)
- [x] findOrCreateRackConfiguration - знайти або створити конфігурацію
- [x] Автоматичний розрахунок braces типу (D600/D1000/D1500)
- [x] Міграція 014: додавання поля braces

### ✅ Відображення результатів
- [x] BatteryResults.tsx - таблиця варіантів
- [x] Формат назви: L1A2-1000/430 (600+600 / 2 балки)
- [x] Відображення requiredLength (розрахункова довжина)
- [x] Компоненти стелажа (з дозволеними цінами)
- [x] BatterySetModal - модальне вікно комплекту
- [x] Експорт Battery комплектів в Excel

### ✅ Ролі та дозволи
- [x] Admin: всі ціни + компоненти з цінами
- [x] Manager: нульова ціна + компоненти без цін
- [x] User: немає доступу (або 0 цін)

### ✅ User Menu та Profile
- [x] UserMenu.tsx - випадаюче меню
- [x] ProfilePage.tsx - зміна пароля
- [x] DropdownMenu компонент (Radix UI)
- [x] Інтеграція в Header

---

## 🔧 Виправлення (Bug Fixes)

### ✅ Виправлення експорту комплектів (8 березня 2026)
**Проблема:** При експорті комплекту стелажів в Excel не потрапляли стеллажі.

**Виправлення:**
- [x] `rackSetController.js`: збереження повних даних в `racks`
- [x] `pricingService.js`: використання існуючих даних
- [x] `exportController.js`: підтримка адміністраторів

### ✅ Виправлення розрахунку "Без ізоляторів" (9 березня 2026)
**Проблема:** Ціна "Без ізоляторів" = `totalCost * 0.9` (знижка 10%).

**Виправлення:**
- [x] `pricingService.js`: `calculateTotalWithoutIsolators(components)`
- [x] Тепер: базова мінус вартість ізоляторів

### ✅ Виправлення Battery Page (9 березня 2026)
**Проблеми:**
- [x] Не передавався `gap` на сервер
- [x] Показував totalLength замість requiredLength
- [x] Неправильна формула довжини (віднімання замість додавання)

**Виправлення:**
- [x] Додано `gap` в batteryDimensions
- [x] Додано `requiredLength` в response
- [x] Формула: `(count × length) + (count-1) × gap`

### ✅ Нормалізація БД (9 березня 2026)
- [x] Міграція 012: видалення поля `racks`
- [x] Міграція 013: перейменування `rack_items_new` → `rack_items`
- [x] Міграція 014: додавання поля `braces`
- [x] Оновлено контролери для роботи з `rack_configurations`

---

## 📦 Тестові користувачі

| Email | Пароль | Роль | Доступ |
|-------|--------|------|--------|
| admin@vs.com | P@ssw0rd13 | admin | Всі сторінки, всі ціни |
| V.Stognij@accu-energo.com.ua | P@ssw0rd13 | admin | Всі сторінки, всі ціни |
| manager@test.com | 123456 | manager | Battery, нульова ціна |
| user@test.com | 123456 | user | Access Denied |

---

## 💰 Типи цін (3 типи)

1. **Базова** - ціна розрахована по прайсу (сума компонентів)
2. **Без ізоляторів** - базова ціна мінус вартість ізоляторів
3. **Нульова** - базова ціна × 1,44 (× 1,2 × 1,2)

---

## 🛠️ Команди

### Server
```bash
npm run migrate          # Запуск міграцій
npm run migrate:status   # Статус міграцій
npm run migrate:rollback # Відкат міграції
npm run seed:admin       # Створити адмінів
npm run audit:cleanup    # Очистити аудит (90 днів)
npm run audit:cleanup 30 # Очистити аудит (30 днів)
npm run token:cleanup    # Очистити застарілі токени
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

---

## 📚 Документація

### Server
- [ROLES_AND_PERMISSIONS.md](./server/docs/ROLES_AND_PERMISSIONS.md)
- [PRICING.md](./server/docs/PRICING.md)
- [MIGRATIONS_GUIDE.md](./server/docs/MIGRATIONS_GUIDE.md)
- [PASSWORD_RESET.md](./server/docs/PASSWORD_RESET.md)
- [AUDIT_MANAGEMENT.md](./server/docs/AUDIT_MANAGEMENT.md)

### Client
- [ROUTES.md](./client/docs/ROUTES.md)
- [STAGE_3_COMPLETE.md](./client/docs/STAGE_3_COMPLETE.md)

### Загальна
- [MODERNIZATION_PLAN.md](./MODERNIZATION_PLAN.md)
- [CONVENTIONS.md](./CONVENTIONS.md)
- [EXPORT_FIX.md](./EXPORT_FIX.md)
- [DB_NORMALIZATION_AUDIT.md](./DB_NORMALIZATION_AUDIT.md)

---

## 📊 Статистика проєкту

| Показник | Значення |
|----------|----------|
| **Міграцій БД** | 14 |
| **Таблиць в БД** | 15 |
| **API endpoints** | 40+ |
| **Сторінок** | 20+ |
| **Користувачів** | 5 |
| **Комплектів** | 18+ конфігурацій |
| **Аудит записів** | 149+ |
