# 📊 Проект: Rack Calculator v2.0

**Останнє оновлення:** 7 березня 2026  
**Статус:** Phase 1 завершено, Phase 2 в процесі

---

## ✅ Виконані етапи

### Phase 1: Базова функціональність

#### Етап 1: Міграції БД ✅
- 8 міграцій БД створено
- Refresh tokens, email verification
- Roles & permissions в БД

#### Етап 2: Авторизація (Server) ✅
- Реєстрація з перевіркою домену
- Login/Logout з refresh tokens
- Email verification
- Password reset (forgot/change)

#### Етап 3: Авторизація (Client) ✅
- 7 сторінок авторизації
- Auth store (Zustand)
- Protected routes
- Auto refresh tokens

#### Етап 4: Обчислення на сервері ✅
- Rack controller
- Battery controller
- Фільтрація цін за ролями

#### Етап 5: Ролі та дозволи ✅
- 19 дозволів
- 3 ролі за замовчуванням
- API для управління ролями
- Зберігання в БД

---

## 🔄 Поточний етап

### Етап 6: Адмін-панель
- [ ] UserManagement
- [ ] RoleManagement
- [ ] PriceManagement
- [ ] Dashboard

---

## 📦 Тестові дані

### Користувачі

| Email | Пароль | Роль | Доступ |
|-------|--------|------|--------|
| admin@vs.com | P@ssw0rd13 | admin | Всі сторінки |
| V.Stognij@accu-energo.com.ua | P@ssw0rd13 | admin | Всі сторінки |
| manager@test.com | 123456 | manager | Тільки Battery |
| user@test.com | 123456 | user | Access Denied |

### Ролі

| Роль | Сторінки | Ціни | Дозволи |
|------|----------|------|---------|
| admin | Всі | Всі | 19 |
| manager | Battery | Нульова | 4 |
| user | Немає | Немає | 0 |

---

## 🛠️ Команди

### Server
```bash
npm run dev              # Запуск сервера
npm run migrate          # Міграції БД
npm run migrate:status   # Статус міграцій
npm run seed:admin       # Створити адмінів
```

### Client
```bash
npm run dev              # Запуск клієнта
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

### Головна
- [README.md](./README.md) - Загальна інформація
- [MODERNIZATION_PLAN.md](./MODERNIZATION_PLAN.md) - План модернізації
- [CONVENTIONS.md](./CONVENTIONS.md) - Конвенції проєкту

### Server
- [ROLES_AND_PERMISSIONS.md](./server/docs/ROLES_AND_PERMISSIONS.md) - Ролі та дозволи
- [ARCHITECTURE_ROLES.md](./server/docs/ARCHITECTURE_ROLES.md) - Архітектура ролей
- [MIGRATIONS_GUIDE.md](./server/docs/MIGRATIONS_GUIDE.md) - Міграції БД
- [PASSWORD_RESET.md](./server/docs/PASSWORD_RESET.md) - Відновлення пароля
- [ROLES_AND_ACCESS.md](./server/docs/ROLES_AND_ACCESS.md) - Доступ за ролями

### Client
- [ROUTES.md](./client/docs/ROUTES.md) - Маршрути
- [STAGE_3_COMPLETE.md](./client/docs/STAGE_3_COMPLETE.md) - Авторизація

### Етапи
- [STAGE_1_COMPLETE.md](./server/docs/STAGE_1_COMPLETE.md) - Міграції
- [STAGE_2_COMPLETE.md](./server/docs/STAGE_2_COMPLETE.md) - Авторизація (server)
- [STAGE_3_COMPLETE.md](./client/docs/STAGE_3_COMPLETE.md) - Авторизація (client)
- [STAGE_4_COMPLETE.md](./server/docs/STAGE_4_COMPLETE.md) - Обчислення + Ролі

---

## 🎯 Архітектура

### Frontend
```
client/
├── src/
│   ├── app/           # App.tsx, routing
│   ├── pages/         # Сторінки
│   ├── features/      # auth, rack, battery
│   ├── shared/        # UI компоненти
│   ├── core/          # Constants (routes, roles)
│   └── lib/           # Axios
└── docs/              # Документація
```

### Backend
```
server/
├── src/
│   ├── controllers/   # auth, rack, battery, roles
│   ├── routes/        # API routes
│   ├── middleware/    # auth, authorizeRole
│   ├── helpers/       # roles, audit, email
│   ├── db/            # SQLite + migrations
│   └── core/          # Constants
├── data/              # БД
├── docs/              # Документація
└── scripts/           # migrate, seed
```

---

## 🔐 Безпека

### Authentication
- JWT Access Token (15 хв)
- Refresh Token (30 днів, httpOnly cookie)
- Auto refresh токенів

### Authorization
- Ролі: admin, manager, user
- 19 дозволів
- Permissions зберігаються в БД

### Password
- bcryptjs (12 раундів)
- Мінімум 6 символів
- Password reset через email

---

## 📊 Статистика

- **Файлів створено:** 50+
- **Міграцій БД:** 9
- **API Endpoints:** 20+
- **Сторінок:** 10+
- **Ролей:** 3
- **Дозволів:** 19
- **Документація:** 15+ файлів

---

## 🚀 Наступні кроки

1. **Адмін-панель** (Етап 6)
   - UserManagement
   - RoleManagement
   - PriceManagement

2. **Збереження комплектів** (Етап 7)
   - Rack sets CRUD
   - Revisions (історія змін)
   - Export to Excel

3. **Полірування** (Етап 8-9)
   - Audit logging
   - Testing
   - Final documentation

---

## 📞 Контакти

**Команда:** Акку-енерго  
**Проєкт:** Rack Calculator v2.0  
**Рік:** 2026
