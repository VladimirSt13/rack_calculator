# 🚀 Деплой на Render + Supabase

Повна інструкція з розгортання додатку на безкоштовних тарифах Render та Supabase.

## 📋 Архітектура

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│   Supabase      │
│   (Static)      │     │   (Web Service)  │     │   (PostgreSQL)  │
│   Render.com    │     │   Render.com     │     │   Database      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 📌 Крок 1: Підготовка Supabase

### 1.1 Створення проєкту

1. Зайди на https://supabase.com
2. **Start your project** → **New project**
3. Заповни:
   - **Name:** `rack-calculator`
   - **Database Password:** збережи у надійному місці
   - **Region:** `Frankfurt (eu-central-1)` (найближча до України)
4. **Create new project**

### 1.2 Отримання рядка підключення

1. У dashboard проєкту: **Settings** (шестерня зліва)
2. **Database**
3. У секції **Connection string** обери **URI**
4. Скопіюй рядок:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. ⚠️ **Важливо:** Заміни `[YOUR-PASSWORD]` на свій пароль від БД

### 1.3 Налаштування CORS (опціонально)

Якщо плануються запити з фронтенду напряму до Supabase:

```sql
-- Виконати в SQL Editor
ALTER DATABASE postgres SET "app.settings.cors_origins" TO 'https://rack-calculator.onrender.com';
```

---

## 📌 Крок 2: Підготовка Render

### 2.1 Реєстрація

1. Зайди на https://render.com
2. **Sign up with GitHub** (рекомендовано) або email

### 2.2 Створення Web Service (Backend)

1. **New +** → **Web Service**
2. Підключи репозиторій `rack_calculator`
3. Заповни:
   ```
   Name: rack-calculator-api
   Region: Frankfurt, Germany
   Branch: production-render-supabase
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```
4. **Environment Variables** → **Add Environment Variable**:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   JWT_SECRET=твій_випадковий_секрет_мінімум_32_символи
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   CORS_ORIGIN=https://rack-calculator-web.onrender.com
   PORT=3001
   HOST=0.0.0.0
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   AUDIT_CLEANUP_ENABLED=true
   AUDIT_CLEANUP_SCHEDULE=0 2 * * 0
   AUDIT_CLEANUP_DAYS=90
   ```
5. **Advanced** → залишити за замовчуванням
6. **Create Web Service**

### 2.3 Перевірка Backend

Після деплою:
1. Відкрий URL сервісу (на кшталт `https://rack-calculator-api.onrender.com`)
2. Перевір health endpoint: `https://rack-calculator-api.onrender.com/api/health`
3. Має повернутися: `{"status":"ok",...}`

### 2.4 Міграції на Supabase

Підключись до сервера через SSH або локально з продакшен змінними:

```bash
# Встановити змінні оточення
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
export NODE_ENV=production

# Запустити міграції
cd server
npm run migrate:postgres
```

Або через Render Dashboard:
1. Web Service → **Shell**
2. Виконати:
   ```bash
   cd server
   npm run migrate:postgres
   ```

### 2.5 Створення адміна

```bash
# Через Shell на Render
cd server
npm run seed:admin
```

Запиши згенерований пароль!

---

## 📌 Крок 3: Створення Static Site (Frontend)

### 3.1 Створення

1. **New +** → **Static Site**
2. Підключи той самий репозиторій
3. Заповни:
   ```
   Name: rack-calculator-web
   Region: Frankfurt, Germany
   Branch: production-render-supabase
   Root Directory: client
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. **Environment Variables** → **Add Environment Variable**:
   ```
   VITE_API_URL=https://rack-calculator-api.onrender.com
   ```
5. **Create Static Site**

### 3.2 Перевірка Frontend

Після деплою:
1. Відкрий URL сайту (на кшталт `https://rack-calculator-web.onrender.com`)
2. Перевір, що додаток завантажується
3. Спробуй залогінитися з обліковими даними адміна

---

## 📌 Крок 4: Оновлення CORS

Після того, як фронтенд отримав URL:

1. Зайди на Render → Web Service → **Environment**
2. Онови `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://rack-calculator-web.onrender.com
   ```
3. **Save Changes**
4. Сервіс автоматично перезапуститься

---

## 📌 Крок 5: Фінальна перевірка

### Checklist

- [ ] Backend доступний за URL
- [ ] `/api/health` повертає `{"status":"ok"}`
- [ ] Swagger доступний за `/api-docs`
- [ ] Frontend завантажується
- [ ] Можна залогінитися
- [ ] Розрахунки працюють
- [ ] Дані зберігаються в Supabase

### Перевірка Supabase

1. Зайди на Supabase Dashboard
2. **Table Editor**
3. Перевір наявність таблиць:
   - `users`
   - `calculations`
   - `rack_sets`
   - `roles_permissions`
   - `audit_log`
   - інші...

---

## 🔧 Корисні команди

### Локальна розробка з продакшен БД

```bash
# .env сервера
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
NODE_ENV=development

# Запуск
npm run dev:server
```

⚠️ **Увага:** Не використовуй продакшен БД для тестування! Створи окрему тестову БД.

### Локальні міграції (SQLite)

```bash
npm run migrate:sqlite
```

### Продакшен міграції (PostgreSQL)

```bash
# Локально з продакшен змінними
export DATABASE_URL="..."
npm run migrate:postgres
```

---

## 🆓 Обмеження безкоштовних тарифів

### Render Web Service (Free)

- ⚠️ **750 годин/місяць** (один інстанс постійно)
- ⚠️ **Засинає** після 15 хв без активності
- ⚠️ **Пробудження** ~30 секунд
- ✅ HTTPS включено
- ✅ Автоматичний деплой з GitHub

### Render Static Site (Free)

- ✅ **Не засинає**
- ✅ **100 ГБ** трафіку на місяць
- ✅ HTTPS включено
- ✅ Автоматичний деплой

### Supabase (Free)

- ✅ **500 MB** бази даних
- ✅ **50 000** щомісячних активних користувачів
- ✅ **2 GB** пропускої здатності
- ✅ Бездіяльність не впливає

---

## 🚨 Вирішення проблем

### Backend засинає

**Проблема:** Після 15 хв бездіяльності сервер "засинає"

**Рішення:**
1. Використовувати сервіс на кшталт [UptimeRobot](https://uptimerobot.com) для ping кожні 5 хв
2. Або перейти на платний тариф Render ($7/місяць)

### Помилки CORS

**Проблема:** Frontend не може підключитися до Backend

**Рішення:**
1. Перевір `CORS_ORIGIN` у змінних оточення Backend
2. Має бути точною URL Frontend (без слеша в кінці)
3. Перезапусти Backend після змін

### Помилки бази даних

**Проблема:** `DATABASE_URL not provided`

**Рішення:**
1. Перевір наявність змінної `DATABASE_URL` на Render
2. Переконайся, що рядок підключення правильний
3. Перевір пароль у Supabase Dashboard

### Міграції не працюють

**Проблема:** `relation already exists`

**Рішення:**
```sql
-- Видалити всі таблиці (УВАГА: це видалить всі дані!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Запустити міграції заново
npm run migrate:postgres
```

---

## 📚 Додаткові ресурси

- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 🎯 Наступні кроки

1. Налаштувати домен (опціонально)
2. Налаштувати email для відновлення пароля
3. Додати моніторинг (Sentry, LogRocket)
4. Налаштувати резервне копіювання Supabase

---

**🎉 Вітаю! Твій додаток тепер у продакшені!**
