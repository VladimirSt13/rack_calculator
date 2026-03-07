# 📊 Проект: Rack Calculator v2.0 - Статус

**Останнє оновлення:** 7 березня 2026  
**Статус:** Phase 1 завершено, Phase 2 в процесі

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

## 🔄 Поточний етап (Phase 2)

### Етап 7: Збереження комплектів
- [ ] Створити таблиці rack_sets, rack_set_revisions
- [ ] RackSetController
- [ ] RackSetModal
- [ ] Сторінка RackSetsList

### Етап 8: Експорт в Excel
- [ ] Встановити exceljs
- [ ] Експорт комплектів

### Етап 9: Аудит
- [ ] Audit log таблиця
- [ ] Фінальне тестування

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
npm run seed:admin       # Створити адмінів
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

### Client
- [ROUTES.md](./client/docs/ROUTES.md)
- [STAGE_3_COMPLETE.md](./client/docs/STAGE_3_COMPLETE.md)

### Загальна
- [MODERNIZATION_PLAN.md](./MODERNIZATION_PLAN.md)
- [CONVENTIONS.md](./CONVENTIONS.md)
