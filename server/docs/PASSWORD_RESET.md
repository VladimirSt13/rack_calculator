# 🔐 Відновлення пароля

## Огляд

Система відновлення пароля дозволяє користувачам скинути забутий пароль через email.

## Endpoint'и

### 1. Запит на скидання пароля

**Endpoint:** `POST /api/auth/forgot-password`

**Auth:** Не потрібен

**Тіло запиту:**
```json
{
  "email": "user@accu-energo.com.ua"
}
```

**Відповідь (успіх):**
```json
{
  "message": "If the email exists, a password reset link has been sent",
  "code": "EMAIL_SENT"
}
```

**Особливості:**
- Не показуємо чи існує користувач (безпека)
- Токен дійсний 1 годину
- Email відправляється з посиланням на скидання

---

### 2. Скидання пароля з токеном

**Endpoint:** `POST /api/auth/reset-password`

**Auth:** Не потрібен

**Тіло запиту:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newPassword123"
}
```

**Відповідь (успіх):**
```json
{
  "message": "Password reset successfully"
}
```

**Помилки:**
```json
// Невірний токен
{
  "error": "Invalid reset token",
  "code": "INVALID_TOKEN"
}

// Токен термін дії минув
{
  "error": "Reset token expired",
  "code": "TOKEN_EXPIRED"
}

// Слабкий пароль
{
  "error": "Password must be at least 6 characters",
  "code": "WEAK_PASSWORD"
}
```

**Особливості:**
- Після скидання всі refresh токени відкликаються
- Токен видаляється після використання
- Audit log записується

---

### 3. Зміна пароля (для авторизованого)

**Endpoint:** `POST /api/auth/change-password`

**Auth:** Потрібен (access token)

**Тіло запиту:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Відповідь (успіх):**
```json
{
  "message": "Password changed successfully"
}
```

**Помилки:**
```json
// Невірний поточний пароль
{
  "error": "Current password is incorrect",
  "code": "INVALID_PASSWORD"
}
```

---

## Flow відновлення пароля

```
1. Користувач натискає "Забули пароль?"
   ↓
2. Вводить email → POST /api/auth/forgot-password
   ↓
3. Отримує email з посиланням
   ↓
4. Переходить за посиланням (/reset-password?token=xxx)
   ↓
5. Вводить новий пароль → POST /api/auth/reset-password
   ↓
6. Пароль змінено, всі сесії скасовано
   ↓
7. Користувач входить з новим паролем
```

---

## Email шаблон

**Тема:** Скидання пароля - Rack Calculator

**Зміст:**
- Посилання на скидання пароля
- Термін дії: 1 година
- Інструкція що робити якщо не запитували скидання

---

## Безпека

### Токени

- **Довжина:** 32 байти (64 hex символи)
- **Хешування:** SHA-256 перед збереженням
- **Термін дії:** 1 година
- **Одноразові:** видаляються після використання

### Захист від brute-force

- Не показуємо чи існує email
- Однакові відповіді для існуючих і неіснуючих email
- Audit log всіх спроб

### Після скидання

- Всі refresh токени відкликаються
- Користувач має увійти знову
- Audit log записується

---

## Приклад використання на клієнті

### Forgot Password Page

```tsx
const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  
  const mutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => setSent(true),
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(email);
  };
  
  if (sent) {
    return (
      <div>
        <h2>Лист відправлено</h2>
        <p>Перевірте свою пошту для скидання пароля</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Забули пароль?</h2>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
      />
      <Button type="submit">Відправити посилання</Button>
    </form>
  );
};
```

### Reset Password Page

```tsx
const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const token = useSearchParams().get('token');
  
  const mutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Пароль змінено');
      navigate('/login');
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Паролі не співпадають');
      return;
    }
    mutation.mutate({ token: token!, password });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Новий пароль</h2>
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Новий пароль"
      />
      <Input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Підтвердіть пароль"
      />
      <Button type="submit">Змінити пароль</Button>
    </form>
  );
};
```

### Change Password (в профілі)

```tsx
const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const mutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Пароль змінено');
      setCurrentPassword('');
      setNewPassword('');
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ currentPassword, newPassword });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h3>Зміна пароля</h3>
      <Input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Поточний пароль"
      />
      <Input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Новий пароль"
      />
      <Button type="submit">Змінити</Button>
    </form>
  );
};
```

---

## API Client

```typescript
// client/src/features/auth/authApi.ts

export const authApi = {
  // ... інші методи
  
  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },
};
```

---

## Тестування

### Forgot Password

```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@accu-energo.com.ua"}'
```

### Reset Password

```bash
# Отримати токен з БД (dev режим)
sqlite3 data/rack_calculator.db "SELECT token_hash FROM password_resets WHERE user_id=1"

# Скинути пароль
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"abc123...","newPassword":"newPassword123"}'
```

### Change Password

```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"currentPassword":"oldPass123","newPassword":"newPass123"}'
```

---

## База даних

### password_resets

```sql
CREATE TABLE password_resets (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token_hash ON password_resets(token_hash);
```

---

## Troubleshooting

### Email не приходить

1. Перевірте SMTP налаштування в `.env`
2. Перевірте spam папку
3. У dev режимі токен виводиться в консоль сервера

### Token expired

- Токен дійсний 1 годину
- Запросіть новий токен

### Invalid token

- Переконайтеся що токен скопійований повністю
- Token hash зберігається в БД (SHA-256)
