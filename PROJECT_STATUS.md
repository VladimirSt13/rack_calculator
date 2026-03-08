# 📊 Проект: Rack Calculator v2.0 - Статус

**Останнє оновлення:** 8 березня 2026
**Статус:** Phase 1 завершено, Phase 2 завершено на 100%, Виправлення експорту виконано

---

## ✅ Виконані етапи (Phase 1)

### ✅ Етап 1: Міграції БД
- 9 міграцій створено та виконано
- Refresh tokens, email verification
- Roles & permissions в БД

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
- Battery controller
- Фільтрація цін за ролями

### ✅ Етап 5: Ролі та дозволи
- 3 типи цін: базова, без ізоляторів, нульова
- Ролі: admin, manager, user
- API для управління ролями
- Зберігання permissions в БД

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

---

## 🔧 Виправлення (Bug Fixes)

### ✅ Виправлення експорту комплектів (8 березня 2026)
**Проблема:** При експорті комплекту стелажів в Excel не потрапляли стеллажі.

**Причина:** При збереженні комплекту в БД в поле `racks` зберігалися тільки `{rackConfigId, quantity}` без повних даних (`components`, `prices`, `form`).

**Виправлення:**
- [x] `rackSetController.js`: збереження повних даних в `racks` при створенні/оновленні
- [x] `pricingService.js`: використання існуючих даних якщо вони вже розраховані
- [x] `exportController.js`: підтримка експорту для адміністраторів
- [x] `rackSetController.js`: підтримка адміністраторів в `getRackSets`, `getRackSet`

**Документація:** [EXPORT_FIX.md](./EXPORT_FIX.md)

---

## 📦 Тестові користувачі

| Email | Пароль | Роль | Доступ |
|-------|--------|------|--------|
| admin@vs.com | P@ssw0rd13 | admin | Всі сторінки, всі ціни |
| V.Stognij@accu-energo.com.ua | P@ssw0rd13 | admin | Всі сторінки, всі ціни |
| manager@test.com | 123456 | manager | Тільки Battery, нульова ціна |
| user@test.com | 123456 | user | Access Denied |

---

## 💰 Типи цін (3 типи)

1. **Базова** - ціна розрахована по прайсу
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
```

**Cron налаштування** (в `.env`):
```env
AUDIT_CLEANUP_ENABLED=true
AUDIT_CLEANUP_SCHEDULE=0 2 * * 0  # Кожну неділю о 02:00
AUDIT_CLEANUP_DAYS=90
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
- [EXPORT_FIX.md](./EXPORT_FIX.md) - Виправлення експорту
