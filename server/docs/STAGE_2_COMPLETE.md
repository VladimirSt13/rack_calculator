# ✅ Етап 2 завершено

**Дата виконання:** 7 березня 2026  
**Статус:** Виконано повністю

---

## 📦 Створені файли

### Контролери
- ✅ `server/src/controllers/authController.js` - Розширена логіка авторизації

### Helper-и
- ✅ `server/src/helpers/email.js` - Відправка email (підтвердження, скидання пароля, запрошення)

### Middleware
- ✅ `server/src/middleware/auth.js` - Оновлено для кращої обробки помилок

### Routes
- ✅ `server/src/routes/auth.js` - Оновлено з використанням контролера

### Конфігурація
- ✅ `server/.env.example` - Додано змінні для SMTP

### Залежності
- ✅ `nodemailer` - встановлено

---

## 🔐 Функціонал авторизації

### 1. Реєстрація з перевіркою домену

**Endpoint:** `POST /api/auth/register`

**Вимоги:**
- Email має закінчуватися на `@accu-energo.com.ua`
- Пароль мінімум 6 символів
- Перший користувач автоматично стає адміном

**Відповідь:**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": { "id": 1, "email": "user@accu-energo.com.ua", "role": "admin" },
  "accessToken": "eyJ...",
  "refreshToken": "abc123...",
  "emailVerified": false
}
```

---

### 8. Відновлення пароля

#### Запит на скидання пароля

**Endpoint:** `POST /api/auth/forgot-password`

**Тіло запиту:**
```json
{
  "email": "user@accu-energo.com.ua"
}
```

**Відповідь:**
```json
{
  "message": "If the email exists, a password reset link has been sent",
  "code": "EMAIL_SENT"
}
```

#### Скидання пароля з токеном

**Endpoint:** `POST /api/auth/reset-password`

**Тіло запиту:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newPassword123"
}
```

**Відповідь:**
```json
{
  "message": "Password reset successfully"
}
```

#### Зміна пароля (для авторизованого)

**Endpoint:** `POST /api/auth/change-password`

**Auth:** Потрібен

**Тіло запиту:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Відповідь:**
```json
{
  "message": "Password changed successfully"
}
```

**Особливості:**
- Токен скидання пароля дійсний 1 годину
- Після скидання всі refresh токени відкликаються
- Audit log записується

---

### 2. Вхід з перевіркою email

**Endpoint:** `POST /api/auth/login`

**Вимоги:**
- Email має бути підтверджений
- Пароль вірний

**Відповідь:**
```json
{
  "message": "Login successful",
  "user": { 
    "id": 1, 
    "email": "user@accu-energo.com.ua", 
    "role": "admin",
    "permissions": { "price_types": [...] }
  },
  "accessToken": "eyJ...",
  "refreshToken": "xyz789...",
  "emailVerified": true
}
```

---

### 3. Refresh token

**Endpoint:** `POST /api/auth/refresh`

**Тіло запиту:**
```json
{
  "refreshToken": "xyz789..."
}
```

**Відповідь:**
```json
{
  "accessToken": "new_eyJ...",
  "refreshToken": "new_xyz789..."
}
```

**Особливості:**
- Refresh token ротується (новий при кожному оновленні)
- Старий токен відкликається
- Термін дії: 30 днів

---

### 4. Підтвердження email

**Endpoint:** `POST /api/auth/verify-email`

**Тіло запиту:**
```json
{
  "token": "verification_token_from_email"
}
```

**Відповідь:**
```json
{
  "message": "Email verified successfully"
}
```

---

### 5. Повторна відправка підтвердження

**Endpoint:** `POST /api/auth/resend-verification`

**Тіло запиту:**
```json
{
  "email": "user@accu-energo.com.ua"
}
```

---

### 6. Вихід

**Endpoint:** `POST /api/auth/logout`

**Тіло запиту:**
```json
{
  "refreshToken": "xyz789..."
}
```

---

### 7. Створення користувача адміном

**Endpoint:** `POST /api/auth/admin/create-user`

**Auth:** Admin only

**Тіло запиту:**
```json
{
  "email": "any_email@example.com",
  "password": "password123",
  "role": "manager",
  "permissions": {
    "price_types": ["нульова", "загальна"]
  }
}
```

**Особливості:**
- Адмін може створювати користувачів з будь-якою поштою
- Email автоматично підтверджується
- Можна вказати роль та permissions

---

## 📧 Email розсилка

### Налаштування SMTP

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=Rack Calculator <noreply@example.com>
FRONTEND_URL=http://localhost:3000
```

### Для Gmail

1. Увімкнути 2FA в обліковому записі Google
2. Створити App Password: https://myaccount.google.com/apppasswords
3. Використовувати App Password як `SMTP_PASS`

### Dev режим

Якщо SMTP не налаштовано, токени виводяться в консоль:

```
[Email] Verification token (dev mode): abc123...
[Email] Verification link (dev mode): http://localhost:3000/verify-email?token=abc123...
```

---

## 🔒 Безпека

### Access Token
- **Термін дії:** 15 хвилин
- **Алгоритм:** HS256
- **Зберігання:** Memory/LocalStorage або Cookie

### Refresh Token
- **Термін дії:** 30 днів
- **Зберігання:** HTTP-only cookie
- **Ротація:** Новий токен при кожному оновленні

### Паролі
- **Хешування:** bcrypt (12 раундів)
- **Мінімальна довжина:** 6 символів

### Email Verification
- **Термін дії токену:** 24 години
- **Одноразовий:** Токен видаляється після використання

---

## 🧪 Тестування

### 1. Реєстрація

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@accu-energo.com.ua",
    "password": "password123"
  }'
```

### 2. Вхід

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@accu-energo.com.ua",
    "password": "password123"
  }'
```

### 3. Refresh token

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

### 4. Підтвердження email

```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification_token_from_email"
  }'
```

### 5. Створення користувача (адмін)

```bash
curl -X POST http://localhost:3001/api/auth/admin/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "manager@example.com",
    "password": "password123",
    "role": "manager",
    "permissions": {
      "price_types": ["нульова"]
    }
  }'
```

---

## 📊 Структура БД (оновлення)

### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'other' CHECK(role IN ('admin', 'manager', 'other')),
  permissions JSON,
  email_verified BOOLEAN DEFAULT 0,
  verification_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### refresh_tokens
```sql
CREATE TABLE refresh_tokens (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### email_verifications
```sql
CREATE TABLE email_verifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🎯 Готовність до наступного етапу

### Виконано:
- ✅ Реєстрація з перевіркою домену
- ✅ Вхід з перевіркою email
- ✅ Refresh token логіка
- ✅ Email verification
- ✅ Створення користувачів адміном
- ✅ Audit логування
- ✅ Email розсилка

### До Етапу 3 готово:
- ✅ Auth controller з повною логікою
- ✅ Email helper для розсилок
- ✅ Refresh token система
- ✅ Middleware для перевірки ролей

---

## 📝 Наступний етап: Етап 3

**Авторизація на клієнті**

### Завдання:
- [ ] Створити authStore (Zustand) з refresh token
- [ ] Створити authApi
- [ ] Створити LoginPage
- [ ] Створити RegisterPage
- [ ] Створити VerifyEmailPage
- [ ] Створити ProtectedRoute
- [ ] Додати авто-оновлення токену
- [ ] Додати перевірку авторизації в App.tsx

### Файли які будуть створені:
- `client/src/features/auth/authStore.ts`
- `client/src/features/auth/authApi.ts`
- `client/src/features/auth/ProtectedRoute.tsx`
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/RegisterPage.tsx`
- `client/src/pages/VerifyEmailPage.tsx`
