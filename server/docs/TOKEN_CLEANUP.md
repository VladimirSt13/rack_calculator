# 🧹 Token Cleanup (Очищення токенів)

**Дата створення:** 8 березня 2026  
**Версія:** 1.0

---

## 📋 Опис

Автоматичне очищення застарілих refresh токенів з бази даних для:
- Звільнення місця в БД
- Підвищення безпеки (видалення недійсних токенів)
- Оптимізації продуктивності запитів

---

## ⚙️ Налаштування

### Змінні оточення (.env)

```env
# Увімкнути/вимкнути очищення
TOKEN_CLEANUP_ENABLED=true

# Розклад за допомогою Cron
# Формат: секунда хвилина день місяць день тижня
TOKEN_CLEANUP_SCHEDULE=0 3 * * 0  # Кожну неділю о 03:00

# Кількість днів зберігання токенів
TOKEN_CLEANUP_DAYS=30
```

### Cron розклади

| Розклад | Опис |
|---------|------|
| `0 3 * * 0` | Кожну неділю о 03:00 |
| `0 2 * * *` | Щодня о 02:00 |
| `0 3 1 * *` | Першого числа кожного місяця о 03:00 |

---

## 🚀 Використання

### Автоматичне очищення (Cron)

Очищення виконується автоматично за розкладом, вказаним в `.env`.

### Ручне очищення

```bash
# Очистити токени старіше 30 днів (за замовчуванням)
npm run token:cleanup

# Очистити токени старіше вказаної кількості днів
npm run token:cleanup 60
```

---

## 📊 Міграція БД

Таблиця `refresh_tokens` вже має індекс для оптимізації видалення:

```sql
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires 
ON refresh_tokens(expires_at);
```

---

## 🔧 Логіка роботи

1. **Cron планувальник** перевіряє розклад кожної хвилини
2. **Запуск очищення** коли настає запланований час
3. **SQL запит** видаляє токени з `expires_at < NOW() - TOKEN_CLEANUP_DAYS`
4. **Логгування** результату в консоль

### Приклад логу

```
[Token Cleanup] Started
[Token Cleanup] Deleted 15 expired tokens
[Token Cleanup] Completed in 12ms
```

---

## 🔐 Безпека

### Чому це важливо?

- **Старі токени** можуть бути скомпрометовані
- **Збільшення БД** сповільнює запити
- **GDPR compliance** - зберігання тільки необхідних даних

### Рекомендації

- Зберігати токени не довше **30 днів**
- Запускати очищення **щотижня** (неділя 03:00)
- Моніторити кількість видалених токенів

---

## 📝 Скрипт

**Файл:** `server/scripts/token-cleanup.js`

```javascript
import { db } from '../src/db/index.js';

const days = process.argv[2] || 30;
const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const result = db.prepare(`
  DELETE FROM refresh_tokens
  WHERE expires_at < ?
`).run(cutoffDate.toISOString());

console.log(`Deleted ${result.changes} expired tokens`);
```

---

## 🧪 Тестування

### Перевірка роботи

```bash
# 1. Створити тестові токени
# 2. Запустити очищення
npm run token:cleanup 0  # Видалити всі прострочені

# 3. Перевірити БД
sqlite3 data/database.db "SELECT COUNT(*) FROM refresh_tokens;"
```

---

## 📚 Пов'язана документація

- [AUDIT_MANAGEMENT.md](./AUDIT_MANAGEMENT.md) - Аудит лог
- [ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md) - Ролі та дозволи
- [PASSWORD_RESET.md](./PASSWORD_RESET.md) - Скидання пароля

---

## 🐛 Вирішення проблем

### Помилка: "Database is locked"

**Причина:** Інший процес використовує БД

**Рішення:**
```bash
# Зупинити сервер
# Запустити очищення
npm run token:cleanup
# Запустити сервер
```

### Помилка: "Table refresh_tokens not found"

**Причина:** Міграції не виконані

**Рішення:**
```bash
npm run migrate
```

---

**Останнє оновлення:** 8 березня 2026
