# 📡 REST API Документація

**Версія:** 2.0  
**Дата:** 8 березня 2024  
**Статус:** ✅ Впроваджено

---

## 📋 Зміни в REST API (v2.0)

### **Що змінилося:**

1. ✅ **RESTful URLs** - перехід від action-based до resource-based
2. ✅ **HTTP методи** - правильне використання GET/POST/PUT/PATCH/DELETE
3. ✅ **Статус коди** - 200, 201, 204, 400, 401, 403, 404, 409, 422, 429
4. ✅ **Уніфікований формат відповідей** - `{ data, message, timestamp }`
5. ✅ **Auth rate limiting** - 5 запитів на годину для критичних endpoint

---

## 🔐 Auth API

### **Реєстрація**
```http
POST /api/auth/users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123"
}

✅ 201 Created
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "emailVerified": false
    },
    "accessToken": "eyJhbGc..."
  },
  "message": "User registered successfully. Please verify your email.",
  "timestamp": "2024-03-08T12:00:00Z"
}

❌ 400 Bad Request
{
  "data": { "error": "Valid email is required", "code": "VALIDATION_ERROR" },
  "timestamp": "..."
}

❌ 409 Conflict
{
  "data": { "error": "User with this email already exists", "code": "USER_EXISTS" },
  "timestamp": "..."
}
```

---

### **Вхід (Login)**
```http
POST /api/auth/session
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123"
}

✅ 200 OK
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "dGVzdC0..."
  },
  "message": "Login successful",
  "timestamp": "..."
}

❌ 401 Unauthorized
{
  "data": { "error": "Invalid credentials", "code": "INVALID_CREDENTIALS" },
  "timestamp": "..."
}

❌ 429 Too Many Requests
{
  "data": { "error": "Rate limit exceeded", "code": "RATE_LIMIT_EXCEEDED" },
  "timestamp": "..."
}
```

---

### **Вихід (Logout)**
```http
DELETE /api/auth/session
Content-Type: application/json
Authorization: Bearer eyJhbGc...

{
  "refreshToken": "dGVzdC0..."
}

✅ 204 No Content

❌ 400 Bad Request
{
  "data": { "error": "Refresh token is required", "code": "VALIDATION_ERROR" },
  "timestamp": "..."
}
```

---

### **Оновлення токену**
```http
POST /api/auth/token
Content-Type: application/json

{
  "refreshToken": "dGVzdC0..."
}

✅ 200 OK
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "bmV3LXJl..."
  },
  "message": "Token refreshed successfully",
  "timestamp": "..."
}

❌ 401 Unauthorized
{
  "data": { "error": "Invalid refresh token", "code": "INVALID_TOKEN" },
  "timestamp": "..."
}
```

---

### **Підтвердження email**
```http
POST /api/auth/email/verify
Content-Type: application/json

{
  "token": "abc123..."
}

✅ 200 OK
{
  "data": { "verified": true },
  "message": "Email verified successfully",
  "timestamp": "..."
}

❌ 400 Bad Request
{
  "data": { "error": "Invalid or expired token", "code": "INVALID_TOKEN" },
  "timestamp": "..."
}
```

---

### **Повторна відправка підтвердження**
```http
POST /api/auth/email/verification
Content-Type: application/json

{
  "email": "user@example.com"
}

✅ 202 Accepted
{
  "data": { "sent": true },
  "message": "Verification email sent",
  "timestamp": "..."
}
```

---

### **Запит на скидання пароля (Forgot Password)**
```http
POST /api/auth/password-resets
Content-Type: application/json

{
  "email": "user@example.com"
}

✅ 202 Accepted
{
  "data": { "requested": true },
  "message": "If the email exists, a password reset link has been sent",
  "timestamp": "..."
}

ℹ️ Примітка: Не показуємо чи існує користувач (безпека)
```

---

### **Скидання пароля з токеном (Reset Password)**
```http
PUT /api/auth/password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "NewStrongPass123"
}

✅ 200 OK
{
  "data": { "changed": true },
  "message": "Password reset successfully",
  "timestamp": "..."
}

❌ 400 Bad Request
{
  "data": { "error": "Password must be at least 8 characters", "code": "WEAK_PASSWORD" },
  "timestamp": "..."
}

❌ 400 Bad Request
{
  "data": { "error": "Password must contain uppercase, lowercase and number", "code": "WEAK_PASSWORD" },
  "timestamp": "..."
}

❌ 400 Bad Request
{
  "data": { "error": "Invalid reset token", "code": "INVALID_TOKEN" },
  "timestamp": "..."
}

❌ 400 Bad Request
{
  "data": { "error": "Reset token expired", "code": "TOKEN_EXPIRED" },
  "timestamp": "..."
}
```

---

### **Зміна пароля (Change Password)**
```http
PATCH /api/auth/password
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewStrongPass123"
}

✅ 200 OK
{
  "data": { "changed": true },
  "message": "Password changed successfully",
  "timestamp": "..."
}

❌ 401 Unauthorized
{
  "data": { "error": "Current password is incorrect", "code": "INVALID_PASSWORD" },
  "timestamp": "..."
}
```

---

### **Отримати поточного користувача**
```http
GET /api/auth/me
Authorization: Bearer eyJhbGc...

✅ 200 OK
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "permissions": {
        "show_retail": true,
        "show_wholesale": false
      },
      "emailVerified": true
    }
  },
  "timestamp": "..."
}

❌ 401 Unauthorized
{
  "data": { "error": "Unauthorized", "code": "UNAUTHORIZED" },
  "timestamp": "..."
}
```

---

### **Створення користувача адміном**
```http
POST /api/auth/admin/users
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "StrongPass123",
  "role": "manager",
  "permissions": {
    "show_zero": true,
    "show_no_isolators": true
  }
}

✅ 201 Created
{
  "data": {
    "user": {
      "id": 2,
      "email": "newuser@example.com",
      "role": "manager"
    }
  },
  "message": "User created successfully",
  "timestamp": "..."
}

❌ 403 Forbidden
{
  "data": { "error": "Admin access required", "code": "FORBIDDEN" },
  "timestamp": "..."
}
```

---

## 📊 Статус коди

| Код | Назва | Коли використовується |
|-----|-------|----------------------|
| 200 | OK | Успішний GET/PUT/PATCH |
| 201 | Created | Успішне створення (POST) |
| 202 | Accepted | Запит прийнято (async обробка) |
| 204 | No Content | Успішне видалення (DELETE) |
| 400 | Bad Request | Помилка валідації |
| 401 | Unauthorized | Неавторизовано |
| 403 | Forbidden | Недостатньо прав |
| 404 | Not Found | Ресурс не знайдено |
| 409 | Conflict | Конфлікт (напр. email існує) |
| 422 | Unprocessable Entity | Помилка валідації (детальна) |
| 429 | Too Many Requests | Rate limit |
| 500 | Internal Server Error | Помилка сервера |

---

## 🔒 Rate Limiting

### **Global Limiter**
- **100 запитів** за **15 хвилин**

### **Auth Limiter** (критичні endpoint)
- **5 запитів** за **1 годину**

**Endpoint з auth limiter:**
- `POST /api/auth/users` (register)
- `POST /api/auth/session` (login)
- `DELETE /api/auth/session` (logout)
- `POST /api/auth/token` (refresh)
- `POST /api/auth/password-resets` (forgot)
- `PUT /api/auth/password` (reset)
- `PATCH /api/auth/password` (change)
- `POST /api/auth/email/verify` (verify)
- `POST /api/auth/email/verification` (resend)

---

## 📦 Формат відповідей

### **Успішна відповідь:**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com"
  },
  "message": "Success",
  "timestamp": "2024-03-08T12:00:00Z"
}
```

### **Помилка:**
```json
{
  "data": {
    "error": "Error message",
    "code": "ERROR_CODE"
  },
  "timestamp": "2024-03-08T12:00:00Z"
}
```

### **З пагінацією:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "timestamp": "..."
}
```

---

## 🆙 Міграція з v1 на v2

### **Зміни URL:**

| v1 (старий) | v2 (новий) |
|-------------|------------|
| `POST /api/auth/register` | `POST /api/auth/users` |
| `POST /api/auth/login` | `POST /api/auth/session` |
| `POST /api/auth/logout` | `DELETE /api/auth/session` |
| `POST /api/auth/refresh` | `POST /api/auth/token` |
| `POST /api/auth/verify-email` | `POST /api/auth/email/verify` |
| `POST /api/auth/resend-verification` | `POST /api/auth/email/verification` |
| `POST /api/auth/forgot-password` | `POST /api/auth/password-resets` |
| `POST /api/auth/reset-password` | `PUT /api/auth/password` |
| `POST /api/auth/change-password` | `PATCH /api/auth/password` |

### **Зміни у відповідях:**

**v1:**
```json
{
  "user": { "id": 1, "email": "..." },
  "accessToken": "..."
}
```

**v2:**
```json
{
  "data": {
    "user": { "id": 1, "email": "..." },
    "accessToken": "..."
  },
  "message": "...",
  "timestamp": "..."
}
```

### **Клієнтська сумісність:**

```typescript
// ✅ Зворотня сумісність в authApi.ts
return data.data || data;  // Працює з v1 і v2
```

---

## 📚 Додаткові ресурси

- [API Response Helper](../src/helpers/apiResponse.js)
- [Auth Routes](../src/routes/auth.js)
- [Rate Limiting Config](../src/index.js)

---

**Останнє оновлення:** 8 березня 2024  
**Версія API:** 2.0 (RESTful)
