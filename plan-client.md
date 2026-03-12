# 📋 План розробки: Клієнтська частина

**Дата оновлення:** 10 березня 2026
**Версія:** 4.0
**Статус:** Phase 1 & 2 ✅ Завершено, Phase 3 🔄 В роботі (Critical Bug Fixes)

---

## 🎯 Огляд

Клієнтська частина Rack Calculator включає:
- React 18 + TypeScript
- Vite збірка
- TanStack Query 5
- Zustand 4
- React Hook Form + Zod
- TailwindCSS + Radix UI
- Axios для API запитів
- **Feature-slice архітектура**

---

## ✅ ЗАВЕРШЕНІ ЕТАПИ (Phase 1 & 2)

### ✅ Phase 1: Базова функціональність

#### ✅ Етап 3: Авторизація на клієнті
- [x] Створити authStore (Zustand) з refresh token
- [x] Створити authApi
- [x] Створити LoginPage
- [x] Створити RegisterPage
- [x] Створити VerifyEmailPage
- [x] Створити ForgotPasswordPage
- [x] Створити ResetPasswordPage
- [x] Додати ProtectedRoute
- [x] Auto refresh tokens

#### ✅ Етап 4: Обчислення на сервері (інтеграція)
- [x] Інтеграція з Rack API
- [x] Інтеграція з Battery API
- [x] Фільтрація цін за permissions

#### ✅ Етап 6: Адмін-панель (базова)
- [x] AdminDashboard
- [x] UserManagement (CRUD користувачів)
- [x] UserForm (з вибором price_types)
- [x] ProtectedRoute для адміна

---

### ✅ Phase 2: Збереження комплектів та аудит

#### ✅ Етап 7: Збереження комплектів
- [x] RackSetModal (з експортом)
- [x] Сторінка RackSetsList (Мої комплекти)

#### ✅ Етап 8: Експорт в Excel
- [x] Експорт комплектів на одну сторінку
- [x] Опція "Додати ціни в експорт" (чекбокс)
- [x] Український формат чисел (кома)
- [x] Деталізація комплектації по стелажах
- [x] Адаптивна модалка (max-w-5xl)

#### ✅ Етап 9: Аудит
- [x] Audit API (client/src/features/audit/auditApi.ts)
- [x] AuditLogPage (client/src/pages/admin/AuditLogPage.tsx)
- [x] Інтеграція в адмін-панель
- [x] Фільтрація за діями, сутностями, датами
- [x] Пагінація
- [x] Перегляд змін (було/стало)
- [x] Статистика журналу аудиту

#### ✅ Етап 11: User Menu та Профіль
- [x] Додати іконку профілю в Header
- [x] Відображати нікнейм користувача біля іконки
- [x] Випадаюче меню при натисканні
- [x] Пункти меню: Загальні налаштування, Профіль, Адмін-панель (admin), Збережені комплекти, Вихід
- [x] ProfilePage сторінка
- [x] ProfileApi для оновлення даних

---

## 🔧 ВИПРАВЛЕННЯ (Bug Fixes)

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

### ✅ Уніфікація формату стелажів (9 березня 2026)
**Опис:** Спільний формат для server/client

**Зміни:**
- [x] `client/src/features/battery/resultsStore.ts` - BatteryVariant interface
- [x] `client/src/features/battery/useBatteryCalculator.ts` - трансформація відповіді
- [x] Формат: `rackConfigId`, `config`, `components`, `prices`, `totalCost`

---

## 🚨 КРИТИЧНІ БАГИ (Priority 1)

### 🔴 Проблема 1: Battery Page - неправильний комплект та експорт
**Опис:**
- При додаванні стелажа з Battery Page в комплект додається не те
- Комплектація стелажа неправильна
- Експорт комплекту некоректний

**Завдання:**
- [x] Перевірити структуру даних `batteryDimensions` та `rackConfig`
- [x] Перевірити передачу даних в `RackSetModal`
- [x] Перевірити збереження в `rackSetsApi.ts`
- [x] Виправити всі невідповідності
- [x] Додано `clear()` в `onSuccess` для `useRackSetModal.ts` та `useBatterySetModal.ts`

**Пріоритет:** ✅ Завершено

---

### 🔴 Проблема 2: Різні форми експорту для адміна та менеджера
**Опис:** Потрібно перевірити, щоб експорт враховував дозволи користувача (ціни).

**Завдання:**
- [x] Перевірити відображення цін в `RackSetModal`
- [x] Перевірити ціни в експорті для manager (тільки нульова)
- [x] Перевірити ціни в експорті для admin (всі типи)
- [x] Виправити невідповідності

**Пріоритет:** ✅ Завершено

---

## 📋 ПОТОЧНИЙ ПЛАН (Phase 3)

### 🔴 Priority 1: Critical Bug Fixes (Week 1)

#### Етап 13: Виправлення критичних багів

**13.1 Скидання комплекту після збереження** (✅ Завершено)
- [x] Додати `clear()` в `onSuccess` для `useRackSetModal.ts`
- [x] Додати `clear()` в `onSuccess` для `useBatterySetModal.ts`
- [x] **Файли:** `client/src/features/rack/useRackSetModal.ts`, `client/src/features/battery/useBatterySetModal.ts`
- [x] **Проблема:** Після збереження комплекту стелажі НЕ скидаються
- [x] **Рішення:** Імпортувати `useRackSetStore` та викликати `clear()` в `onSuccess`

**13.2 Battery Page експорт** (✅ Виконано - структура правильна)
- [x] Перевірено структуру даних `useBatterySetModal.ts` (рядки 85-95)
- [x] `rackConfigId` використовується правильно
- [x] Порівняно з `useRackSetModal.ts` - структура ІДЕНТИЧНА

**13.3 Експорт для admin/manager** (✅ Завершено)
- [x] Клієнт передає тільки `includePrices`
- [x] Фільтрація цін реалізована на сервері правильно
- [x] **Файл:** `client/src/features/rack/rackSetsApi.ts` (рядки 158-167)

---

### 🟠 Priority 2: Core Functionality (Week 2-3)

#### Етап 14: Soft Delete та відновлення комплектів (Client) ✅ Завершено
**Опис:** Інтеграція з серверним Soft Delete.

**Завдання:**
- [x] Оновити `rackSetsApi.ts`:
  - [x] Додати `getDeletedRackSets()`
  - [x] Додати `restoreRackSet(id)`
  - [x] Оновити `deleteRackSet(id)` - м'яке видалення
- [x] Додати кнопку "Видалене" на сторінці "Мої комплекти"
- [x] Сторінка/модалка з видаленими комплектами
- [x] Кнопка "Відновити" для видалених
- [x] Confirmation dialog при видаленні
- [x] **Файли:** `client/src/pages/MyRackSetsPage.tsx`, `client/src/features/rack/components/RackSetsTable.tsx`, `client/src/features/rack/rackSetsApi.ts`
- [x] **Сервер вже готовий:** `GET /api/rack-sets/deleted`, `POST /api/rack-sets/:id/restore`
- [x] **Статус:** ✅ Виконано

**Пріоритет:** ✅ Завершено

---

#### Етап 15: Час в таблицях комплектів
**Опис:** Додати відображення часу створення (год:хв) до дати.

**Завдання:**
- [x] Додати відображення часу (год:хв) до дати
- [x] Формат: "09.03.2026 14:30"
- [x] Оновити `RackSetsTable.tsx`
- [x] **Файл:** `client/src/features/rack/components/RackSetsTable.tsx` (рядки 82-89)
- [x] **Статус:** ✅ Виконано

**Пріоритет:** ✅ Завершено

---
п
#### Етап 16: Покращення фону DropdownMenu ✅ Завершено
**Опис:** Покращити вигляд випадаючого меню користувача.

**Завдання:**
- [x] Додати `shadow-lg` замість `shadow-md` для кращого ефекту
- [x] Додати `data-[state=open]:animate-in` для анімації (вже було)
- [x] **Файл:** `client/src/shared/components/DropdownMenu.tsx`
- [x] **Статус:** ✅ Виконано

**Пріоритет:** ✅ Завершено

---

#### Етап 17: Покращення User Menu ✅ Завершено
**Опис:** Покращити вигляд та функціональність меню користувача.

**Завдання:**
- [x] Додати фон для випадаючого меню (зараз прозорий) - `bg-popover`
- [x] Додати hover ефекти на пункти меню - `focus:bg-accent`
- [x] Перевірити контрастність тексту - `text-popover-foreground`
- [x] Додати іконки до пунктів меню - `User`, `Shield`, `Package`, `LogOut`
- [x] **Файл:** `client/src/features/auth/UserMenu.tsx`, `client/src/shared/components/DropdownMenu.tsx`
- [x] **Статус:** ✅ Виконано

**Пріоритет:** ✅ Завершено

---

#### Етап 18: Landing/Dashboard сторінка ✅ Завершено
**Опис:** Стартова сторінка при першому вході в додаток.

**Концепція:**
- Привітання користувача
- Швидкий доступ до основних функцій
- Статистика (останні комплекти, розрахунки)
- Корисні посилання

**Завдання:**
- [x] Створити `DashboardPage.tsx`
- [x] Для нових користувачів - відображення повідомлення (немає комплектів)
- [x] Для існуючих - останні комплекти, швидкі дії
- [x] Додати маршрут `/dashboard` з редиректом з `/`
- [x] Інтеграція з `authStore` для отримання користувача
- [x] Додати посилання "Головна" в хедер (для всіх користувачів)
- [x] **Файли:** `client/src/pages/DashboardPage.tsx`, `client/src/app/App.tsx`, `client/src/core/constants/routes.ts`
- [x] **Статус:** ✅ Виконано

**Пріоритет:** ✅ Завершено

**Примітка:** Дашборд доступний для ВСІХ авторизованих користувачів (admin, manager, user). Після входу редирект на `/dashboard`.

---

#### Етап 19: Sidebar навігація в адмін-панелі
**Опис:** Додати лівий сайдбар з пунктами меню для адмін-панелі.

**Завдання:**
- [ ] Створити `AdminSidebar.tsx` компонент
- [ ] Пункти меню:
  - [ ] Дашборд
  - [ ] Користувачі
  - [ ] Ролі та дозволи
  - [ ] Комплекти стелажів
  - [ ] Журнал аудиту
  - [ ] Налаштування
- [ ] Оновити `AdminDashboard` з сайдбаром
- [ ] Додати active state для поточного пункту
- [ ] Responsive (ховається на мобільних)
- [ ] **Файли:** `client/src/pages/admin/AdminDashboard.tsx`, `client/src/shared/layout/Sidebar.tsx`
- [ ] **Проблема:** Sidebar існує, але не використовується в адмінці

**Пріоритет:** 🟡 Середній

---

#### Етап 20: Breadcrumbs (хлібні крихти)
**Опис:** Навігаційний ланцюжок для розуміння структури.

**Завдання:**
- [ ] Створити `Breadcrumbs.tsx` компонент
- [ ] Інтеграція з React Router
- [ ] Додати на всі основні сторінки:
  - [ ] Головна → Акумулятори → Результати
  - [ ] Головна → Стелажі → Результати
  - [ ] Головна → Мої комплекти → Деталі
  - [ ] Адмін-панель → Користувачі → Редагування
- [ ] Стилізація під дизайн системи
- [ ] **Файл:** Компонент відсутній (пошук `**/Breadcrumb*` → 0 файлів)

**Пріоритет:** 🟡 Середній

---

#### Етап 21: Заміна сторінок-заглушок
**Опис:** Всі сторінки з placeholder мають бути замінені на функціональні.

**Завдання:**
- [ ] Знайти всі сторінки-заглушки
- [ ] Створити повноцінний контент або видалити
- [ ] Перевірити всі маршрути в `App.tsx`

**Пріоритет:** 🟡 Середній

---

### 🟢 Priority 4: Polish & Maintenance (Week 6+)

#### Етап 22: Полірування UI/UX
**Опис:** Дрібні покращення для кращого користувацького досвіду.

**Завдання:**
- [ ] Додати skeleton loaders замість spinner
- [ ] Покращити toast повідомлення
- [ ] Додати анімації переходів
- [ ] Перевірити responsive на всіх сторінках
- [ ] Покращити контрастність кольорів

**Пріоритет:** 🟢 Низький

---

#### Етап 23: Тестування
**Опис:** Покриття тестами критичної функціональності.

**Завдання:**
- [ ] Unit тести для hooks (`useRackCalculator`, `useBatteryCalculator`)
- [ ] Component тести для форм
- [ ] Component тести для основних компонентів
- [ ] Integration тести для API

**Пріоритет:** 🟢 Низький

---

#### Етап 24: Документація
**Опис:** Оновлення та створення нової документації.

**Завдання:**
- [ ] Оновити `client/docs/ROUTES.md`
- [ ] Оновити `client/docs/STAGE_3_COMPLETE.md`
- [ ] Створити користувальницьку інструкцію
- [ ] Додати JSDoc для публічних API

**Пріоритет:** 🟢 Низький

---

## 📊 МЕТРИКИ ПРОЄКТУ

### Поточний статус
| Показник | Значення |
|----------|----------|
| **Завершено етапів** | 12/12 (Phase 1 & 2) |
| **Сторінок** | 20+ |
| **Компонентів** | 50+ |
| **Custom hooks** | 15+ |
| **Zustand stores** | 8 |
| **Feature slices** | 5 |

### Цілі Phase 3
| Показник | Ціль |
|----------|------|
| **Критичні баги** | 0 |
| **Завершено етапів** | 13/13 |
| **Test coverage** | > 60% |
| **Documentation** | 100% |

---

## 📅 Орієнтовні терміни

| Phase | Етапи | Термін | Статус |
|-------|-------|--------|--------|
| **Phase 1** | 1-6 | 7-28 лютого 2026 | ✅ Завершено |
| **Phase 2** | 7-12 | 1-9 березня 2026 | ✅ Завершено |
| **Phase 3** | 13-24 | 10 березня - 15 квітня 2026 | 🔄 В роботі |
| **Phase 4** | 25+ | Травень 2026+ | ⏳ Заплановано |

---

## 🎯 Пріоритети

### Високий пріоритет (Priority 1-2)
1. 🔴 **Виправити Battery Page експорт** (Критичне)
2. 🔴 **Перевірити експорт для різних ролей** (Критичне)
3. 🟠 **Soft Delete та відновлення** (Високий)
4. 🟠 **Скидання комплекту після збереження** (Високий)

### Середній пріоритет (Priority 3)
5. 🟡 **Додати час до дати в комплектах** (Середній)
6. 🟡 **Покращення User Menu** (Середній)
7. 🟡 **Landing/Dashboard сторінка** (Середній)
8. 🟡 **Sidebar в адмін-панелі** (Середній)
9. 🟡 **Breadcrumbs** (Середній)
10. 🟡 **Заміна заглушок** (Середній)

### Низький пріоритет (Priority 4)
11. 🟢 **UI/UX покращення** (Низький)
12. 🟢 **Тестування** (Низький)
13. 🟢 **Документація** (Низький)

---

## 🛠️ Корисні команди

```bash
# Розробка
npm run dev              # Запустити client + server
npm run dev:client       # Тільки client (порт 3000)

# Збірка
npm run build            # Зібрати все
npm run build:client     # Тільки client

# Тестування
npm run test             # Запустити всі тести
npm run test:watch       # Тести в режимі watch
npm run test:coverage    # Тести з coverage

# Linting & Formatting
npm run lint             # ESLint
npm run format           # Prettier
npm run typecheck        # TypeScript check
```

---

## 📚 Документація

### Client Docs
- [ROUTES.md](./client/docs/ROUTES.md)
- [STAGE_3_COMPLETE.md](./client/docs/STAGE_3_COMPLETE.md)
- [COMPONENTS.md](./client/COMPONENTS.md)
- [DESIGN_SYSTEM.md](./client/DESIGN_SYSTEM.md)

### Загальна документація
- [docs/CONVENTIONS.md](./docs/CONVENTIONS.md)
- [docs/CLIENT_AUDIT.md](./docs/CLIENT_AUDIT.md)
- [docs/AUDIT_REPORT.md](./docs/AUDIT_REPORT.md)

---

## 🏗️ Архітектура

### Структура client/src

```
client/src/
├── app/              # App.tsx, routing
├── pages/            # Сторінки (RackPage, BatteryPage, AdminDashboard)
├── features/         # Feature-slices
│   ├── auth/         # authStore, authApi, UserMenu
│   ├── rack/         # rackApi, formStore, resultsStore
│   ├── battery/      # batteryApi, useBatteryCalculator
│   ├── audit/        # auditApi, AuditLogPage
│   └── admin/        # AdminDashboard, UserManagement
├── shared/           # UI компоненти, layout
├── core/             # Constants (routes, roles)
├── hooks/            # Custom hooks (global)
├── lib/              # Axios instance, utils, logger
└── styles/           # Global styles
```

### Feature-Slice Architecture

Кожна feature має правильну структуру:

```
features/rack/
├── components/       # RackForm, RackResults, RackSetCard
├── types/            # rack.types.ts
├── hooks/            # useRackCalculator.ts
├── formStore.ts      # Zustand store
├── spansStore.ts     # Zustand store
├── resultsStore.ts   # Zustand store
├── rackApi.ts        # API client
└── index.ts          # Exports
```

---

## 🎯 Наступні кроки

1. **Терміново:** Виправити Battery Page (комплект, експорт)
2. **Терміново:** Перевірити експорт для різних ролей
3. **Високий пріоритет:** Soft Delete та відновлення
4. **Високий пріоритет:** Скидання комплекту після збереження
5. **Середній пріоритет:** Покращення UX (sidebar, breadcrumbs, dashboard)

---

**Затверджено:** 10 березня 2026
**Версія:** 4.0
**Статус:** Phase 3 🔄 В роботі (Priority-based)
