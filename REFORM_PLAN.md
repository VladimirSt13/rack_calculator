# 📋 Плани міграції та рефакторингу

**Дата створення:** 15 березня 2026  
**Гілка:** `feature/change-db-to-mongodb`

---

## 🎯 Огляд

Цей проект передбачає повний рефакторинг серверної частини з трьома основними змінами:

1. **Міграція БД:** SQLite → MongoDB
2. **Міграція мови:** JavaScript → TypeScript
3. **Зміна архітектури:** Layer-Based → Feature-Based + Repository Pattern

---

## 📚 Документація

### Основні плани

| Документ | Опис | Термін |
|----------|------|--------|
| [MONGODB_MIGRATION_PLAN.md](./MONGODB_MIGRATION_PLAN.md) | 🍄 Міграція з SQLite на MongoDB | 2-3 тижні |
| [TYPESCRIPT_REFACTORING_PLAN.md](./TYPESCRIPT_REFACTORING_PLAN.md) | 📘 Міграція на TypeScript | 2-3 тижні |
| [FEATURE_BASED_STRUCTURE.md](./FEATURE_BASED_STRUCTURE.md) | 📁 Feature-Based структура проекту | 1-2 тижні |

### Додаткова документація

| Документ | Опис |
|----------|------|
| [plan-server.md](./plan-server.md) | Поточний план розробки сервера |
| [plan-client.md](./plan-client.md) | План розробки клієнта |
| [README.md](./README.md) | Загальна документація проекту |

---

## 🏗️ Архітектурні зміни

### Було (3 шари, Layer-Based, JavaScript, SQLite)

```
Routes → Controllers → Services → Models (SQLite)
```

**Структура:**
```
server/
├── controllers/
├── services/
├── models/
└── routes/
```

### Стане (4 шари, Feature-Based, TypeScript, MongoDB)

```
Routes → Controllers → Services → Repositories → MongoDB
              ↓              ↓             ↓
            DTOs          DTOs/Types    Models
```

**Структура:**
```
server/
├── modules/
│   ├── auth/
│   ├── users/
│   └── ...
├── database/
│   ├── models/
│   └── repositories/
├── common/
│   ├── types/
│   ├── middleware/
│   └── utils/
└── config/
```

---

## 🔄 Етапи рефакторингу

### Етап 1: Підготовка (1-2 дні)

- [ ] Встановлення залежностей (TypeScript, Mongoose)
- [ ] Створення `tsconfig.json`
- [ ] Налаштування `.env` для MongoDB
- [ ] Встановлення MongoDB локально

### Етап 2: Створення структури (2-3 дні)

- [ ] Створення папки `modules/`
- [ ] Створення папки `database/`
- [ ] Створення папки `common/`
- [ ] Створення `BaseRepository`

### Етап 3: MongoDB схеми (3-4 дні)

- [ ] User model
- [ ] Role model
- [ ] Permission model
- [ ] Price model
- [ ] AuditLog model
- [ ] RefreshToken model
- [ ] EmailVerification model
- [ ] PasswordReset model
- [ ] RackSet model
- [ ] RackSetRevision model
- [ ] RackConfiguration model
- [ ] Calculation model

### Етап 4: DTO та Типи (2-3 дні)

- [ ] Auth DTOs (Login, Register, Refresh, Response)
- [ ] Users DTOs (Create, Update, Response, Query)
- [ ] Common types (API Response, Pagination, Error)
- [ ] Service layer types
- [ ] Repository layer types

### Етап 5: Створення модулів (8-10 днів)

- [ ] Auth module
- [ ] Users module
- [ ] Roles module
- [ ] Prices module
- [ ] RackConfigurations module
- [ ] RackSets module
- [ ] Calculations module
- [ ] Battery module
- [ ] Export module
- [ ] Audit module

### Етап 6: Міграція даних (2-3 дні)

- [ ] Створення скрипту міграції
- [ ] Міграція тестових даних
- [ ] Перевірка цілісності
- [ ] Створення бекапу SQLite

### Етап 7: Тестування (3-4 дні)

- [ ] Typecheck (`tsc --noEmit`)
- [ ] Unit тести для сервісів
- [ ] Integration тести для API
- [ ] Ручне тестування функціональності

### Етап 8: Деплой (1-2 дні)

- [ ] MongoDB Atlas налаштування
- [ ] Оновлення змінних оточення
- [ ] Деплой на production
- [ ] Моніторинг продуктивності

---

## 📅 Загальний план

| Етап | Опис | Термін | Пріоритет |
|------|------|--------|-----------|
| **1** | Підготовка | 1-2 дні | 🔴 Високий |
| **2** | Структура | 2-3 дні | 🔴 Високий |
| **3** | MongoDB схеми | 3-4 дні | 🔴 Високий |
| **4** | DTO та Типи | 2-3 дні | 🔴 Високий |
| **5** | Модулі | 8-10 днів | 🔴 Високий |
| **6** | Міграція даних | 2-3 дні | 🔴 Високий |
| **7** | Тестування | 3-4 дні | 🔴 Високий |
| **8** | Деплой | 1-2 дні | 🟠 Середній |

**Загальний термін:** **22-31 днів** (3-4 тижні)

---

## 🎯 Очікувані результати

### Після завершення

✅ **TypeScript:**
- Повна типізація всього коду
- Автодоповнення в IDE
- Менше багів на етапі розробки

✅ **MongoDB:**
- Гнучка схема
- Краща масштабованість
- Нативна підтримка JSON

✅ **Repository Pattern:**
- Ізоляція роботи з БД
- Легше тестувати
- Можливість замінити БД

✅ **Feature-Based:**
- Краща організація коду
- Легша навігація
- Простіший code review

---

## ⚠️ Ризики

### Ризик 1: Втрата даних при міграції

**Мітігація:**
- Повний бекап SQLite БД
- Тестова міграція на копії даних
- Перевірка цілісності після міграції

### Ризик 2: Несумісність типів

**Мітігація:**
- Поступова міграція модуль за модулем
- Тестування кожного модуля окремо
- Можливість відкотитися до JavaScript

### Ризик 3: Продуктивність

**Мітігація:**
- Створення індексів на MongoDB
- Використання `.lean()` для великих вибірок
- Моніторинг після деплою

---

## 📦 Встановлення та запуск

### Вимоги

- Node.js >= 18.0.0
- MongoDB >= 7.0
- npm >= 9.0.0

### Встановлення

```bash
# Встановлення всіх залежностей
npm run install:all

# Запуск MongoDB (локально)
mongod --config /usr/local/etc/mongod.conf

# Запуск дев-режиму
npm run dev
```

### Тестування

```bash
# Typecheck
npm run typecheck

# Unit тести
npm run test:unit

# Integration тести
npm run test:integration
```

---

## 📚 Корисні ресурси

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### MongoDB
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [MongoDB Docs](https://www.mongodb.com/docs/)

### Repository Pattern
- [Repository Pattern](https://www.dotnettricks.com/learn/repository-pattern)
- [Mongoose Best Practices](https://mongoosejs.com/docs/guide.html)

---

## 📞 Контакти

**Виконавець:** Алиса  
**Email:** [your-email@example.com](mailto:your-email@example.com)  
**GitHub:** [your-username](https://github.com/your-username)

---

**Останнє оновлення:** 15 березня 2026  
**Статус:** Планування
